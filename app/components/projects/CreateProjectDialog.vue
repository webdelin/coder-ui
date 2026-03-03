<script setup lang="ts">
const open = defineModel<boolean>()
const projectsStore = useProjectsStore()
const toast = useToast()

const path = ref('')
const displayName = ref('')
const error = ref('')
const creating = ref(false)

async function submit() {
  if (!path.value.trim()) {
    error.value = 'Path is required'
    return
  }
  creating.value = true
  error.value = ''
  try {
    const project = await projectsStore.create(
      path.value.trim(),
      displayName.value.trim() || undefined,
    )
    open.value = false
    path.value = ''
    displayName.value = ''
    projectsStore.toggleExpanded(project.id)
    projectsStore.setActive(project.id)
    toast.add({ title: `Project "${project.displayName}" created`, color: 'success' })
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Failed to create project'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create New Project"
    description="Link a directory on your filesystem as a project."
    :ui="{ footer: 'justify-end' }"
  >
    <!-- No trigger button — opened externally via v-model -->
    <template #body>
      <div class="space-y-4">
        <UFormField label="Project Path" required>
          <UInput
            v-model="path"
            placeholder="/home/user/my-project"
            icon="i-lucide-folder"
            class="w-full"
            autofocus
            @keydown.enter="submit"
          />
        </UFormField>

        <UFormField label="Display Name" hint="Optional">
          <UInput
            v-model="displayName"
            placeholder="My Project"
            class="w-full"
            @keydown.enter="submit"
          />
        </UFormField>

        <p v-if="error" class="text-sm text-[var(--ui-color-error)]">
          {{ error }}
        </p>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        label="Create Project"
        icon="i-lucide-folder-plus"
        :loading="creating"
        @click="submit"
      />
    </template>
  </UModal>
</template>
