export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamRequest {
  messages: ChatMessage[]
  systemPrompt?: string
  model: string
  maxTokens?: number
  temperature?: number
}

export type StreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done'; tokensUsed?: number }
  | { type: 'error'; message: string }

export interface ProviderAdapter {
  readonly name: string
  readonly models: ModelDef[]
  stream(
    req: StreamRequest,
    apiKey: string,
    opts?: Record<string, string>,
  ): AsyncIterable<StreamChunk>
}

export interface ModelDef {
  id: string
  label: string
}
