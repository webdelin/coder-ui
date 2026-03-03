import { db } from '../../db'
import { providerSettings, appSettings } from '../../db/schema'

export default defineEventHandler(async () => {
  const providers = await db.select().from(providerSettings)
  const app = await db.select().from(appSettings)

  return {
    providers: Object.fromEntries(providers.map(p => [p.provider, p])),
    app: Object.fromEntries(app.map(s => [s.key, s.value])),
  }
})
