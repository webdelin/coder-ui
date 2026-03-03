import * as sqliteVec from 'sqlite-vec'
import type Database from 'better-sqlite3'

/**
 * Load sqlite-vec extension, create memories table and vec_memories virtual table.
 * Safe to call multiple times (CREATE ... IF NOT EXISTS).
 */
export function initVectorSearch(sqlite: Database.Database): void {
  sqliteVec.load(sqlite)

  // Ensure memories table exists (drizzle-kit push can't run when vec tables exist)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'auto',
      source_message_id TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )
  `)

  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories
    USING vec0(
      memory_id TEXT PRIMARY KEY,
      embedding float[384]
    )
  `)
}
