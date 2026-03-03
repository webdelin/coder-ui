import { existsSync } from 'node:fs'
import { basename } from 'node:path'
import { db } from '../../db'
import { projects } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    path: string
    displayName?: string
  }>(event)

  if (!body.path?.trim()) {
    throw createError({ statusCode: 400, message: 'Path is required' })
  }

  const dirPath = body.path.trim()

  if (!existsSync(dirPath)) {
    throw createError({ statusCode: 400, message: `Directory does not exist: ${dirPath}` })
  }

  const id = crypto.randomUUID()
  const name = basename(dirPath)

  const [created] = await db.insert(projects).values({
    id,
    name,
    displayName: body.displayName?.trim() || name,
    path: dirPath,
  }).returning()

  return created
})
