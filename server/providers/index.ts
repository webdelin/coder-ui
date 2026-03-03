import { anthropicAdapter } from './anthropic'
import { minimaxAdapter } from './minimax'
import { zaiAdapter } from './zai'
import { fallbackModels as claudeCodeFallbackModels } from './claude-code'
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

export interface ProviderModels {
  provider: ProviderName
  providerLabel: string
  models: ModelDef[]
}

const providerLabels: Record<ProviderName, string> = {
  'claude-code': 'Claude Code',
  anthropic: 'Claude API',
  minimax: 'MiniMax',
  zai: 'Z.AI (Zhipu)',
}

/**
 * Fetch models dynamically from provider APIs.
 * Falls back to hardcoded models if no API key or API call fails.
 */
export async function fetchAllProviderModels(
  apiKeys: Partial<Record<ProviderName, string>>,
): Promise<ProviderModels[]> {
  const results: ProviderModels[] = []

  // Claude Code uses same models as Anthropic API
  const anthropicKey = apiKeys.anthropic
  if (anthropicKey) {
    try {
      const models = await anthropicAdapter.listModels(anthropicKey)
      results.push({
        provider: 'claude-code',
        providerLabel: providerLabels['claude-code'],
        models: models.map(m => ({ id: m.id, label: `Claude Code ${m.label}` })),
      })
    } catch {
      results.push({
        provider: 'claude-code',
        providerLabel: providerLabels['claude-code'],
        models: claudeCodeFallbackModels,
      })
    }
  } else {
    results.push({
      provider: 'claude-code',
      providerLabel: providerLabels['claude-code'],
      models: claudeCodeFallbackModels,
    })
  }

  // Regular providers
  for (const [name, adapter] of Object.entries(registry) as [Exclude<ProviderName, 'claude-code'>, ProviderAdapter][]) {
    const key = apiKeys[name]
    if (key) {
      try {
        const models = await adapter.listModels(key)
        results.push({
          provider: name,
          providerLabel: providerLabels[name],
          models,
        })
      } catch {
        results.push({
          provider: name,
          providerLabel: providerLabels[name],
          models: adapter.fallbackModels,
        })
      }
    } else {
      results.push({
        provider: name,
        providerLabel: providerLabels[name],
        models: adapter.fallbackModels,
      })
    }
  }

  return results
}

export type { ProviderAdapter, ModelDef } from './types'
