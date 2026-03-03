import { getAllProviderModels } from '../../providers'

export default defineEventHandler(() => {
  return getAllProviderModels()
})
