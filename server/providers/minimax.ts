import type { ProviderAdapter, StreamRequest, StreamChunk, ModelDef } from './types'

export const models: ModelDef[] = [
  { id: 'MiniMax-M2.5', label: 'MiniMax M2.5' },
  { id: 'MiniMax-M2', label: 'MiniMax M2' },
]

export const minimaxAdapter: ProviderAdapter = {
  name: 'minimax',
  models,

  async *stream(
    req: StreamRequest,
    apiKey: string,
    opts: Record<string, string> = {},
  ): AsyncGenerator<StreamChunk> {
    const groupId = opts.groupId ?? ''

    const messages = req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }))

    if (req.systemPrompt) {
      messages.unshift({ role: 'system', content: req.systemPrompt })
    } else {
      const sysMsg = req.messages.find(m => m.role === 'system')
      if (sysMsg) messages.unshift({ role: 'system', content: sysMsg.content })
    }

    const url = `https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=${groupId}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.model,
        messages,
        stream: true,
        max_tokens: req.maxTokens ?? 4096,
      }),
    })

    if (!resp.ok || !resp.body) {
      yield { type: 'error', message: `MiniMax HTTP ${resp.status}` }
      return
    }

    const reader = resp.body
      .pipeThrough(new TextDecoderStream())
      .getReader()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += value

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') {
          yield { type: 'done' }
          return
        }
        try {
          const chunk = JSON.parse(raw)
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) yield { type: 'delta', text: delta }
        } catch {
          // skip malformed chunks
        }
      }
    }

    yield { type: 'done' }
  },
}
