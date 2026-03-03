import { db } from '../../db'
import { providerSettings, appSettings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    providers?: Record<string, {
      apiKey?: string
      groupId?: string
      enabled?: boolean
    }>
    app?: Record<string, string>
  }>(event)

  if (body.providers) {
    for (const [provider, vals] of Object.entries(body.providers)) {
      await db
        .insert(providerSettings)
        .values({
          provider,
          apiKey: vals.apiKey,
          groupId: vals.groupId,
          enabled: vals.enabled ?? true,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: providerSettings.provider,
          set: {
            apiKey: vals.apiKey,
            groupId: vals.groupId,
            enabled: vals.enabled ?? true,
            updatedAt: new Date().toISOString(),
          },
        })
    }
  }

  if (body.app) {
    for (const [key, value] of Object.entries(body.app)) {
      await db
        .insert(appSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value },
        })
    }
  }

  return { success: true }
})
