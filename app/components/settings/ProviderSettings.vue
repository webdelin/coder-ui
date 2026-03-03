<script setup lang="ts">
const settings = useSettingsStore()
const toast = useToast()
const saving = ref(false)

const providerList = [
  { key: 'anthropic' as const, label: 'Claude (Anthropic)', icon: 'i-lucide-brain' },
  { key: 'minimax' as const, label: 'MiniMax', icon: 'i-lucide-sparkles' },
  { key: 'zai' as const, label: 'Z.AI (Zhipu)', icon: 'i-lucide-zap' },
]

async function save() {
  saving.value = true
  try {
    await settings.saveToServer()
    toast.add({ title: 'Settings saved', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to save', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Provider Settings</h2>

    <div
      v-for="provider in providerList"
      :key="provider.key"
      class="border border-default rounded-lg p-4 space-y-4"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="provider.icon" class="size-5" />
        <h3 class="font-medium">{{ provider.label }}</h3>
        <USwitch
          v-model="settings.providers[provider.key].enabled"
          class="ml-auto"
        />
      </div>

      <div v-if="settings.providers[provider.key].enabled" class="space-y-3">
        <UFormField label="API Key">
          <UInput
            v-model="settings.providers[provider.key].apiKey"
            type="password"
            placeholder="Enter API key..."
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="provider.key === 'minimax'" label="Group ID">
          <UInput
            v-model="settings.providers[provider.key].groupId"
            placeholder="MiniMax Group ID..."
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <div class="border border-default rounded-lg p-4 space-y-4">
      <h3 class="font-medium">Default Settings</h3>

      <UFormField label="System Prompt">
        <UTextarea
          v-model="settings.systemPrompt"
          placeholder="Optional system prompt for all conversations..."
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="TTS Enabled">
        <USwitch v-model="settings.ttsEnabled" />
      </UFormField>
    </div>

    <UButton
      label="Save Settings"
      icon="i-lucide-save"
      color="primary"
      :loading="saving"
      @click="save"
    />
  </div>
</template>
