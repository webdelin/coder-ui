import { deleteMemory } from '../../utils/memory-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await deleteMemory(id)
  return { success: true }
})
