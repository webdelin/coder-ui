import { db } from '../../db'
import { conversations } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string
    provider: string
    model: string
    systemPrompt?: string
    projectId?: string
  }>(event)

  const id = crypto.randomUUID()
  const [created] = await db.insert(conversations).values({
    id,
    title: body.title ?? 'New Chat',
    projectId: body.projectId || null,
    provider: body.provider,
    model: body.model,
    systemPrompt: body.systemPrompt,
  }).returning()

  return created
})
