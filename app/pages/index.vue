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
      <div class="flex flex-col items-center justify-center h-full gap-8 px-4">
        <!-- Header -->
        <div class="size-16 rounded-2xl bg-[var(--ui-bg-elevated)] flex items-center justify-center">
          <UIcon name="i-lucide-terminal" class="size-8 text-[var(--ui-text-muted)]" />
        </div>
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold tracking-tight">Welcome to Coder UI</h1>
          <p class="text-sm text-[var(--ui-text-muted)] max-w-sm">
            Select a project to start chatting
          </p>
        </div>

        <!-- Create New Project button -->
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--ui-border)] text-sm font-medium hover:bg-[var(--ui-bg-elevated)] transition-colors"
          @click="showCreateProject = true"
        >
          <UIcon name="i-lucide-folder-plus" class="size-4" />
          Create New Project
        </button>

        <!-- Project list -->
        <div
          v-if="projectsStore.list.length"
          class="w-full max-w-3xl rounded-xl border border-[var(--ui-border)] divide-y divide-[var(--ui-border)] overflow-hidden"
        >
          <div
            v-for="project in projectsStore.list"
            :key="project.id"
            class="flex items-center gap-4 p-4 hover:bg-[var(--ui-bg-elevated)] transition-colors group"
            :class="{ 'opacity-50': navigating === project.id }"
          >
            <!-- Click area: project info -->
            <div
              class="flex-1 min-w-0 cursor-pointer"
              @click="startChatInProject(project)"
            >
              <!-- Editing mode -->
              <div v-if="editingId === project.id" class="flex items-center gap-2" @click.stop>
                <input
                  v-model="editingName"
                  class="flex-1 text-sm font-semibold bg-[var(--ui-bg-elevated)] border border-[var(--ui-border-active)] rounded px-2 py-1 outline-none"
                  autofocus
                  @keydown.enter="finishRename(project.id)"
                  @keydown.escape="editingId = null"
                  @blur="finishRename(project.id)"
                >
              </div>
              <!-- Normal mode -->
              <template v-else>
                <span class="font-semibold text-sm block">{{ project.displayName }}</span>
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
                <UIcon name="i-lucide-pencil" class="size-4" />
              </button>
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-[var(--ui-color-error)] hover:bg-[var(--ui-bg-accented)] transition-colors"
                title="Delete project"
                @click.stop="deleteProject(project)"
              >
                <UIcon name="i-lucide-trash-2" class="size-4" />
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
