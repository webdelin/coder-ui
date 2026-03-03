import { anthropicAdapter } from './anthropic'
import { minimaxAdapter } from './minimax'
import { zaiAdapter } from './zai'
import { models as claudeCodeModels } from './claude-code'
import type { ProviderAdapter, ModelDef } from './types'

export type ProviderName = 'anthropic' | 'minimax' | 'zai' | 'claude-code'

const registry: Record<Exclude<ProviderName, 'claude-code'>, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  minimax: minimaxAdapter,
  zai: zaiAdapter,
}

export function getProvider(name: ProviderName): ProviderAdapter {
  if (name === 'claude-code') {
    throw new Error('Claude Code uses a separate streaming endpoint. Use /api/chat/claude-code instead.')
  }
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
    { provider: 'claude-code', providerLabel: 'Claude Code', models: claudeCodeModels },
    { provider: 'anthropic', providerLabel: 'Claude API', models: anthropicAdapter.models },
    { provider: 'minimax', providerLabel: 'MiniMax', models: minimaxAdapter.models },
    { provider: 'zai', providerLabel: 'Z.AI (Zhipu)', models: zaiAdapter.models },
  ]
}

export type { ProviderAdapter, ModelDef } from './types'
