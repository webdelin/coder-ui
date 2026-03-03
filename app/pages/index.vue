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
      <div class="flex flex-col items-center justify-center h-full gap-6">
        <UIcon name="i-lucide-bot" class="size-16 text-primary" />
        <h1 class="text-2xl font-bold">Coder UI</h1>
        <p class="text-muted text-center max-w-md">
          Chat with Claude, MiniMax, or Z.AI models. Select your provider and start a conversation.
        </p>
        <UButton
          label="Start New Chat"
          icon="i-lucide-plus"
          size="lg"
          @click="startChat"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
