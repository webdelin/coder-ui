<script setup lang="ts">
const conversationsStore = useConversationsStore()
const route = useRoute()
const router = useRouter()

async function deleteConversation(id: string) {
  await conversationsStore.remove(id)
  if (route.params.id === id) {
    router.push('/chat')
  }
}
</script>

<template>
  <nav class="space-y-0.5 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin">
    <div
      v-for="conv in conversationsStore.list"
      :key="conv.id"
      class="group flex items-center"
    >
      <NuxtLink
        :to="`/chat/${conv.id}`"
        class="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm truncate transition-colors"
        :class="route.params.id === conv.id
          ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]'
          : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-elevated)] hover:text-[var(--ui-text-highlighted)]'"
      >
        <UIcon name="i-lucide-message-square" class="size-4 shrink-0" />
        <span class="truncate">{{ conv.title }}</span>
      </NuxtLink>
      <button
        class="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ui-text-muted)] hover:text-[var(--ui-color-error)] shrink-0"
        @click.prevent="deleteConversation(conv.id)"
      >
        <UIcon name="i-lucide-trash-2" class="size-3.5" />
      </button>
    </div>

    <p
      v-if="!conversationsStore.list.length && !conversationsStore.loading"
      class="text-xs text-[var(--ui-text-muted)] px-2 py-6 text-center"
    >
      No conversations yet
    </p>
  </nav>
</template>
