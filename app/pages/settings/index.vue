<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="chat-max-w px-4 py-8">
        <SettingsProviderSettings />
      </div>
    </template>
  </UDashboardPanel>
</template>
