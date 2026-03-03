import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db'
import { conversations, messages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId as string | undefined

  const baseQuery = db
    .select({
      id: conversations.id,
      title: conversations.title,
      projectId: conversations.projectId,
      provider: conversations.provider,
      model: conversations.model,
      systemPrompt: conversations.systemPrompt,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      messageCount: sql<number>`(select count(*) from ${messages} where ${messages.conversationId} = ${conversations.id})`.as('message_count'),
    })
    .from(conversations)

  if (projectId) {
    return baseQuery
      .where(eq(conversations.projectId, projectId))
      .orderBy(desc(conversations.updatedAt))
  }

  return baseQuery.orderBy(desc(conversations.updatedAt))
})
