import OpenAI from 'openai'
import type { ProviderAdapter, StreamRequest, StreamChunk, ModelDef } from './types'

export const models: ModelDef[] = [
  { id: 'MiniMax-M2.5', label: 'MiniMax M2.5' },
  { id: 'MiniMax-M2.5-highspeed', label: 'MiniMax M2.5 Highspeed' },
  { id: 'MiniMax-M2.1', label: 'MiniMax M2.1' },
  { id: 'MiniMax-M2.1-highspeed', label: 'MiniMax M2.1 Highspeed' },
  { id: 'MiniMax-M2', label: 'MiniMax M2' },
]

export const minimaxAdapter: ProviderAdapter = {
  name: 'minimax',
  models,

  async *stream(req: StreamRequest, apiKey: string): AsyncGenerator<StreamChunk> {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.minimax.io/v1',
    })

    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> =
      req.messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

    if (req.systemPrompt) {
      messages.unshift({ role: 'system', content: req.systemPrompt })
    }

    const stream = await client.chat.completions.create({
      model: req.model,
      messages,
      stream: true,
      max_tokens: req.maxTokens ?? 4096,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield { type: 'delta', text: delta }
      if (chunk.choices[0]?.finish_reason === 'stop') {
        yield { type: 'done', tokensUsed: chunk.usage?.completion_tokens }
      }
    }
  },
}
