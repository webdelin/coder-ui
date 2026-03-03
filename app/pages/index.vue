<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const conversationsStore = useConversationsStore()
const settings = useSettingsStore()

async function startChat() {
  const conv = await conversationsStore.create(
    settings.activeProvider,
    settings.activeModel,
  )
  router.push(`/chat/${conv.id}`)
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-8">
        <div class="size-16 rounded-2xl bg-[var(--ui-bg-elevated)] flex items-center justify-center">
          <UIcon name="i-lucide-terminal" class="size-8 text-[var(--ui-text-muted)]" />
        </div>
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold tracking-tight">Coder UI</h1>
          <p class="text-sm text-[var(--ui-text-muted)] max-w-sm">
            Chat with Claude, MiniMax, or Z.AI models. Select your provider and start a conversation.
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] font-medium text-sm hover:opacity-90 transition-opacity"
          @click="startChat"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Start New Chat
        </button>
      </div>
    </template>
  </UDashboardPanel>
</template>
