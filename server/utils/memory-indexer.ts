import { createMemory } from './memory-store'
import { extractMemories } from './memory-extractor'

let disabled = false

/**
 * Auto-index memories from a completed assistant response.
 * Fire-and-forget: errors are logged but do not affect the chat response.
 * Disables itself after first failure to avoid log spam (e.g. broken onnxruntime).
 */
export async function autoIndexMemories(opts: {
  projectId?: string | null
  conversationId: string
  userMessage: string
  assistantResponse: string
  assistantMessageId: string
}): Promise<void> {
  if (disabled) return

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
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    if (msg.includes('permanently failed') || msg.includes('did not self-register') || msg.includes('no such table')) {
      disabled = true
      console.error('[memory] Auto-indexing disabled due to persistent error:', msg)
    } else {
      console.error('[memory] Failed to auto-index:', msg)
    }
  }
}
