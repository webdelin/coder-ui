<script setup lang="ts">
const projectsStore = useProjectsStore()
const conversationsStore = useConversationsStore()
const settings = useSettingsStore()
const router = useRouter()

async function newChatInProject(projectId: string) {
  projectsStore.setActive(projectId)
  const conv = await conversationsStore.create(
    settings.activeProvider,
    settings.activeModel,
    projectId,
  )
  router.push(`/chat/${conv.id}`)
}

function handleProjectClick(projectId: string) {
  projectsStore.toggleExpanded(projectId)
  projectsStore.setActive(projectId)
}
</script>

<template>
  <nav class="overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin space-y-0.5">
    <!-- Project folders -->
    <div v-for="project in projectsStore.list" :key="project.id" class="mb-0.5">
      <!-- Project header -->
      <div
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors group"
        :class="projectsStore.activeProjectId === project.id
          ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]'
          : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-elevated)] hover:text-[var(--ui-text-highlighted)]'"
        @click="handleProjectClick(project.id)"
      >
        <UIcon
          :name="projectsStore.isExpanded(project.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          class="size-3 shrink-0 text-[var(--ui-text-muted)] transition-transform duration-200"
        />
        <UIcon name="i-lucide-folder" class="size-4 shrink-0" />
        <span class="truncate text-sm font-medium flex-1">{{ project.displayName }}</span>
        <span
          v-if="conversationsStore.forProject(project.id).length"
          class="text-[10px] text-[var(--ui-text-muted)] shrink-0"
        >
          {{ conversationsStore.forProject(project.id).length }}
        </span>
      </div>

      <!-- Expanded: conversations -->
      <div v-if="projectsStore.isExpanded(project.id)" class="pl-3 mt-0.5 space-y-0.5">
        <!-- New chat button -->
        <button
          class="flex items-center gap-2 w-full px-2 py-1 text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)] rounded-md hover:bg-[var(--ui-bg-elevated)] transition-colors"
          @click.stop="newChatInProject(project.id)"
        >
          <UIcon name="i-lucide-plus" class="size-3" />
          New chat
        </button>

        <!-- Conversations for this project -->
        <ChatSidebarItem
          v-for="conv in conversationsStore.forProject(project.id)"
          :key="conv.id"
          :conversation="conv"
        />

        <!-- Empty state -->
        <p
          v-if="!conversationsStore.forProject(project.id).length"
          class="text-[10px] text-[var(--ui-text-muted)] px-2 py-1"
        >
          No conversations yet
        </p>
      </div>
    </div>

    <!-- Unassigned conversations -->
    <div v-if="conversationsStore.unassigned().length" class="mt-2 pt-2 border-t border-[var(--ui-border)]">
      <div class="text-[10px] font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider mb-1 px-2">
        Unassigned
      </div>
      <ChatSidebarItem
        v-for="conv in conversationsStore.unassigned()"
        :key="conv.id"
        :conversation="conv"
      />
    </div>

    <!-- Empty state: no projects -->
    <div
      v-if="!projectsStore.list.length && !conversationsStore.list.length && !projectsStore.loading"
      class="px-2 py-8 text-center"
    >
      <UIcon name="i-lucide-folder-plus" class="size-8 text-[var(--ui-text-muted)] opacity-40 mx-auto mb-2" />
      <p class="text-xs text-[var(--ui-text-muted)]">No projects yet</p>
      <p class="text-[10px] text-[var(--ui-text-muted)] mt-0.5">Create a project to get started</p>
    </div>
  </nav>
</template>
