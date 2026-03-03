<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div class="size-12 rounded-xl bg-[var(--ui-bg-elevated)] flex items-center justify-center">
          <UIcon name="i-lucide-message-square-plus" class="size-6 text-[var(--ui-text-muted)]" />
        </div>
        <p class="text-sm text-[var(--ui-text-muted)]">
          Select a conversation or start a new one
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
