<script setup lang="ts">
const settings = useSettingsStore()
const toast = useToast()
const saving = ref(false)

const providerList = [
  { key: 'claude-code', label: 'Claude Code (Local CLI)', icon: 'i-lucide-terminal', noApiKey: true },
  { key: 'anthropic', label: 'Claude API', icon: 'i-lucide-brain', noApiKey: false },
  { key: 'minimax', label: 'MiniMax', icon: 'i-lucide-sparkles', noApiKey: false },
  { key: 'zai', label: 'Z.AI (Zhipu)', icon: 'i-lucide-zap', noApiKey: false },
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

      <div v-if="settings.providers[provider.key]?.enabled" class="space-y-3">
        <p v-if="provider.noApiKey" class="text-sm text-muted">
          Uses locally installed Claude Code CLI. No API key needed here - it uses your existing Claude authentication.
        </p>

        <template v-if="!provider.noApiKey">
          <UFormField label="API Key">
            <UInput
              v-model="settings.providers[provider.key].apiKey"
              type="password"
              placeholder="Enter API key..."
              class="w-full"
            />
          </UFormField>

        </template>
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
