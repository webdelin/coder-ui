import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await db.delete(conversations).where(eq(conversations.id, id))
  return { success: true }
})
