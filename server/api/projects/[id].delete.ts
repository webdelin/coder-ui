import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects } from '../../db/schema'
import { deleteMemoriesForProject } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  // Delete vector entries BEFORE cascade removes memory rows
  await deleteMemoriesForProject(id)

  await db.delete(projects).where(eq(projects.id, id))
  return { success: true }
})
