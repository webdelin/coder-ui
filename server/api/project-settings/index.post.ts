import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects } from '../../db/schema'
import { saveProjectSettings, defaultProjectSettings } from '../../utils/project-settings'
import type { ProjectSettings } from '../../utils/project-settings'

const validModes = ['default', 'acceptEdits', 'bypassPermissions', 'plan']

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    projectId: string
    settings: ProjectSettings
  }>(event)

  if (!body.projectId) {
    throw createError({ statusCode: 400, message: 'projectId is required' })
  }

  const [project] = await db
    .select({ path: projects.path })
    .from(projects)
    .where(eq(projects.id, body.projectId))

  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  // Validate and sanitize
  const s = body.settings
  const settings: ProjectSettings = {
    permissions: {
      defaultMode: validModes.includes(s?.permissions?.defaultMode)
        ? s.permissions.defaultMode
        : defaultProjectSettings.permissions.defaultMode,
      allow: Array.isArray(s?.permissions?.allow)
        ? s.permissions.allow.filter((v): v is string => typeof v === 'string')
        : [],
      deny: Array.isArray(s?.permissions?.deny)
        ? s.permissions.deny.filter((v): v is string => typeof v === 'string')
        : [],
      additionalDirectories: Array.isArray(s?.permissions?.additionalDirectories)
        ? s.permissions.additionalDirectories.filter((v): v is string => typeof v === 'string')
        : [],
    },
    env: typeof s?.env === 'object' && s.env !== null ? s.env : {},
    includeCoAuthoredBy: typeof s?.includeCoAuthoredBy === 'boolean'
      ? s.includeCoAuthoredBy
      : defaultProjectSettings.includeCoAuthoredBy,
    cleanupPeriodDays: typeof s?.cleanupPeriodDays === 'number' && s.cleanupPeriodDays > 0
      ? s.cleanupPeriodDays
      : defaultProjectSettings.cleanupPeriodDays,
  }

  await saveProjectSettings(project.path, settings)

  return { success: true, message: 'Settings saved successfully' }
})
