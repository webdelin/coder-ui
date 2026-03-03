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
  const ttsVoice = ref<string>('male-qn-qingse')

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
    if (data.app.ttsVoice) ttsVoice.value = data.app.ttsVoice
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
          ttsVoice: ttsVoice.value,
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
    ttsVoice,
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
