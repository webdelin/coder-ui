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
      :ui="{
        root: 'bg-[var(--ui-bg-muted)]',
        header: 'border-b-0',
        body: 'p-2',
        footer: 'border-t border-[var(--ui-border)] p-2',
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-[var(--ui-bg-elevated)] flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-terminal" class="size-4" />
          </div>
          <div v-if="!collapsed" class="flex flex-col min-w-0">
            <span class="font-semibold text-sm truncate">Coder UI</span>
            <span class="text-xs text-[var(--ui-text-muted)]">Web UI</span>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UButton
          :label="collapsed ? undefined : 'New Chat'"
          icon="i-lucide-plus"
          color="primary"
          block
          :square="collapsed"
          class="mb-2"
          @click="newChat"
        />

        <div v-if="!collapsed" class="mt-1">
          <div class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider mb-2 px-2">
            Conversations
          </div>
          <ChatSidebar />
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-0.5">
          <UButton
            :label="collapsed ? undefined : 'Toggle Theme'"
            :icon="colorModeIcon"
            variant="ghost"
            color="neutral"
            block
            :square="collapsed"
            size="sm"
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
            size="sm"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
