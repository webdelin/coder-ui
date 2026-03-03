import Anthropic from '@anthropic-ai/sdk'
import type { ProviderAdapter, StreamRequest, StreamChunk, ModelDef } from './types'

export const models: ModelDef[] = [
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
]

export const anthropicAdapter: ProviderAdapter = {
  name: 'anthropic',
  models,

  async *stream(req: StreamRequest, apiKey: string): AsyncGenerator<StreamChunk> {
    const client = new Anthropic({ apiKey })

    const systemPrompt = req.systemPrompt
      ?? req.messages.find(m => m.role === 'system')?.content

    const userMessages = req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const stream = client.messages.stream({
      model: req.model,
      max_tokens: req.maxTokens ?? 8192,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: userMessages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'delta', text: event.delta.text }
      }
    }

    const finalMessage = await stream.finalMessage()
    yield {
      type: 'done',
      tokensUsed: finalMessage.usage.output_tokens,
    }
  },
}
