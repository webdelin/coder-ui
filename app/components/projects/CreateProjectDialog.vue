<script setup lang="ts">
const { t } = useI18n()
const open = defineModel<boolean>()
const projectsStore = useProjectsStore()
const toast = useToast()

const path = ref('')
const displayName = ref('')
const error = ref('')
const creating = ref(false)

async function submit() {
  if (!path.value.trim()) {
    error.value = t('project.pathRequired')
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
    toast.add({ title: t('project.created', { name: project.displayName }), color: 'success' })
  } catch (e: any) {
    error.value = e.data?.message || e.message || t('project.createFailed')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('project.createTitle')"
    :description="t('project.createDescription')"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField :label="t('project.pathLabel')" required>
          <UInput
            v-model="path"
            placeholder="/home/user/my-project"
            icon="i-lucide-folder"
            class="w-full"
            autofocus
            @keydown.enter="submit"
          />
        </UFormField>

        <UFormField :label="t('project.displayNameLabel')" :hint="t('project.displayNameHint')">
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
        :label="t('project.cancel')"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        :label="t('project.createButton')"
        icon="i-lucide-folder-plus"
        :loading="creating"
        @click="submit"
      />
    </template>
  </UModal>
</template>
