export interface ImageBlock {
  type: 'image'
  mediaType: string
  data: string // base64
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: ImageBlock[]
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
  readonly fallbackModels: ModelDef[]
  listModels(apiKey: string, opts?: Record<string, string>): Promise<ModelDef[]>
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
