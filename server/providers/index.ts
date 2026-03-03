import { anthropicAdapter } from './anthropic'
import { minimaxAdapter } from './minimax'
import { zaiAdapter } from './zai'
import type { ProviderAdapter, ModelDef } from './types'

export type ProviderName = 'anthropic' | 'minimax' | 'zai'

const registry: Record<ProviderName, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  minimax: minimaxAdapter,
  zai: zaiAdapter,
}

export function getProvider(name: ProviderName): ProviderAdapter {
  const p = registry[name]
  if (!p) throw new Error(`Unknown provider: ${name}`)
  return p
}

export function getAllProviderModels(): Array<{
  provider: ProviderName
  providerLabel: string
  models: ModelDef[]
}> {
  return [
    { provider: 'anthropic', providerLabel: 'Claude (Anthropic)', models: anthropicAdapter.models },
    { provider: 'minimax', providerLabel: 'MiniMax', models: minimaxAdapter.models },
    { provider: 'zai', providerLabel: 'Z.AI (Zhipu)', models: zaiAdapter.models },
  ]
}

export type { ProviderAdapter, ModelDef } from './types'
