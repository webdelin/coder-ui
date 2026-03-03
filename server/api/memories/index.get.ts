import { listMemories } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId as string | undefined
  const conversationId = query.conversationId as string | undefined

  return listMemories({ projectId, conversationId })
})
