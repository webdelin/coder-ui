<script setup lang="ts">
const conversationsStore = useConversationsStore()
const settings = useSettingsStore()
const router = useRouter()
const colorMode = useColorMode()

onMounted(async () => {
  await Promise.all([
    conversationsStore.fetchAll(),
    settings.fetchModels(),
    settings.loadFromServer(),
  ])
})

async function newChat() {
  const conv = await conversationsStore.create(
    settings.activeProvider,
    settings.activeModel,
  )
  router.push(`/chat/${conv.id}`)
}

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const colorModeIcon = computed(() =>
  colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
)
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
      :ui="{ footer: 'border-t border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bot" class="size-5 text-primary" />
          <span v-if="!collapsed" class="font-semibold truncate">Coder UI</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UButton
          :label="collapsed ? undefined : 'New Chat'"
          icon="i-lucide-plus"
          color="primary"
          block
          :square="collapsed"
          @click="newChat"
        />

        <ChatSidebar v-if="!collapsed" />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-1">
          <UButton
            :label="collapsed ? undefined : undefined"
            :icon="colorModeIcon"
            variant="ghost"
            color="neutral"
            :square="collapsed"
            @click="toggleColorMode"
          />
          <UButton
            :label="collapsed ? undefined : 'Settings'"
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            to="/settings"
            block
            :square="collapsed"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
