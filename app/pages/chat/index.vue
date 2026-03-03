<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-4">
        <UIcon name="i-lucide-message-square-plus" class="size-12 text-muted" />
        <p class="text-muted">Select a conversation or start a new one</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
