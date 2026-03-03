import { db } from '../../db'
import { conversations } from '../../db/schema'

export default defineEventHandler(async () => {
  await db.delete(conversations)
  return { success: true }
})
