import { createMemory } from './memory-store'
import { extractMemories } from './memory-extractor'

/**
 * Auto-index memories from a completed assistant response.
 * Fire-and-forget: errors are logged but do not affect the chat response.
 */
export async function autoIndexMemories(opts: {
  projectId?: string | null
  conversationId: string
  userMessage: string
  assistantResponse: string
  assistantMessageId: string
}): Promise<void> {
  try {
    const memoryTexts = extractMemories(opts.userMessage, opts.assistantResponse)

    for (const content of memoryTexts) {
      await createMemory({
        projectId: opts.projectId,
        conversationId: opts.conversationId,
        content,
        type: 'auto',
        sourceMessageId: opts.assistantMessageId,
      })
    }

    if (memoryTexts.length > 0) {
      console.log(`[memory] Indexed ${memoryTexts.length} memories for conversation ${opts.conversationId}`)
    }
  } catch (err) {
    console.error('[memory] Failed to auto-index:', err)
  }
}
