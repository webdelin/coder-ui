<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const projectsStore = useProjectsStore()
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div class="size-12 rounded-xl bg-[var(--ui-bg-elevated)] flex items-center justify-center">
          <UIcon name="i-lucide-message-square-plus" class="size-6 text-[var(--ui-text-dimmed)]" />
        </div>
        <p class="text-sm text-[var(--ui-text-muted)]">
          {{ projectsStore.activeProject
            ? t('chat.startNew', { name: projectsStore.activeProject.displayName })
            : t('chat.selectToStart')
          }}
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
