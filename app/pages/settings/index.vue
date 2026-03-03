<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <UContainer class="py-6 max-w-2xl">
        <SettingsProviderSettings />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
