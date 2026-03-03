import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'
import type { ModelDef } from './types'

export const fallbackModels: ModelDef[] = [
  { id: 'claude-opus-4-6', label: 'Claude Code Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Claude Code Sonnet 4.6' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Code Haiku 4.5' },
]

export interface ClaudeCodeEvent {
  type: 'text' | 'tool_use' | 'tool_result' | 'thinking' | 'system_init' | 'done' | 'error'
  text?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  toolUseId?: string
  toolResult?: string
  sessionId?: string
  model?: string
  tools?: string[]
  numTurns?: number
  totalCost?: number
  tokensUsed?: number
  durationMs?: number
  message?: string
}

export interface ClaudeCodeOptions {
  cwd?: string
  model?: string
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  allowedTools?: string[]
  maxTurns?: number
  systemPrompt?: string
  sessionId?: string
}

export async function* streamClaudeCode(
  prompt: string,
  opts: ClaudeCodeOptions,
): AsyncGenerator<ClaudeCodeEvent> {
  const abortController = new AbortController()

  const response = query({
    prompt,
    options: {
      abortController,
      cwd: opts.cwd || process.cwd(),
      model: opts.model || 'claude-sonnet-4-6',
      permissionMode: opts.permissionMode || 'acceptEdits',
      allowedTools: opts.allowedTools || [
        'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
        'WebFetch', 'WebSearch', 'TodoWrite', 'NotebookEdit',
      ],
      maxTurns: opts.maxTurns || 25,
      ...(opts.systemPrompt ? { systemPrompt: opts.systemPrompt } : {}),
      ...(opts.sessionId ? { resume: opts.sessionId } : {}),
      allowDangerouslySkipPermissions: opts.permissionMode === 'bypassPermissions',
      // Inject fetch patch to remove empty text blocks (SDK bug workaround)
      executableArgs: ['--require', join(process.cwd(), 'server/utils/patch-empty-blocks.cjs')],
    },
  })

  try {
    for await (const message of response) {
      if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
        yield {
          type: 'system_init',
          sessionId: message.session_id,
          model: (message as any).model,
          tools: (message as any).tools,
        }
      }

      if (message.type === 'assistant') {
        const assistantMsg = message as any
        if (assistantMsg.message?.content) {
          for (const block of assistantMsg.message.content) {
            if (block.type === 'text' && block.text) {
              yield { type: 'text', text: block.text }
            }
            if (block.type === 'tool_use') {
              yield {
                type: 'tool_use',
                toolName: block.name,
                toolInput: block.input,
                toolUseId: block.id,
              }
            }
            if (block.type === 'thinking' && block.thinking) {
              yield { type: 'thinking', text: block.thinking }
            }
          }
        }
      }

      if (message.type === 'user') {
        const userMsg = message as any
        if (userMsg.message?.content) {
          for (const block of userMsg.message.content) {
            if (block.type === 'tool_result') {
              const resultText = Array.isArray(block.content)
                ? block.content
                    .filter((c: any) => c.type === 'text')
                    .map((c: any) => c.text)
                    .join('\n')
                : typeof block.content === 'string'
                  ? block.content
                  : JSON.stringify(block.content)

              yield {
                type: 'tool_result',
                toolUseId: block.tool_use_id,
                toolResult: resultText,
              }
            }
          }
        }
      }

      if (message.type === 'result') {
        const result = message as any
        yield {
          type: 'done',
          numTurns: result.num_turns,
          totalCost: result.total_cost_usd,
          tokensUsed: result.usage?.output_tokens,
          durationMs: result.duration_ms,
          sessionId: result.session_id,
          text: result.subtype === 'success' ? result.result : undefined,
          message: result.subtype !== 'success'
            ? `Error: ${result.subtype} - ${result.errors?.join(', ')}`
            : undefined,
        }
      }
    }
  } catch (err: any) {
    yield { type: 'error', message: err.message ?? 'Unknown Claude Code error' }
  }
}
