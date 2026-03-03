<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const chat = useChatStore()
const projectsStore = useProjectsStore()

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      await chat.loadConversation(String(id))
      // Scroll to bottom when loading a conversation
      nextTick(() => scrollToBottom())
    }
  },
  { immediate: true },
)

onUnmounted(() => chat.clearConversation())

// --- Auto-scroll logic ---
const scrollContainer = ref<HTMLElement | null>(null)
const userScrolledUp = ref(false)

function isNearBottom(threshold = 80): boolean {
  const el = scrollContainer.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function scrollToBottom() {
  const el = scrollContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function onScroll() {
  if (!chat.isStreaming) return
  // User scrolled away from bottom during streaming → pause auto-scroll
  userScrolledUp.value = !isNearBottom()
}

// Auto-scroll during streaming when content changes
watch(
  () => [chat.streamingContent, chat.toolCalls.length],
  () => {
    if (chat.isStreaming && !userScrolledUp.value) {
      nextTick(() => scrollToBottom())
    }
  },
)

// When new messages are added (user sends or streaming finishes)
watch(
  () => chat.messages.length,
  () => {
    // Reset scroll lock and scroll down on new messages
    userScrolledUp.value = false
    nextTick(() => scrollToBottom())
  },
)

// Reset scroll lock when streaming starts (user just sent a message)
watch(
  () => chat.isStreaming,
  (streaming) => {
    if (streaming) {
      userScrolledUp.value = false
      nextTick(() => scrollToBottom())
    }
  },
)
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col h-full">
        <!-- Project context banner -->
        <div
          v-if="projectsStore.activeProject"
          class="px-4 py-2 text-xs text-[var(--ui-text-dimmed)] border-b border-[var(--ui-border-muted)] flex items-center gap-2 bg-[var(--ui-bg)]"
        >
          <UIcon name="i-lucide-folder" class="size-3.5 opacity-60" />
          <span class="font-medium text-[var(--ui-text-muted)]">{{ projectsStore.activeProject.displayName }}</span>
          <span class="font-mono truncate">{{ projectsStore.activeProject.path }}</span>
        </div>

        <!-- Messages area (scrollable) -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto scrollbar-thin" @scroll="onScroll">
          <div class="px-4 py-6">
            <ChatMessages />
          </div>
        </div>

        <!-- Input area (sticky bottom) -->
        <div class="chat-input-area border-t border-[var(--ui-border-muted)]">
          <div class="px-4 py-3">
            <ChatInput />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
