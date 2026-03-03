import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { initVectorSearch } from './vec-setup'

const dbPath = process.env.DATABASE_PATH
  ?? resolve(process.cwd(), 'data/chat.db')

// Ensure data directory exists
mkdirSync(resolve(dbPath, '..'), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Load sqlite-vec extension and create vector tables
initVectorSearch(sqlite)

export const db = drizzle(sqlite, { schema })
export const rawDb = sqlite
export type DB = typeof db
