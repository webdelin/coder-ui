<script setup lang="ts">
const chat = useChatStore()
const settings = useSettingsStore()

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
        isClaudeCode: true,
      }
    }

    return {
      id: m.id,
      role: m.role as 'user' | 'assistant',
      text: m.content,
      toolCalls: [] as any[],
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
      isClaudeCode: settings.activeProvider === 'claude-code',
    })
  }

  return msgs
})

// Thinking phrases like claude-code-web
const thinkingPhrases = [
  'Thinking...', 'Pondering...', 'Processing...', 'Analyzing...',
  'Reflecting...', 'Evaluating...', 'Considering...', 'Reasoning...',
]
const thinkingPhrase = ref(thinkingPhrases[0])
let phraseInterval: ReturnType<typeof setInterval> | undefined

watch(() => chat.isStreaming, (streaming) => {
  if (streaming) {
    thinkingPhrase.value = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)]
    phraseInterval = setInterval(() => {
      thinkingPhrase.value = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)]
    }, 3000)
  } else if (phraseInterval) {
    clearInterval(phraseInterval)
  }
})

onUnmounted(() => {
  if (phraseInterval) clearInterval(phraseInterval)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Messages -->
    <div
      v-for="message in displayMessages"
      :key="message.id"
      class="flex w-full"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <!-- User message -->
      <div v-if="message.role === 'user'" class="message-bubble user-bubble">
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
