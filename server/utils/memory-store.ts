import { eq, or } from 'drizzle-orm'
import { db, rawDb } from '../db'
import { memories } from '../db/schema'
import { generateEmbedding } from './embeddings'

export interface CreateMemoryInput {
  projectId?: string | null
  conversationId?: string | null
  content: string
  type?: 'auto' | 'manual'
  sourceMessageId?: string
}

export interface MemorySearchResult {
  id: string
  content: string
  type: string
  projectId: string | null
  conversationId: string | null
  distance: number
  createdAt: string
}

/**
 * Create a memory and its vector embedding.
 */
export async function createMemory(input: CreateMemoryInput): Promise<string> {
  const id = crypto.randomUUID()
  const embedding = await generateEmbedding(input.content)

  await db.insert(memories).values({
    id,
    projectId: input.projectId ?? null,
    conversationId: input.conversationId ?? null,
    content: input.content,
    type: input.type ?? 'auto',
    sourceMessageId: input.sourceMessageId,
  })

  rawDb.prepare(
    'INSERT INTO vec_memories(memory_id, embedding) VALUES (?, ?)',
  ).run(id, embedding)

  return id
}

/**
 * Delete a memory and its vector.
 */
export async function deleteMemory(id: string): Promise<void> {
  rawDb.prepare('DELETE FROM vec_memories WHERE memory_id = ?').run(id)
  await db.delete(memories).where(eq(memories.id, id))
}

/**
 * Delete all memories (and their vectors) for a project.
 * Must be called BEFORE deleting the project (cascade removes memory rows).
 */
export async function deleteMemoriesForProject(projectId: string): Promise<void> {
  const rows = await db
    .select({ id: memories.id })
    .from(memories)
    .where(eq(memories.projectId, projectId))

  if (rows.length > 0) {
    const placeholders = rows.map(() => '?').join(',')
    rawDb.prepare(
      `DELETE FROM vec_memories WHERE memory_id IN (${placeholders})`,
    ).run(...rows.map(r => r.id))
  }
}

/**
 * Delete all memories (and their vectors) for a conversation.
 * Must be called BEFORE deleting the conversation.
 */
export async function deleteMemoriesForConversation(conversationId: string): Promise<void> {
  const rows = await db
    .select({ id: memories.id })
    .from(memories)
    .where(eq(memories.conversationId, conversationId))

  if (rows.length > 0) {
    const placeholders = rows.map(() => '?').join(',')
    rawDb.prepare(
      `DELETE FROM vec_memories WHERE memory_id IN (${placeholders})`,
    ).run(...rows.map(r => r.id))
  }
}

/**
 * Delete all vectors for memories that belong to any conversation.
 * Used before bulk-deleting all conversations.
 */
export function deleteAllConversationMemoryVectors(): void {
  rawDb.prepare(`
    DELETE FROM vec_memories
    WHERE memory_id IN (
      SELECT id FROM memories WHERE conversation_id IS NOT NULL
    )
  `).run()
}

/**
 * Semantic search across memories.
 */
export async function searchMemories(
  query: string,
  opts: {
    projectId?: string
    conversationId?: string
    limit?: number
  } = {},
): Promise<MemorySearchResult[]> {
  const limit = opts.limit ?? 10
  const queryEmbedding = await generateEmbedding(query)

  // KNN search in vec_memories
  const vecResults = rawDb.prepare(`
    SELECT memory_id, distance
    FROM vec_memories
    WHERE embedding MATCH ?
    ORDER BY distance
    LIMIT ?
  `).all(queryEmbedding, limit * 3) as Array<{ memory_id: string; distance: number }>

  if (vecResults.length === 0) return []

  const distanceMap = new Map(vecResults.map(r => [r.memory_id, r.distance]))
  const memoryIds = vecResults.map(r => r.memory_id)

  // Filter by scope in the memories table
  const placeholders = memoryIds.map(() => '?').join(',')
  let scopeWhere = ''
  const params: any[] = [...memoryIds]

  if (opts.projectId && opts.conversationId) {
    scopeWhere = 'AND (project_id = ? OR conversation_id = ?)'
    params.push(opts.projectId, opts.conversationId)
  } else if (opts.projectId) {
    scopeWhere = 'AND project_id = ?'
    params.push(opts.projectId)
  } else if (opts.conversationId) {
    scopeWhere = 'AND conversation_id = ?'
    params.push(opts.conversationId)
  }

  const memoryRows = rawDb.prepare(`
    SELECT id, content, type, project_id, conversation_id, created_at
    FROM memories
    WHERE id IN (${placeholders}) ${scopeWhere}
  `).all(...params) as Array<{
    id: string
    content: string
    type: string
    project_id: string | null
    conversation_id: string | null
    created_at: string
  }>

  return memoryRows
    .map(row => ({
      id: row.id,
      content: row.content,
      type: row.type,
      projectId: row.project_id,
      conversationId: row.conversation_id,
      distance: distanceMap.get(row.id) ?? Infinity,
      createdAt: row.created_at,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

/**
 * List memories chronologically (non-semantic).
 */
export async function listMemories(opts: {
  projectId?: string
  conversationId?: string
}) {
  const conditions = []
  if (opts.projectId) conditions.push(eq(memories.projectId, opts.projectId))
  if (opts.conversationId) conditions.push(eq(memories.conversationId, opts.conversationId))

  if (conditions.length === 0) {
    return db.select().from(memories).orderBy(memories.createdAt)
  }

  return db
    .select()
    .from(memories)
    .where(conditions.length === 1 ? conditions[0] : or(...conditions))
    .orderBy(memories.createdAt)
}
