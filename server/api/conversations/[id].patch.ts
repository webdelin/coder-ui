import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    title?: string
    systemPrompt?: string
  }>(event)

  const [updated] = await db
    .update(conversations)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(conversations.id, id))
    .returning()

  return updated
})
