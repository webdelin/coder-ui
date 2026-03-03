import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'
import { useConversationsStore } from './conversations'
import { useProjectsStore } from './projects'

export interface PendingImage {
  id: string
  dataUrl: string
  mediaType: string
  name: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: string
  content: string
  images?: string[] // data URLs for display
  model?: string | null
  provider?: string | null
  tokensUsed?: number | null
  durationMs?: number | null
  createdAt: string
}

export interface ToolCall {
  name: string
  input: Record<string, unknown>
  result?: string
  toolUseId?: string
  status: 'running' | 'done'
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

  // Claude Code specific state
  const toolCalls = ref<ToolCall[]>([])
  const claudeSessionId = ref<string | null>(null)

  async function loadConversation(id: string) {
    const projectsStore = useProjectsStore()
    const data = await $fetch<any>(`/api/conversations/${id}`)
    conversationId.value = id
    messages.value = data.messages
    streamingContent.value = ''
    error.value = null
    toolCalls.value = []

    // Restore project context
    if (data.projectId) {
      projectsStore.setActive(data.projectId)
      if (!projectsStore.isExpanded(data.projectId)) {
        projectsStore.toggleExpanded(data.projectId)
      }
    }

    // Restore provider/model from conversation
    if (data.provider) {
      settings.setModel(data.provider, data.model || settings.activeModel)
    }

    // Extract Claude Code session ID if present
    if (data.systemPrompt?.startsWith('claude-code-session:')) {
      claudeSessionId.value = data.systemPrompt.replace('claude-code-session:', '')
    }
  }

  async function sendMessage(content: string, images?: PendingImage[]) {
    if (!conversationId.value) return
    if (isStreaming.value) return

    messages.value.push({
      id: crypto.randomUUID(),
      conversationId: conversationId.value,
      role: 'user',
      content,
      images: images?.map(i => i.dataUrl),
      createdAt: new Date().toISOString(),
    })

    isStreaming.value = true
    streamingContent.value = ''
    error.value = null
    toolCalls.value = []

    const controller = new AbortController()
    abortController.value = controller

    if (messages.value.filter(m => m.role === 'user').length === 1) {
      const title = content.length > 50 ? content.slice(0, 50) + '...' : content
      conversationsStore.rename(conversationId.value, title)
    }

    const isClaudeCode = settings.activeProvider === 'claude-code'

    // Convert images to base64 blocks for API
    const imageBlocks = images?.map(img => ({
      mediaType: img.mediaType,
      data: img.dataUrl.replace(/^data:[^;]+;base64,/, ''),
    }))

    try {
      if (isClaudeCode) {
        await streamClaudeCode(content, controller)
      } else {
        await streamRegularProvider(content, controller, imageBlocks)
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

  async function streamRegularProvider(content: string, controller: AbortController, images?: Array<{ mediaType: string; data: string }>) {
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
        images: images?.length ? images : undefined,
        history: messages.value
          .slice(0, -1)
          .slice(-20)
          .map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      try {
        const parsed = JSON.parse(text)
        error.value = parsed.message || parsed.statusMessage || text
      } catch {
        error.value = text
      }
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
  }

  async function streamClaudeCode(content: string, controller: AbortController) {
    const projectsStore = useProjectsStore()
    const cwd = projectsStore.activeProject?.path || undefined

    const response = await fetch('/api/chat/claude-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        conversationId: conversationId.value,
        content,
        model: settings.activeModel,
        systemPrompt: settings.systemPrompt || undefined,
        permissionMode: 'acceptEdits',
        sessionId: claudeSessionId.value || undefined,
        cwd,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      try {
        const parsed = JSON.parse(text)
        error.value = parsed.message || parsed.statusMessage || text
      } catch {
        error.value = text
      }
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

          if (evt.type === 'system_init') {
            claudeSessionId.value = evt.sessionId
          }
          if (evt.type === 'text' && evt.text) {
            streamingContent.value += evt.text
          }
          if (evt.type === 'tool_use') {
            toolCalls.value.push({
              name: evt.toolName,
              input: evt.toolInput,
              toolUseId: evt.toolUseId,
              status: 'running',
            })
          }
          if (evt.type === 'tool_result') {
            const tc = toolCalls.value.find(t => t.toolUseId === evt.toolUseId)
            if (tc) {
              tc.result = evt.toolResult
              tc.status = 'done'
            }
          }
          if (evt.type === 'thinking' && evt.text) {
            // Could display thinking in UI, for now append to streaming
          }
          if (evt.type === 'done') {
            // Build rich content for display
            const richContent = JSON.stringify({
              text: streamingContent.value,
              toolCalls: toolCalls.value,
              sessionId: claudeSessionId.value,
            })

            messages.value.push({
              id: crypto.randomUUID(),
              conversationId: conversationId.value!,
              role: 'assistant',
              content: richContent,
              model: settings.activeModel,
              provider: 'claude-code',
              tokensUsed: evt.tokensUsed,
              durationMs: evt.durationMs,
              createdAt: new Date().toISOString(),
            })
            streamingContent.value = ''
            toolCalls.value = []
          }
          if (evt.type === 'error') {
            error.value = evt.message
          }
        } catch {
          // skip malformed
        }
      }
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
    toolCalls.value = []
    claudeSessionId.value = null
  }

  return {
    conversationId,
    messages,
    streamingContent,
    isStreaming,
    error,
    toolCalls,
    claudeSessionId,
    loadConversation,
    sendMessage,
    stopStreaming,
    clearConversation,
  }
})
