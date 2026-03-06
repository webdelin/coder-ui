import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { messages, conversations } from '../../db/schema'
import { streamClaudeCode } from '../../providers/claude-code'
import type { ClaudeCodeOptions } from '../../providers/claude-code'
import { autoIndexMemories } from '../../utils/memory-indexer'
import { searchMemories } from '../../utils/memory-store'
import { getProjectSettings } from '../../utils/project-settings'

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
    images?: Array<{ mediaType: string; data: string }>
  }>(event)

  // Look up conversation's projectId for memory scoping
  const [conv] = await db
    .select({ projectId: conversations.projectId })
    .from(conversations)
    .where(eq(conversations.id, body.conversationId))

  // Search for relevant memories
  let memoryContext = ''
  try {
    const relevantMemories = await searchMemories(body.content, {
      projectId: conv?.projectId ?? undefined,
      conversationId: body.conversationId,
      limit: 5,
    })
    if (relevantMemories.length > 0) {
      memoryContext = '\n\n<relevant_memories>\n'
        + relevantMemories.map(m => `- ${m.content}`).join('\n')
        + '\n</relevant_memories>'
    }
  } catch {
    // Don't block chat if memory search fails
  }

  // Save images to temp files so Claude Code can read them
  const tempImagePaths: string[] = []
  if (body.images?.length) {
    const tmpDir = join(body.cwd || process.cwd(), '.claude', 'tmp')
    await mkdir(tmpDir, { recursive: true })

    for (const img of body.images) {
      const ext = img.mediaType.split('/')[1] || 'png'
      const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const filepath = join(tmpDir, filename)
      await writeFile(filepath, Buffer.from(img.data, 'base64'))
      tempImagePaths.push(filepath)
    }
  }

  // Build prompt with image references
  let prompt = body.content || ''
  if (tempImagePaths.length) {
    const imageRefs = tempImagePaths.map(p => `Please analyze this image: ${p}`).join('\n')
    prompt = prompt.trim()
      ? `${imageRefs}\n\n${prompt}`
      : imageRefs
  }
  // Ensure prompt is never empty
  if (!prompt.trim()) {
    prompt = 'Hello'
  }

  // Save user message to DB (with images as data URLs)
  const userMsgId = crypto.randomUUID()
  const imageDataUrls = body.images?.map(img => `data:${img.mediaType};base64,${img.data}`)

  await db.insert(messages).values({
    id: userMsgId,
    conversationId: body.conversationId,
    role: 'user',
    content: body.content,
    images: imageDataUrls?.length ? JSON.stringify(imageDataUrls) : null,
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

  const effectiveSystemPrompt = (body.systemPrompt || '') + memoryContext || undefined

  // Load per-project settings from .claude/settings.json
  const cwd = body.cwd || process.cwd()
  const projectSettings = await getProjectSettings(cwd)

  const opts: ClaudeCodeOptions = {
    cwd,
    model: body.model,
    permissionMode: body.permissionMode || projectSettings.permissions.defaultMode || 'acceptEdits',
    systemPrompt: effectiveSystemPrompt,
    sessionId: body.sessionId,
    maxTurns: body.maxTurns || 25,
    ...(projectSettings.permissions.deny.length ? { disallowedTools: projectSettings.permissions.deny } : {}),
    ...(projectSettings.permissions.additionalDirectories.length ? { additionalDirectories: projectSettings.permissions.additionalDirectories } : {}),
    ...(Object.keys(projectSettings.env).length ? { env: projectSettings.env } : {}),
  }

  const stream = streamClaudeCode(prompt, opts)
  const eventStream = createEventStream(event)

  const startTime = Date.now()
  let fullText = ''
  let claudeSessionId: string | undefined
  const toolCalls: Array<{ name: string; input: any; result?: string }> = []

  ;(async () => {
    try {
      for await (const evt of stream) {
        await eventStream.push(JSON.stringify(evt))

        if (evt.type === 'text' && evt.text) {
          fullText += evt.text
        }

        if (evt.type === 'system_init' && evt.sessionId) {
          claudeSessionId = evt.sessionId
        }

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

        if (evt.type === 'done') {
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

          // Auto-index memories (fire-and-forget)
          autoIndexMemories({
            projectId: conv?.projectId,
            conversationId: body.conversationId,
            userMessage: body.content,
            assistantResponse: fullText,
            assistantMessageId: assistantMsgId,
          }).catch(() => {})

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
      // Clean up temp image files
      for (const p of tempImagePaths) {
        unlink(p).catch(() => {})
      }
      await eventStream.close()
    }
  })()

  return eventStream.send()
})
