<script setup lang="ts">
const projectsStore = useProjectsStore()
const conversationsStore = useConversationsStore()
const settings = useSettingsStore()
const router = useRouter()
const showCreateProject = ref(false)

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchAll(),
    conversationsStore.fetchAll(),
    settings.fetchModels(),
    settings.loadFromServer(),
  ])
})

async function newChat() {
  const conv = await conversationsStore.create(
    settings.activeProvider,
    settings.activeModel,
    projectsStore.activeProjectId || undefined,
  )
  router.push(`/chat/${conv.id}`)
}

</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
      :ui="{
        root: 'bg-[var(--ui-bg-muted)] border-r border-[var(--ui-border-muted)]',
        header: 'border-b-0 p-3',
        body: 'p-3',
        footer: 'border-t border-[var(--ui-border-muted)] p-3',
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-[var(--ui-bg-accented)] flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-terminal" class="size-4 dark:invert" />
          </div>
          <div v-if="!collapsed" class="flex flex-col min-w-0">
            <span class="font-semibold text-sm leading-tight truncate">Coder UI</span>
            <span class="text-[11px] text-[var(--ui-text-muted)] leading-tight">Web UI</span>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex gap-1.5 mb-3">
          <UButton
            :label="collapsed ? undefined : 'New Chat'"
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            :block="collapsed"
            :square="collapsed"
            class="flex-1"
            size="sm"
            @click="newChat"
          />
          <UButton
            v-if="!collapsed"
            icon="i-lucide-folder-plus"
            color="neutral"
            variant="outline"
            square
            size="sm"
            title="Create New Project"
            @click="showCreateProject = true"
          />
        </div>

        <div v-if="!collapsed">
          <div class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest mb-2 px-2">
            Projects
          </div>
          <ChatSidebar />
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-0.5">
          <UButton
            :label="collapsed ? undefined : 'Settings'"
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            to="/settings"
            block
            :square="collapsed"
            size="sm"
            class="justify-start"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />

    <!-- Create Project Dialog -->
    <ProjectsCreateProjectDialog v-model="showCreateProject" />
  </UDashboardGroup>
</template>
