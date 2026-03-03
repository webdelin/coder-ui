<script setup lang="ts">
const settings = useSettingsStore()
const conversationsStore = useConversationsStore()
const toast = useToast()
const router = useRouter()
const colorMode = useColorMode()
const saving = ref(false)
const showClearConfirm = ref(false)

const providerList = [
  { key: 'claude-code', label: 'Claude Code (Local CLI)', icon: 'i-lucide-terminal', noApiKey: true },
  { key: 'anthropic', label: 'Claude API', icon: 'i-lucide-brain', noApiKey: false },
  { key: 'minimax', label: 'MiniMax', icon: 'i-lucide-sparkles', noApiKey: false },
  { key: 'zai', label: 'Z.AI (Zhipu)', icon: 'i-lucide-zap', noApiKey: false },
]

const tts = useTTSStore()

const engineOptions = [
  { label: 'Local (Browser)', value: 'local' },
  { label: 'MiniMax API', value: 'minimax' },
]

const sttEngineOptions = [
  { label: 'Browser (Chrome/Edge)', value: 'browser' },
  { label: 'Whisper API (all browsers)', value: 'whisper' },
]

const sttPresetOptions = [
  { label: 'Groq (Free)', value: 'groq', url: 'https://api.groq.com/openai/v1/audio/transcriptions', model: 'whisper-large-v3-turbo' },
  { label: 'OpenAI', value: 'openai', url: 'https://api.openai.com/v1/audio/transcriptions', model: 'whisper-1' },
  { label: 'Custom', value: 'custom', url: '', model: '' },
]

const sttPreset = ref('groq')

function applySttPreset(presetValue: string) {
  sttPreset.value = presetValue
  const preset = sttPresetOptions.find(p => p.value === presetValue)
  if (preset && preset.value !== 'custom') {
    settings.sttWhisperUrl = preset.url
    settings.sttWhisperModel = preset.model
  }
}

const minimaxVoiceOptions = [
  { label: 'Qingse (Male)', value: 'male-qn-qingse' },
  { label: 'Jingying (Male)', value: 'male-qn-jingying' },
  { label: 'Badao (Male)', value: 'male-qn-badao' },
  { label: 'Daxuesheng (Male)', value: 'male-qn-daxuesheng' },
  { label: 'Shaonian (Female)', value: 'female-shaonv' },
  { label: 'Yujie (Female)', value: 'female-yujie' },
  { label: 'Chengshu (Female)', value: 'female-chengshu' },
  { label: 'Tianmei (Female)', value: 'female-tianmei' },
  { label: 'Presenter (Male)', value: 'presenter_male' },
  { label: 'Presenter (Female)', value: 'presenter_female' },
]

const localVoiceOptions = computed(() =>
  tts.localVoices.map(v => ({
    label: `${v.name} (${v.lang})`,
    value: v.name,
  })),
)

const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x (Normal)', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 },
]

