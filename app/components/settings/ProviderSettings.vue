<script setup lang="ts">
const { t } = useI18n()
const settings = useSettingsStore()
const conversationsStore = useConversationsStore()
const toast = useToast()
const router = useRouter()
const colorMode = useColorMode()
const saving = ref(false)
const showClearConfirm = ref(false)

const providerList = [
  { key: 'claude-code', label: 'Claude Code (Local CLI)', icon: 'i-lucide-terminal', noApiKey: true },
  { key: 'ollama', label: 'Ollama (Local)', icon: 'i-lucide-server', noApiKey: true, hasBaseUrl: true },
  { key: 'minimax', label: 'MiniMax', icon: 'i-lucide-sparkles', noApiKey: false },
  { key: 'zai', label: 'Z.AI (Zhipu)', icon: 'i-lucide-zap', noApiKey: false },
]

const tts = useTTSStore()

const engineOptions = computed(() => [
  { label: t('ttsEngine.local'), value: 'local' },
  { label: t('ttsEngine.minimax'), value: 'minimax' },
])

const sttEngineOptions = computed(() => [
  { label: t('sttEngine.local'), value: 'local' },
  { label: t('sttEngine.browser'), value: 'browser' },
  { label: t('sttEngine.whisper'), value: 'whisper' },
])

const sttPresetOptions = computed(() => [
  { label: t('sttPreset.groq'), value: 'groq', url: 'https://api.groq.com/openai/v1/audio/transcriptions', model: 'whisper-large-v3-turbo' },
  { label: t('sttPreset.openai'), value: 'openai', url: 'https://api.openai.com/v1/audio/transcriptions', model: 'whisper-1' },
  { label: t('sttPreset.custom'), value: 'custom', url: '', model: '' },
])

const sttPreset = ref('groq')

function applySttPreset(presetValue: string) {
  sttPreset.value = presetValue
  const preset = sttPresetOptions.value.find(p => p.value === presetValue)
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

const speedOptions = computed(() => [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: t('speed.normal'), value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 },
])

const colorModeOptions = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' },
]

const localeOptions = [
  { label: 'English', value: 'en' },
  { label: 'Русский', value: 'ru' },
  { label: 'Deutsch', value: 'de' },
]

