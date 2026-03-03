import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await db.delete(projects).where(eq(projects.id, id))
  return { success: true }
})
