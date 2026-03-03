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
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
      <p class="text-sm text-[var(--ui-text-muted)] mt-1">
        Configure your AI providers and preferences.
      </p>
    </div>

    <!-- Providers -->
    <div class="space-y-3">
      <h3 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider">
        Providers
      </h3>

      <div
        v-for="provider in providerList"
        :key="provider.key"
        class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4"
      >
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-[var(--ui-bg-elevated)] flex items-center justify-center">
            <UIcon :name="provider.icon" class="size-4" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium">{{ provider.label }}</h4>
          </div>
          <USwitch
            v-model="settings.providers[provider.key].enabled"
          />
        </div>

        <div v-if="settings.providers[provider.key]?.enabled" class="space-y-3 pl-11">
          <p v-if="provider.noApiKey" class="text-xs text-[var(--ui-text-muted)]">
            Uses locally installed Claude Code CLI. No API key needed — it uses your existing Claude authentication.
          </p>

          <template v-if="!provider.noApiKey">
            <UFormField label="API Key">
              <UInput
                v-model="settings.providers[provider.key].apiKey"
                type="password"
                placeholder="Enter API key..."
                class="w-full"
                size="sm"
              />
            </UFormField>
          </template>
        </div>
      </div>
    </div>

    <!-- Defaults -->
    <div class="space-y-3">
      <h3 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider">
        Defaults
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <UFormField label="System Prompt">
          <UTextarea
            v-model="settings.systemPrompt"
            placeholder="Optional system prompt for all conversations..."
            :rows="3"
            class="w-full"
            size="sm"
          />
        </UFormField>

        <div class="flex items-center justify-between">
          <span class="text-sm">Text-to-Speech</span>
          <USwitch v-model="settings.ttsEnabled" />
        </div>
      </div>
    </div>

    <button
      :disabled="saving"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      @click="save"
    >
      <UIcon v-if="!saving" name="i-lucide-save" class="size-4" />
      <UIcon v-else name="i-lucide-loader" class="size-4 animate-spin" />
      Save Settings
    </button>
  </div>
</template>
