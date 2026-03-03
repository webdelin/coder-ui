import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { messages, providerSettings, conversations } from '../../db/schema'
import { getProvider } from '../../providers'
import type { ProviderName } from '../../providers'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    conversationId: string
    content: string
    provider: ProviderName
    model: string
    systemPrompt?: string
    history: Array<{ role: string; content: string }>
  }>(event)

  // 1. Load API key from DB
  const [settings] = await db
    .select()
    .from(providerSettings)
    .where(eq(providerSettings.provider, body.provider))

  if (!settings?.apiKey) {
    throw createError({
      statusCode: 400,
      message: `No API key configured for ${body.provider}. Go to Settings to add one.`,
    })
  }

  // 2. Save user message to DB
  const userMsgId = crypto.randomUUID()
  await db.insert(messages).values({
    id: userMsgId,
    conversationId: body.conversationId,
    role: 'user',
    content: body.content,
    provider: body.provider,
    model: body.model,
  })

  // 3. Update conversation
  await db
    .update(conversations)
    .set({
      updatedAt: new Date().toISOString(),
      model: body.model,
      provider: body.provider,
    })
    .where(eq(conversations.id, body.conversationId))

  // 4. Set SSE headers
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  // 5. Stream from provider
  const provider = getProvider(body.provider)
  const startTime = Date.now()
  let fullText = ''

  const chatMessages = [
    ...body.history.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    { role: 'user' as const, content: body.content },
  ]

  const stream = provider.stream(
    {
      messages: chatMessages,
      systemPrompt: body.systemPrompt,
      model: body.model,
    },
    settings.apiKey,
  )

  const eventStream = createEventStream(event)

  ;(async () => {
    try {
      for await (const chunk of stream) {
        if (chunk.type === 'delta') {
          fullText += chunk.text
          await eventStream.push(JSON.stringify({ type: 'delta', text: chunk.text }))
        }
        if (chunk.type === 'done') {
          const assistantMsgId = crypto.randomUUID()
          await db.insert(messages).values({
            id: assistantMsgId,
            conversationId: body.conversationId,
            role: 'assistant',
            content: fullText,
            provider: body.provider,
            model: body.model,
            tokensUsed: chunk.tokensUsed,
            durationMs: Date.now() - startTime,
          })
          await eventStream.push(JSON.stringify({
            type: 'done',
            messageId: assistantMsgId,
            tokensUsed: chunk.tokensUsed,
          }))
        }
        if (chunk.type === 'error') {
          await eventStream.push(JSON.stringify({
            type: 'error',
            message: chunk.message,
          }))
        }
      }
    } catch (err: any) {
      await eventStream.push(JSON.stringify({
        type: 'error',
        message: err.message ?? 'Unknown error',
      }))
    } finally {
      await eventStream.close()
    }
  })()

  return eventStream.send()
})
