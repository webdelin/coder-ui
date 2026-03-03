import { createMemory } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    projectId?: string
    conversationId?: string
    content: string
    type?: 'auto' | 'manual'
  }>(event)

  if (!body.content?.trim()) {
    throw createError({ statusCode: 400, message: 'Content is required' })
  }

  const id = await createMemory({
    projectId: body.projectId,
    conversationId: body.conversationId,
    content: body.content.trim(),
    type: body.type ?? 'manual',
  })

  return { id, success: true }
})
