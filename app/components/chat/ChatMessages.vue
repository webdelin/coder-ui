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
        parts: [{ type: 'text' as const, text }],
        toolCalls,
        isClaudeCode: true,
      }
    }

    return {
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: m.content }],
      toolCalls: [] as any[],
      isClaudeCode: false,
    }
  })

  // Streaming placeholder
  if (chat.isStreaming && (chat.streamingContent || chat.toolCalls.length > 0)) {
    msgs.push({
      id: 'streaming',
      role: 'assistant',
      parts: [{ type: 'text', text: chat.streamingContent }],
      toolCalls: chat.toolCalls,
      isClaudeCode: settings.activeProvider === 'claude-code',
    })
  }

  return msgs
})

const status = computed(() =>
  chat.isStreaming ? 'streaming' : 'ready',
)
</script>

<template>
  <UChatMessages
    :messages="displayMessages"
    :status="status"
    :assistant="{ icon: settings.activeProvider === 'claude-code' ? 'i-lucide-terminal' : 'i-lucide-bot' }"
  >
    <template #content="{ message }">
      <!-- Tool calls (Claude Code) -->
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
      <template
        v-for="(part, index) in message.parts"
        :key="`${message.id}-${part.type}-${index}`"
      >
        <MDC
          v-if="part.type === 'text' && part.text && message.role === 'assistant'"
          :value="part.text"
          :cache-key="`${message.id}-${index}`"
          class="*:first:mt-0 *:last:mb-0"
        />
        <p
          v-else-if="part.type === 'text' && message.role === 'user'"
          class="whitespace-pre-wrap"
        >
          {{ part.text }}
        </p>
      </template>
    </template>

    <template #actions="{ message }">
      <ChatMessageActions
        v-if="message.role === 'assistant' && message.id !== 'streaming'"
        :message-id="message.id"
        :content="message.parts[0]?.text ?? ''"
      />
    </template>
  </UChatMessages>

  <div v-if="chat.error" class="px-4 py-2">
    <UAlert
      color="error"
      variant="subtle"
      :title="chat.error"
      icon="i-lucide-alert-circle"
    />
  </div>
</template>
