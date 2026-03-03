import { db } from '../../db'
import { conversations } from '../../db/schema'
import { deleteAllConversationMemoryVectors } from '../../utils/memory-store'

export default defineEventHandler(async () => {
  // Delete all vector entries for conversation memories
  deleteAllConversationMemoryVectors()

  await db.delete(conversations)
  return { success: true }
})
