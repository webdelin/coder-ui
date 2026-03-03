import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'
import { useConversationsStore } from './conversations'

export interface ChatMessage {
  id: string
  conversationId: string
  role: string
  content: string
  model?: string | null
  provider?: string | null
  tokensUsed?: number | null
  durationMs?: number | null
  createdAt: string
}

export const useChatStore = defineStore('chat', () => {
  const settings = useSettingsStore()
  const conversationsStore = useConversationsStore()

  const conversationId = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const streamingContent = ref<string>('')
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)

  async function loadConversation(id: string) {
    const data = await $fetch<any>(`/api/conversations/${id}`)
    conversationId.value = id
    messages.value = data.messages
    streamingContent.value = ''
    error.value = null
  }

  async function sendMessage(content: string) {
    if (!conversationId.value) return
    if (isStreaming.value) return

    // Optimistic: append user message
    messages.value.push({
      id: crypto.randomUUID(),
      conversationId: conversationId.value,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    })

    isStreaming.value = true
    streamingContent.value = ''
    error.value = null

    const controller = new AbortController()
    abortController.value = controller

    // Auto-title on first message
    if (messages.value.length === 1) {
      const title = content.length > 50 ? content.slice(0, 50) + '...' : content
      conversationsStore.rename(conversationId.value, title)
    }

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: conversationId.value,
          content,
          provider: settings.activeProvider,
          model: settings.activeModel,
          systemPrompt: settings.systemPrompt || undefined,
          history: messages.value
            .slice(0, -1)
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        error.value = errText
        return
      }

      const reader = response.body!
        .pipeThrough(new TextDecoderStream())
        .getReader()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        for (const line of value.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'delta') {
              streamingContent.value += evt.text
            }
            if (evt.type === 'done') {
              messages.value.push({
                id: evt.messageId,
                conversationId: conversationId.value!,
                role: 'assistant',
                content: streamingContent.value,
                model: settings.activeModel,
                provider: settings.activeProvider,
                tokensUsed: evt.tokensUsed,
                createdAt: new Date().toISOString(),
              })
              streamingContent.value = ''
            }
            if (evt.type === 'error') {
              error.value = evt.message
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        error.value = e.message
      }
    } finally {
      isStreaming.value = false
      abortController.value = null
    }
  }

  function stopStreaming() {
    abortController.value?.abort()
  }

  function clearConversation() {
    conversationId.value = null
    messages.value = []
    streamingContent.value = ''
    error.value = null
  }

  return {
    conversationId,
    messages,
    streamingContent,
    isStreaming,
    error,
    loadConversation,
    sendMessage,
    stopStreaming,
    clearConversation,
  }
})
