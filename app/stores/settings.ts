import { defineStore } from 'pinia'

export type ProviderName = 'anthropic' | 'minimax' | 'zai' | 'claude-code'

export interface ProviderConfig {
  apiKey: string
  groupId: string
  enabled: boolean
}

export interface ModelItem {
  provider: ProviderName
  id: string
  label: string
}

export const useSettingsStore = defineStore('settings', () => {
  const activeProvider = ref<ProviderName>('claude-code')
  const activeModel = ref<string>('claude-sonnet-4-6')
  const systemPrompt = ref<string>('')
  const ttsEnabled = ref<boolean>(true)
  const ttsEngine = ref<'local' | 'minimax'>('local')
  const ttsVoice = ref<string>('male-qn-qingse')
  const ttsLocalVoice = ref<string>('')
  const ttsSpeed = ref<number>(1.0)
  const ttsAutoRead = ref<boolean>(false)

  // Language
  const locale = ref<string>('en')

  // STT settings
  const sttEngine = ref<'browser' | 'local' | 'whisper'>('local')
  const sttWhisperUrl = ref<string>('https://api.groq.com/openai/v1/audio/transcriptions')
  const sttWhisperApiKey = ref<string>('')
  const sttWhisperModel = ref<string>('whisper-large-v3-turbo')

  const providers = ref<Record<string, ProviderConfig>>({
    'claude-code': { apiKey: '', groupId: '', enabled: true },
    anthropic: { apiKey: '', groupId: '', enabled: true },
    minimax: { apiKey: '', groupId: '', enabled: false },
    zai: { apiKey: '', groupId: '', enabled: false },
  })

  const allModels = ref<ModelItem[]>([])

  const availableModels = computed(() =>
    allModels.value.filter(m => providers.value[m.provider]?.enabled),
  )

  const modelsForCurrentProvider = computed(() =>
    availableModels.value.filter(m => m.provider === activeProvider.value),
  )

  async function fetchModels() {
    const data = await $fetch<Array<{
      provider: ProviderName
      providerLabel: string
      models: Array<{ id: string; label: string }>
    }>>('/api/providers')

    allModels.value = data.flatMap(p =>
      p.models.map(m => ({
        provider: p.provider,
        id: m.id,
        label: `${p.providerLabel} - ${m.label}`,
      })),
    )
  }

  async function loadFromServer() {
    const data = await $fetch<{
      providers: Record<string, any>
      app: Record<string, string>
    }>('/api/settings')

    for (const [name, vals] of Object.entries(data.providers)) {
      const key = name as ProviderName
      if (providers.value[key]) {
        providers.value[key].apiKey = vals.apiKey ?? ''
        providers.value[key].groupId = vals.groupId ?? ''
        providers.value[key].enabled = vals.enabled ?? true
      }
    }

    if (data.app.activeProvider) activeProvider.value = data.app.activeProvider as ProviderName
    if (data.app.activeModel) activeModel.value = data.app.activeModel
    if (data.app.systemPrompt) systemPrompt.value = data.app.systemPrompt
    if (data.app.ttsEnabled) ttsEnabled.value = data.app.ttsEnabled === 'true'
    if (data.app.ttsEngine) ttsEngine.value = data.app.ttsEngine as 'local' | 'minimax'
    if (data.app.ttsVoice) ttsVoice.value = data.app.ttsVoice
    if (data.app.ttsLocalVoice) ttsLocalVoice.value = data.app.ttsLocalVoice
    if (data.app.ttsSpeed) ttsSpeed.value = parseFloat(data.app.ttsSpeed)
    if (data.app.ttsAutoRead) ttsAutoRead.value = data.app.ttsAutoRead === 'true'
    if (data.app.sttEngine) sttEngine.value = data.app.sttEngine as 'browser' | 'local' | 'whisper'
    if (data.app.sttWhisperUrl) sttWhisperUrl.value = data.app.sttWhisperUrl
    if (data.app.sttWhisperApiKey) sttWhisperApiKey.value = data.app.sttWhisperApiKey
    if (data.app.sttWhisperModel) sttWhisperModel.value = data.app.sttWhisperModel
    if (data.app.locale) locale.value = data.app.locale
  }

  async function saveToServer() {
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        providers: providers.value,
        app: {
          activeProvider: activeProvider.value,
          activeModel: activeModel.value,
          systemPrompt: systemPrompt.value,
          ttsEnabled: String(ttsEnabled.value),
          ttsEngine: ttsEngine.value,
          ttsVoice: ttsVoice.value,
          ttsLocalVoice: ttsLocalVoice.value,
          ttsSpeed: String(ttsSpeed.value),
          ttsAutoRead: String(ttsAutoRead.value),
          sttEngine: sttEngine.value,
          sttWhisperUrl: sttWhisperUrl.value,
          sttWhisperApiKey: sttWhisperApiKey.value,
          sttWhisperModel: sttWhisperModel.value,
          locale: locale.value,
        },
      },
    })
  }

  function setModel(provider: ProviderName, model: string) {
    activeProvider.value = provider
    activeModel.value = model
  }

  return {
    activeProvider,
    activeModel,
    systemPrompt,
    ttsEnabled,
    ttsEngine,
    ttsVoice,
    ttsLocalVoice,
    ttsSpeed,
    ttsAutoRead,
    sttEngine,
    sttWhisperUrl,
    sttWhisperApiKey,
    sttWhisperModel,
    locale,
    providers,
    allModels,
    availableModels,
    modelsForCurrentProvider,
    fetchModels,
    loadFromServer,
    saveToServer,
    setModel,
  }
})
