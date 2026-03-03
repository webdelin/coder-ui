import { desc } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'

export default defineEventHandler(async () => {
  return db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
})
