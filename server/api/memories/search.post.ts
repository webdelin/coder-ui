import { searchMemories } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query: string
    projectId?: string
    conversationId?: string
    limit?: number
  }>(event)

  if (!body.query?.trim()) {
    throw createError({ statusCode: 400, message: 'Query is required' })
  }

  return searchMemories(body.query.trim(), {
    projectId: body.projectId,
    conversationId: body.conversationId,
    limit: body.limit,
  })
})
