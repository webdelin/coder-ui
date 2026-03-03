import { db } from '../../db'
import { providerSettings } from '../../db/schema'
import { fetchAllProviderModels } from '../../providers'
import type { ProviderName } from '../../providers'

export default defineEventHandler(async () => {
  // Load API keys from DB
  const settings = await db.select().from(providerSettings)
  const apiKeys: Partial<Record<ProviderName, string>> = {}

  for (const s of settings) {
    if (s.apiKey) {
      apiKeys[s.provider as ProviderName] = s.apiKey
    }
  }

  return fetchAllProviderModels(apiKeys)
})
