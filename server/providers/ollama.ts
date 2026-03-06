import OpenAI from 'openai'
import type { ProviderAdapter, StreamRequest, StreamChunk, ModelDef } from './types'

const DEFAULT_BASE_URL = 'http://localhost:11434/v1'

export const fallbackModels: ModelDef[] = [
  { id: 'llama3.1', label: 'Ollama Llama 3.1' },
  { id: 'llama3.2', label: 'Ollama Llama 3.2' },
  { id: 'codellama', label: 'Ollama Code Llama' },
  { id: 'mistral', label: 'Ollama Mistral' },
  { id: 'gemma2', label: 'Ollama Gemma 2' },
  { id: 'qwen2.5-coder', label: 'Ollama Qwen 2.5 Coder' },
  { id: 'deepseek-coder-v2', label: 'Ollama DeepSeek Coder V2' },
]

function getBaseUrl(opts?: Record<string, string>): string {
  return opts?.baseUrl || process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL
}

export const ollamaAdapter: ProviderAdapter = {
  name: 'ollama',
  fallbackModels,

  async listModels(apiKey: string, opts?: Record<string, string>): Promise<ModelDef[]> {
    const client = new OpenAI({ apiKey: apiKey || 'ollama', baseURL: getBaseUrl(opts) })
    const response = await client.models.list()
    const models: ModelDef[] = []
    for await (const model of response) {
      models.push({
        id: model.id,
        label: model.id,
      })
    }
    models.sort((a, b) => a.id.localeCompare(b.id))
    return models
  },

  async *stream(req: StreamRequest, apiKey: string, opts?: Record<string, string>): AsyncGenerator<StreamChunk> {
    const client = new OpenAI({ apiKey: apiKey || 'ollama', baseURL: getBaseUrl(opts) })

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
