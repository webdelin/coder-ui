import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { messages, conversations } from '../../db/schema'
import { streamClaudeCode } from '../../providers/claude-code'
import type { ClaudeCodeOptions } from '../../providers/claude-code'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    conversationId: string
    content: string
    model: string
    cwd?: string
    systemPrompt?: string
    permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
    sessionId?: string
    maxTurns?: number
  }>(event)

  // Save user message to DB
  const userMsgId = crypto.randomUUID()
  await db.insert(messages).values({
    id: userMsgId,
    conversationId: body.conversationId,
    role: 'user',
    content: body.content,
    provider: 'claude-code',
    model: body.model,
  })

  // Update conversation
  await db
    .update(conversations)
    .set({
      updatedAt: new Date().toISOString(),
      model: body.model,
      provider: 'claude-code',
    })
    .where(eq(conversations.id, body.conversationId))

  // Set SSE headers
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  const opts: ClaudeCodeOptions = {
    cwd: body.cwd || process.cwd(),
    model: body.model,
    permissionMode: body.permissionMode || 'acceptEdits',
    systemPrompt: body.systemPrompt,
    sessionId: body.sessionId,
    maxTurns: body.maxTurns || 25,
  }

  const stream = streamClaudeCode(body.content, opts)
  const eventStream = createEventStream(event)

  const startTime = Date.now()
  let fullText = ''
  let claudeSessionId: string | undefined
  const toolCalls: Array<{ name: string; input: any; result?: string }> = []

  ;(async () => {
    try {
      for await (const evt of stream) {
        await eventStream.push(JSON.stringify(evt))

        // Track text content for DB persistence
        if (evt.type === 'text' && evt.text) {
          fullText += evt.text
        }

        // Track session ID
        if (evt.type === 'system_init' && evt.sessionId) {
          claudeSessionId = evt.sessionId
        }

        // Track tool calls
        if (evt.type === 'tool_use') {
          toolCalls.push({
            name: evt.toolName!,
            input: evt.toolInput,
          })
        }
        if (evt.type === 'tool_result' && toolCalls.length > 0) {
          const lastTool = toolCalls[toolCalls.length - 1]
          if (lastTool && !lastTool.result) {
            lastTool.result = evt.toolResult
          }
        }

        // On done, save assistant message to DB
        if (evt.type === 'done') {
          // Build rich content with tool calls
          const contentParts: string[] = []
          if (fullText) contentParts.push(fullText)

          // Store tool calls as structured JSON
          const richContent = JSON.stringify({
            text: fullText,
            toolCalls,
            sessionId: claudeSessionId,
          })

          const assistantMsgId = crypto.randomUUID()
          await db.insert(messages).values({
            id: assistantMsgId,
            conversationId: body.conversationId,
            role: 'assistant',
            content: richContent,
            provider: 'claude-code',
            model: body.model,
            tokensUsed: evt.tokensUsed,
            durationMs: evt.durationMs ?? (Date.now() - startTime),
          })

          // Update conversation with session ID for resume
          if (claudeSessionId) {
            await db
              .update(conversations)
              .set({ systemPrompt: `claude-code-session:${claudeSessionId}` })
              .where(eq(conversations.id, body.conversationId))
          }
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
