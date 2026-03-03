import OpenAI from 'openai'
import type { ProviderAdapter, StreamRequest, StreamChunk, ModelDef } from './types'

export const models: ModelDef[] = [
  { id: 'glm-4.7', label: 'GLM-4.7' },
  { id: 'glm-4.6', label: 'GLM-4.6' },
  { id: 'glm-4.5-flash', label: 'GLM-4.5 Flash (Free)' },
]

export const zaiAdapter: ProviderAdapter = {
  name: 'zai',
  models,

  async *stream(req: StreamRequest, apiKey: string): AsyncGenerator<StreamChunk> {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.z.ai/api/paas/v4',
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
