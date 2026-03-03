import { desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { projects, conversations } from '../../db/schema'

export default defineEventHandler(async () => {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      displayName: projects.displayName,
      path: projects.path,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      conversationCount: sql<number>`(select count(*) from ${conversations} where ${conversations.projectId} = ${projects.id})`.as('conversation_count'),
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt))
})
