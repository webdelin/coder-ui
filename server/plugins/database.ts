import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../db'
import { resolve } from 'node:path'

export default defineNitroPlugin(() => {
  migrate(db, {
    migrationsFolder: resolve(process.cwd(), 'server/db/migrations'),
  })
  console.log('[db] Migrations applied successfully')
})
