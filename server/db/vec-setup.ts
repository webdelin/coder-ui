import * as sqliteVec from 'sqlite-vec'
import type Database from 'better-sqlite3'

/**
 * Load sqlite-vec extension and create the vec_memories virtual table.
 * Safe to call multiple times (CREATE ... IF NOT EXISTS).
 */
export function initVectorSearch(sqlite: Database.Database): void {
  sqliteVec.load(sqlite)

  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories
    USING vec0(
      memory_id TEXT PRIMARY KEY,
      embedding float[384]
    )
  `)
}
