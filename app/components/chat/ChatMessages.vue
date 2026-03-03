<script setup lang="ts">
const chat = useChatStore()

const displayMessages = computed(() => {
  const msgs = chat.messages.map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    parts: [{ type: 'text' as const, text: m.content }],
  }))

  if (chat.isStreaming && chat.streamingContent) {
    msgs.push({
      id: 'streaming',
      role: 'assistant',
      parts: [{ type: 'text', text: chat.streamingContent }],
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
    :assistant="{ icon: 'i-lucide-bot' }"
  >
    <template #content="{ message }">
      <template
        v-for="(part, index) in message.parts"
        :key="`${message.id}-${part.type}-${index}`"
      >
        <MDC
          v-if="part.type === 'text' && message.role === 'assistant'"
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
