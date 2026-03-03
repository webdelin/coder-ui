<script setup lang="ts">
definePageMeta({ layout: 'default' })

const projectsStore = useProjectsStore()
const conversationsStore = useConversationsStore()
const settings = useSettingsStore()
const router = useRouter()
const toast = useToast()
const showCreateProject = ref(false)
const navigating = ref<string | null>(null)
const editingId = ref<string | null>(null)
const editingName = ref('')

async function startChatInProject(project: { id: string }) {
  if (navigating.value) return
  navigating.value = project.id
  try {
    projectsStore.setActive(project.id)
    projectsStore.expand(project.id)
    const conv = await conversationsStore.create(
      settings.activeProvider,
      settings.activeModel,
      project.id,
    )
    router.push(`/chat/${conv.id}`)
  } finally {
    navigating.value = null
  }
}

function startRename(project: { id: string; displayName: string }) {
  editingId.value = project.id
  editingName.value = project.displayName
}

async function finishRename(id: string) {
  const name = editingName.value.trim()
  if (name) {
    await projectsStore.rename(id, name)
  }
  editingId.value = null
}

async function deleteProject(project: { id: string; displayName: string }) {
  if (!confirm(`Delete project "${project.displayName}"? Conversations will become unassigned.`)) return
  await projectsStore.remove(project.id)
  toast.add({ title: `Project "${project.displayName}" deleted`, color: 'success' })
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-6 px-4">
        <!-- Header -->
        <div class="text-center space-y-3">
          <div class="size-14 rounded-xl bg-[var(--ui-bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-terminal" class="size-7 dark:invert opacity-80" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight">Welcome to Coder UI</h1>
          <p class="text-sm text-[var(--ui-text-muted)]">
            Select a project to start chatting
          </p>
        </div>

        <!-- Create New Project button -->
        <button
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] text-sm font-medium hover:opacity-90 transition-opacity"
          @click="showCreateProject = true"
        >
          <UIcon name="i-lucide-folder-plus" class="size-4" />
          Create New Project
        </button>

        <!-- Project list -->
        <div
          v-if="projectsStore.list.length"
          class="w-full max-w-2xl space-y-1 mt-2"
        >
          <div
            v-for="project in projectsStore.list"
            :key="project.id"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--ui-bg-elevated)] transition-colors group cursor-pointer"
            :class="{ 'opacity-50 pointer-events-none': navigating === project.id }"
            @click="editingId !== project.id && startChatInProject(project)"
          >
            <!-- Folder icon -->
            <div class="size-9 rounded-lg bg-[var(--ui-bg-elevated)] group-hover:bg-[var(--ui-bg-accented)] flex items-center justify-center shrink-0 transition-colors">
              <UIcon name="i-lucide-folder" class="size-4 text-[var(--ui-text-muted)]" />
            </div>

            <!-- Project info -->
            <div class="flex-1 min-w-0">
              <!-- Editing mode -->
              <div v-if="editingId === project.id" class="flex items-center gap-2" @click.stop>
                <input
                  v-model="editingName"
                  class="flex-1 text-sm font-medium bg-[var(--ui-bg-elevated)] border border-[var(--ui-border-active)] rounded-md px-2 py-1 outline-none"
                  autofocus
                  @keydown.enter="finishRename(project.id)"
                  @keydown.escape="editingId = null"
                  @blur="finishRename(project.id)"
                >
              </div>
              <!-- Normal mode -->
              <template v-else>
                <span class="font-medium text-sm block">{{ project.displayName }}</span>
                <p class="text-xs text-[var(--ui-text-muted)] truncate font-mono mt-0.5">
                  {{ project.path }}
                </p>
              </template>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)] hover:bg-[var(--ui-bg-accented)] transition-colors"
                title="Rename"
                @click.stop="startRename(project)"
              >
                <UIcon name="i-lucide-pencil" class="size-3.5" />
              </button>
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-[var(--ui-color-error)] hover:bg-[var(--ui-bg-accented)] transition-colors"
                title="Delete project"
                @click.stop="deleteProject(project)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p v-if="!projectsStore.list.length && !projectsStore.loading" class="text-xs text-[var(--ui-text-muted)]">
          Or continue from the sidebar to resume an existing session
        </p>
      </div>

      <ProjectsCreateProjectDialog v-model="showCreateProject" />
    </template>
  </UDashboardPanel>
</template>
