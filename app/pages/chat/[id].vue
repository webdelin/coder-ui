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
    }
  },
  { immediate: true },
)

onUnmounted(() => chat.clearConversation())
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col h-full">
        <!-- Project context banner -->
        <div
          v-if="projectsStore.activeProject"
          class="px-4 py-2 text-xs text-[var(--ui-text-muted)] border-b border-[var(--ui-border)] flex items-center gap-2"
        >
          <UIcon name="i-lucide-folder" class="size-3.5" />
          <span class="font-medium">{{ projectsStore.activeProject.displayName }}</span>
          <span class="font-mono opacity-60 truncate">{{ projectsStore.activeProject.path }}</span>
        </div>

        <!-- Messages area (scrollable) -->
        <div class="flex-1 overflow-y-auto scrollbar-thin">
          <div class="chat-max-w px-4 py-6">
            <ChatMessages />
          </div>
        </div>

        <!-- Input area (sticky bottom) -->
        <div class="chat-input-area border-t border-[var(--ui-border)]">
          <div class="chat-max-w px-4 py-3">
            <ChatInput />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
