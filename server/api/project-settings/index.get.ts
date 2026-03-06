import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects } from '../../db/schema'
import { getProjectSettings } from '../../utils/project-settings'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId as string

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'projectId is required' })
  }

  const [project] = await db
    .select({ path: projects.path })
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  return getProjectSettings(project.path)
})
