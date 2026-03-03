<script setup lang="ts">
const { t } = useI18n()
const chat = useChatStore()
const settings = useSettingsStore()
const tts = useTTSStore()

// Parse Claude Code rich content from persisted messages
function parseContent(content: string): { text: string; toolCalls: any[] } {
  try {
    const parsed = JSON.parse(content)
    if (parsed.text !== undefined && parsed.toolCalls !== undefined) {
      return parsed
    }
  } catch {
    // Not JSON, just plain text
  }
  return { text: content, toolCalls: [] }
}

const displayMessages = computed(() => {
  const msgs = chat.messages.map((m) => {
    if (m.role === 'assistant' && m.provider === 'claude-code') {
      const { text, toolCalls } = parseContent(m.content)
      return {
        id: m.id,
        role: 'assistant' as const,
        text,
        toolCalls,
        images: [] as string[],
        isClaudeCode: true,
      }
    }

    return {
      id: m.id,
      role: m.role as 'user' | 'assistant',
      text: m.content,
      toolCalls: [] as any[],
      images: m.images ?? [],
      isClaudeCode: false,
    }
  })

  // Streaming placeholder
  if (chat.isStreaming && (chat.streamingContent || chat.toolCalls.length > 0)) {
    msgs.push({
      id: 'streaming',
      role: 'assistant',
      text: chat.streamingContent,
      toolCalls: chat.toolCalls,
      images: [],
      isClaudeCode: settings.activeProvider === 'claude-code',
    })
  }

  return msgs
})

// Thinking phrases like claude-code-web
const thinkingPhraseKeys = [
  'thinking.thinking', 'thinking.pondering', 'thinking.processing', 'thinking.analyzing',
  'thinking.reflecting', 'thinking.evaluating', 'thinking.considering', 'thinking.reasoning',
] as const
const thinkingPhrase = ref(t(thinkingPhraseKeys[0]))
let phraseInterval: ReturnType<typeof setInterval> | undefined

// Auto-read: when streaming finishes, speak the last assistant message
watch(() => chat.isStreaming, (streaming, wasStreaming) => {
  if (!streaming && wasStreaming) {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (lastMsg?.role === 'assistant') {
      const { text } = parseContent(lastMsg.content)
      tts.autoSpeak(text, lastMsg.id)
    }
  }
})

watch(() => chat.isStreaming, (streaming) => {
  if (streaming) {
    thinkingPhrase.value = t(thinkingPhraseKeys[Math.floor(Math.random() * thinkingPhraseKeys.length)])
    phraseInterval = setInterval(() => {
      thinkingPhrase.value = t(thinkingPhraseKeys[Math.floor(Math.random() * thinkingPhraseKeys.length)])
    }, 3000)
  } else if (phraseInterval) {
    clearInterval(phraseInterval)
  }
})

// Inject copy buttons into code blocks
const messagesContainer = ref<HTMLElement | null>(null)

function injectCopyButtons() {
  if (!messagesContainer.value) return
  const preBlocks = messagesContainer.value.querySelectorAll('pre:not([data-copy-injected])')
  for (const pre of preBlocks) {
    pre.setAttribute('data-copy-injected', 'true')
    pre.classList.add('code-block-wrapper')

    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
    btn.title = t('code.copy')

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent || ''
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
          btn.classList.remove('copied')
        }, 2000)
      })
    })

    pre.appendChild(btn)
  }
}

let copyObserver: MutationObserver | undefined

onMounted(() => {
  // Watch for new code blocks being rendered by MDC
  if (messagesContainer.value) {
    copyObserver = new MutationObserver(() => injectCopyButtons())
    copyObserver.observe(messagesContainer.value, { childList: true, subtree: true })
  }
})

onUnmounted(() => {
  if (phraseInterval) clearInterval(phraseInterval)
  copyObserver?.disconnect()
})
</script>

<template>
  <div ref="messagesContainer" class="space-y-4">
    <!-- Messages -->
    <div
      v-for="message in displayMessages"
      :key="message.id"
      class="flex w-full"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <!-- User message -->
      <div v-if="message.role === 'user'" class="message-bubble user-bubble">
        <!-- Attached images -->
        <div v-if="message.images?.length" class="flex flex-wrap gap-1.5 mb-2">
          <img
            v-for="(imgUrl, idx) in message.images"
            :key="idx"
            :src="imgUrl"
            class="size-20 rounded-lg object-cover"
          >
        </div>
        <p class="whitespace-pre-wrap text-sm">{{ message.text }}</p>
      </div>

      <!-- Assistant message -->
      <div v-else class="message-bubble assistant-bubble mb-8">
        <!-- Tool calls -->
        <template v-if="message.isClaudeCode && message.toolCalls?.length">
          <ChatToolCallDisplay
            v-for="(tc, i) in message.toolCalls"
            :key="`${message.id}-tool-${i}`"
            :name="tc.name"
            :input="tc.input"
            :result="tc.result"
            :status="tc.status || 'done'"
          />
        </template>

        <!-- Text content -->
        <MDC
          v-if="message.text"
          :value="message.text"
          :cache-key="`${message.id}`"
          class="prose prose-sm dark:prose-invert max-w-none *:first:mt-0 *:last:mb-0"
        />

        <!-- Thinking indicator while streaming with no content yet -->
        <div
          v-if="message.id === 'streaming' && !message.text && !message.toolCalls?.length"
          class="thinking-indicator"
        >
          <span class="text-sm text-[var(--ui-text-muted)]">{{ thinkingPhrase }}</span>
          <span class="thinking-dots">
            <span /><span /><span />
          </span>
        </div>

        <!-- Action bar (hover) -->
        <div v-if="message.id !== 'streaming'" class="message-action-bar">
          <ChatMessageActions
            :message-id="message.id"
            :content="message.text ?? ''"
          />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="chat.error" class="py-2">
      <div class="message-bubble bg-[var(--ui-color-error)]/10 text-[var(--ui-color-error)] max-w-full">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
          {{ chat.error }}
        </div>
      </div>
    </div>
  </div>
</template>
