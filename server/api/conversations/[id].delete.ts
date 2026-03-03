import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { deleteMemoriesForConversation } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  // Delete vector entries BEFORE cascade removes memory rows
  await deleteMemoriesForConversation(id)

  await db.delete(conversations).where(eq(conversations.id, id))
  return { success: true }
})
