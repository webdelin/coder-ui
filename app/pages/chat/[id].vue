<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const chat = useChatStore()

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
      <UContainer>
        <ChatMessages />
      </UContainer>
    </template>

    <template #footer>
      <UContainer class="pb-4 sm:pb-6">
        <ChatInput />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
