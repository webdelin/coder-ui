import { db } from '../../db'
import { providerSettings } from '../../db/schema'
import { fetchAllProviderModels } from '../../providers'
import type { ProviderName } from '../../providers'

const envKeyMap: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  minimax: 'MINIMAX_API_KEY',
  zai: 'ZAI_API_KEY',
}

export default defineEventHandler(async () => {
  // Load API keys from DB, fall back to env vars
  const settings = await db.select().from(providerSettings)
  const apiKeys: Partial<Record<ProviderName, string>> = {}

  for (const s of settings) {
    if (s.apiKey) {
      apiKeys[s.provider as ProviderName] = s.apiKey
    }
  }

  // Fill in from env vars where DB has no key
  for (const [provider, envVar] of Object.entries(envKeyMap)) {
    if (!apiKeys[provider as ProviderName]) {
      const envKey = process.env[envVar]
      if (envKey) {
        apiKeys[provider as ProviderName] = envKey
      }
    }
  }

  return fetchAllProviderModels(apiKeys)
})
