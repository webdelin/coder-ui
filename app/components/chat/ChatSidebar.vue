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
  <div class="flex flex-col gap-1">
    <div
      v-for="conv in conversationsStore.list"
      :key="conv.id"
      class="group flex items-center gap-1"
    >
      <UButton
        :label="conv.title"
        :to="`/chat/${conv.id}`"
        variant="ghost"
        color="neutral"
        class="flex-1 justify-start truncate"
        :class="{ 'bg-elevated': route.params.id === conv.id }"
        size="sm"
      />
      <UButton
        icon="i-lucide-trash-2"
        size="xs"
        variant="ghost"
        color="error"
        class="opacity-0 group-hover:opacity-100 shrink-0"
        @click.prevent="deleteConversation(conv.id)"
      />
    </div>

    <p
      v-if="!conversationsStore.list.length && !conversationsStore.loading"
      class="text-sm text-muted px-2 py-4 text-center"
    >
      No conversations yet
    </p>
  </div>
</template>
