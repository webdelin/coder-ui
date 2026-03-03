import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    displayName?: string
  }>(event)

  const [updated] = await db
    .update(projects)
    .set({
      ...(body.displayName ? { displayName: body.displayName } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id))
    .returning()

  return updated
})
