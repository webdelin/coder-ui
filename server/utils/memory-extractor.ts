/**
 * Extract key facts from an assistant response to store as memories.
 * Returns an array of memory strings suitable for embedding.
 */
export function extractMemories(
  userMessage: string,
  assistantResponse: string,
): string[] {
  // For Claude Code responses, parse the rich JSON content
  let textContent = assistantResponse
  try {
    const parsed = JSON.parse(assistantResponse)
    if (parsed.text) textContent = parsed.text
  } catch {
    // Not JSON, use as-is
  }

  // Skip very short responses
  if (textContent.length < 100) return []

  const userSummary = userMessage.length > 200
    ? userMessage.slice(0, 200) + '...'
    : userMessage

  // Split into paragraphs, filter out code blocks and noise
  const paragraphs = textContent
    .split(/\n{2,}/)
    .map((p: string) => p.replace(/```[\s\S]*?```/g, '').trim())
    .filter((p: string) => p.length > 50 && p.length < 1000)
    .filter((p: string) => !p.startsWith('```'))

  const memories: string[] = []

  if (paragraphs.length === 0) {
    // Fallback: one memory from the whole exchange
    memories.push(`Q: ${userSummary}\nA: ${textContent.slice(0, 500)}`)
  } else {
    // Take the most substantive paragraphs (up to 5)
    for (const para of paragraphs.slice(0, 5)) {
      memories.push(`Context: ${userSummary}\n${para}`)
    }
  }

  return memories
}