const colorModeIcon = computed(() =>
  colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun',
)

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function save() {
  saving.value = true
  try {
    await settings.saveToServer()
    await settings.fetchModels()
    toast.add({ title: 'Settings saved', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to save', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

async function clearAllConversations() {
  try {
    await conversationsStore.clearAll()
    showClearConfirm.value = false
    toast.add({ title: 'All conversations deleted', color: 'success' })
    router.push('/')
  } catch (e: any) {
    toast.add({ title: 'Failed to clear', description: e.message, color: 'error' })
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
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
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
            v-model="settings.providers[provider.key]!.enabled"
          />
        </div>

        <div v-if="settings.providers[provider.key]?.enabled" class="space-y-3 pl-11">
          <p v-if="provider.noApiKey" class="text-xs text-[var(--ui-text-muted)]">
            Uses locally installed Claude Code CLI. No API key needed — it uses your existing Claude authentication.
          </p>

          <template v-if="!provider.noApiKey">
            <UFormField label="API Key">
              <UInput
                v-model="settings.providers[provider.key]!.apiKey"
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
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
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
      </div>
    </div>

    <!-- Text-to-Speech -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
        Text-to-Speech
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium">Enable TTS</span>
            <p class="text-xs text-[var(--ui-text-muted)]">Show speak button on messages</p>
          </div>
          <USwitch v-model="settings.ttsEnabled" />
        </div>

        <template v-if="settings.ttsEnabled">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium">Auto-Read</span>
              <p class="text-xs text-[var(--ui-text-muted)]">Automatically read responses aloud</p>
            </div>
            <USwitch v-model="settings.ttsAutoRead" />
          </div>

          <UFormField label="Engine">
            <USelectMenu
              v-model="settings.ttsEngine"
              :items="engineOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
          </UFormField>

          <!-- Local voice picker -->
          <UFormField v-if="settings.ttsEngine === 'local'" label="Voice">
            <USelectMenu
              v-model="settings.ttsLocalVoice"
              :items="localVoiceOptions"
              value-key="value"
              placeholder="System default"
              size="sm"
              class="w-full"
              searchable
            />
            <p v-if="!localVoiceOptions.length" class="text-xs text-[var(--ui-text-muted)] mt-1">
              No voices available — your browser may need to load them first.
            </p>
          </UFormField>

          <!-- MiniMax voice picker -->
          <UFormField v-if="settings.ttsEngine === 'minimax'" label="Voice">
            <USelectMenu
              v-model="settings.ttsVoice"
              :items="minimaxVoiceOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
            <p v-if="!settings.providers.minimax?.apiKey" class="text-xs text-[var(--ui-color-error)] mt-1">
              MiniMax API key required — configure it in Providers above.
            </p>
          </UFormField>

          <UFormField label="Speed">
            <USelectMenu
              v-model="settings.ttsSpeed"
              :items="speedOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
          </UFormField>
        </template>
      </div>
    </div>

    <!-- Speech-to-Text -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
        Speech-to-Text
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <UFormField label="Engine">
          <USelectMenu
            v-model="settings.sttEngine"
            :items="sttEngineOptions"
            value-key="value"
            size="sm"
            class="w-full"
          />
          <p class="text-xs text-[var(--ui-text-muted)] mt-1">
            {{ settings.sttEngine === 'browser'
              ? 'Uses browser SpeechRecognition (Chrome/Edge only). Falls back to Whisper in Firefox.'
              : 'Records audio and transcribes via Whisper API. Works in all browsers (Chrome, Firefox, Edge).'
            }}
          </p>
        </UFormField>

        <template v-if="settings.sttEngine === 'whisper'">
          <UFormField label="Provider">
            <USelectMenu
              :model-value="sttPreset"
              :items="sttPresetOptions"
              value-key="value"
              size="sm"
              class="w-full"
              @update:model-value="applySttPreset"
            />
          </UFormField>

          <UFormField label="API Key" required>
            <UInput
              v-model="settings.sttWhisperApiKey"
              type="password"
              placeholder="Enter Whisper API key..."
              class="w-full"
              size="sm"
            />
            <p v-if="sttPreset === 'groq'" class="text-xs text-[var(--ui-text-muted)] mt-1">
              Get a free key at <a href="https://console.groq.com" target="_blank" class="underline">console.groq.com</a>
            </p>
          </UFormField>

          <UFormField v-if="sttPreset === 'custom'" label="API URL">
            <UInput
              v-model="settings.sttWhisperUrl"
              placeholder="https://api.example.com/v1/audio/transcriptions"
              class="w-full"
              size="sm"
            />
          </UFormField>

          <UFormField v-if="sttPreset === 'custom'" label="Model">
            <UInput
              v-model="settings.sttWhisperModel"
              placeholder="whisper-large-v3-turbo"
              class="w-full"
              size="sm"
            />
          </UFormField>
        </template>
      </div>
    </div>

    <!-- Appearance -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
        Appearance
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-8 rounded-lg bg-[var(--ui-bg-elevated)] flex items-center justify-center">
              <UIcon :name="colorModeIcon" class="size-4" />
            </div>
            <div>
              <span class="text-sm font-medium">Color Mode</span>
              <p class="text-xs text-[var(--ui-text-muted)]">
                Currently: {{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}
              </p>
            </div>
          </div>
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--ui-bg-elevated)] hover:bg-[var(--ui-bg-accented)] transition-colors"
            @click="toggleColorMode"
          >
            Switch to {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <button
      :disabled="saving"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      @click="save"
    >
      <UIcon v-if="!saving" name="i-lucide-save" class="size-4" />
      <UIcon v-else name="i-lucide-loader" class="size-4 animate-spin" />
      Save Settings
    </button>

    <!-- Danger Zone -->
    <div class="space-y-3">
      <h3 class="text-xs font-semibold text-red-500 uppercase tracking-wider">
        Danger Zone
      </h3>

      <div class="rounded-lg border border-red-500/30 bg-[var(--ui-bg)] p-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium">Delete All Conversations</span>
            <p class="text-xs text-[var(--ui-text-muted)]">
              Permanently remove all conversations and messages. This cannot be undone.
            </p>
          </div>
          <button
            v-if="!showClearConfirm"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            @click="showClearConfirm = true"
          >
            Delete All
          </button>
          <div v-else class="flex items-center gap-2 shrink-0">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              @click="clearAllConversations"
            >
              Confirm Delete
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--ui-bg-elevated)] hover:bg-[var(--ui-bg-accented)] transition-colors"
              @click="showClearConfirm = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
