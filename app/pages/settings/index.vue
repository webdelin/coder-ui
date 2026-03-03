<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="chat-max-w px-4 py-8 space-y-8">
        <SettingsProviderSettings />
        <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
          <MemoriesMemoryPanel />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