async function save() {
  saving.value = true
  try {
    await settings.saveToServer()
    await settings.fetchModels()
    toast.add({ title: t('settings.saved'), color: 'success' })
  } catch (e: any) {
    toast.add({ title: t('settings.saveFailed'), description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

async function clearAllConversations() {
  try {
    await conversationsStore.clearAll()
    showClearConfirm.value = false
    toast.add({ title: t('settings.allDeleted'), color: 'success' })
    router.push('/')
  } catch (e: any) {
    toast.add({ title: t('settings.clearFailed'), description: e.message, color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">{{ t('settings.title') }}</h2>
      <p class="text-sm text-[var(--ui-text-muted)] mt-1">
        {{ t('settings.subtitle') }}
      </p>
    </div>

    <!-- Providers -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
        {{ t('settings.providers') }}
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
          <p v-if="provider.noApiKey && !provider.hasBaseUrl" class="text-xs text-[var(--ui-text-muted)]">
            {{ t('settings.cliNote') }}
          </p>

          <template v-if="provider.hasBaseUrl">
            <UFormField label="Base URL">
              <UInput
                v-model="settings.providers[provider.key]!.baseUrl"
                placeholder="http://localhost:11434/v1"
                class="w-full"
                size="sm"
              />
            </UFormField>
            <p class="text-xs text-[var(--ui-text-muted)]">
              {{ t('settings.ollamaNote') }}
            </p>
          </template>

          <template v-if="!provider.noApiKey">
            <UFormField :label="t('settings.apiKeyLabel')">
              <UInput
                v-model="settings.providers[provider.key]!.apiKey"
                type="password"
                :placeholder="t('settings.apiKeyPlaceholder')"
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
        {{ t('settings.defaults') }}
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <UFormField :label="t('settings.systemPrompt')">
          <UTextarea
            v-model="settings.systemPrompt"
            :placeholder="t('settings.systemPromptPlaceholder')"
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
        {{ t('settings.tts') }}
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium">{{ t('settings.enableTts') }}</span>
            <p class="text-xs text-[var(--ui-text-muted)]">{{ t('settings.ttsDescription') }}</p>
          </div>
          <USwitch v-model="settings.ttsEnabled" />
        </div>

        <template v-if="settings.ttsEnabled">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium">{{ t('settings.autoRead') }}</span>
              <p class="text-xs text-[var(--ui-text-muted)]">{{ t('settings.autoReadDescription') }}</p>
            </div>
            <USwitch v-model="settings.ttsAutoRead" />
          </div>

          <UFormField :label="t('settings.engine')">
            <USelectMenu
              v-model="settings.ttsEngine"
              :items="engineOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
          </UFormField>

          <!-- Local voice picker -->
          <UFormField v-if="settings.ttsEngine === 'local'" :label="t('settings.voice')">
            <USelectMenu
              v-model="settings.ttsLocalVoice"
              :items="localVoiceOptions"
              value-key="value"
              :placeholder="t('settings.systemDefault')"
              size="sm"
              class="w-full"
              searchable
            />
            <p v-if="!localVoiceOptions.length" class="text-xs text-[var(--ui-text-muted)] mt-1">
              {{ t('settings.noVoices') }}
            </p>
          </UFormField>

          <!-- MiniMax voice picker -->
          <UFormField v-if="settings.ttsEngine === 'minimax'" :label="t('settings.voice')">
            <USelectMenu
              v-model="settings.ttsVoice"
              :items="minimaxVoiceOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
            <p v-if="!settings.providers.minimax?.apiKey" class="text-xs text-[var(--ui-color-error)] mt-1">
              {{ t('settings.minimaxKeyRequired') }}
            </p>
          </UFormField>

          <UFormField :label="t('settings.speed')">
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
        {{ t('settings.stt') }}
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <UFormField :label="t('settings.engine')">
          <USelectMenu
            v-model="settings.sttEngine"
            :items="sttEngineOptions"
            value-key="value"
            size="sm"
            class="w-full"
          />
          <p class="text-xs text-[var(--ui-text-muted)] mt-1">
            {{ settings.sttEngine === 'local'
              ? t('settings.sttLocalDesc')
              : settings.sttEngine === 'browser'
                ? t('settings.sttBrowserDesc')
                : t('settings.sttWhisperDesc')
            }}
          </p>
        </UFormField>

        <template v-if="settings.sttEngine === 'whisper'">
          <UFormField :label="t('settings.sttProvider')">
            <USelectMenu
              :model-value="sttPreset"
              :items="sttPresetOptions"
              value-key="value"
              size="sm"
              class="w-full"
              @update:model-value="applySttPreset"
            />
          </UFormField>

          <UFormField :label="t('settings.apiKeyLabel')" required>
            <UInput
              v-model="settings.sttWhisperApiKey"
              type="password"
              :placeholder="t('settings.sttApiKeyPlaceholder')"
              class="w-full"
              size="sm"
            />
            <p v-if="sttPreset === 'groq'" class="text-xs text-[var(--ui-text-muted)] mt-1">
              {{ t('settings.sttGroqNote') }} <a href="https://console.groq.com" target="_blank" class="underline">console.groq.com</a>
            </p>
          </UFormField>

          <UFormField v-if="sttPreset === 'custom'" :label="t('settings.sttApiUrl')">
            <UInput
              v-model="settings.sttWhisperUrl"
              placeholder="https://api.example.com/v1/audio/transcriptions"
              class="w-full"
              size="sm"
            />
          </UFormField>

          <UFormField v-if="sttPreset === 'custom'" :label="t('settings.sttModel')">
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
        {{ t('settings.appearance') }}
      </h3>

      <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
        <UFormField :label="t('settings.colorMode')">
          <div class="flex gap-2">
            <button
              v-for="opt in colorModeOptions"
              :key="opt.value"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              :class="colorMode.preference === opt.value
                ? 'bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)]'
                : 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]'"
              @click="colorMode.preference = opt.value"
            >
              <UIcon :name="opt.icon" class="size-3.5" />
              {{ opt.label }}
            </button>
          </div>
        </UFormField>

        <UFormField :label="t('settings.language')">
          <div class="flex gap-2">
            <button
              v-for="opt in localeOptions"
              :key="opt.value"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              :class="settings.locale === opt.value
                ? 'bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)]'
                : 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]'"
              @click="settings.locale = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </UFormField>
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
      {{ t('settings.save') }}
    </button>

    <!-- Danger Zone -->
    <div class="space-y-3">
      <h3 class="text-xs font-semibold text-red-500 uppercase tracking-wider">
        {{ t('settings.dangerZone') }}
      </h3>

      <div class="rounded-lg border border-red-500/30 bg-[var(--ui-bg)] p-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium">{{ t('settings.deleteAll') }}</span>
            <p class="text-xs text-[var(--ui-text-muted)]">
              {{ t('settings.deleteAllDescription') }}
            </p>
          </div>
          <button
            v-if="!showClearConfirm"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            @click="showClearConfirm = true"
          >
            {{ t('settings.deleteAllButton') }}
          </button>
          <div v-else class="flex items-center gap-2 shrink-0">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              @click="clearAllConversations"
            >
              {{ t('settings.confirmDelete') }}
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--ui-bg-elevated)] hover:bg-[var(--ui-bg-accented)] transition-colors"
              @click="showClearConfirm = false"
            >
              {{ t('project.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
