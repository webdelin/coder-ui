import { eq, asc } from 'drizzle-orm'
import { db } from '../../db'
import { conversations, messages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))

  if (!conv) {
    throw createError({ statusCode: 404, message: 'Conversation not found' })
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt))

  return { ...conv, messages: msgs }
})
