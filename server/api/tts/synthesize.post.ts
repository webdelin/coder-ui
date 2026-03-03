import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { providerSettings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    text: string
    voice?: string
    model?: string
    speed?: number
  }>(event)

  // Load MiniMax API key from DB
  const [settings] = await db
    .select()
    .from(providerSettings)
    .where(eq(providerSettings.provider, 'minimax'))

  if (!settings?.apiKey || !settings?.groupId) {
    throw createError({
      statusCode: 500,
      message: 'MiniMax TTS not configured. Add MiniMax API key and Group ID in Settings.',
    })
  }

  const resp = await fetch(
    `https://api.minimax.io/v1/t2a_v2?GroupId=${settings.groupId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model ?? 'speech-2.8-hd',
        text: body.text,
        stream: false,
        voice_setting: {
          voice_id: body.voice ?? 'male-qn-qingse',
          speed: body.speed ?? 1.0,
          vol: 1.0,
          pitch: 0,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
          channel: 1,
        },
      }),
    },
  )

  if (!resp.ok) {
    const text = await resp.text()
    throw createError({
      statusCode: resp.status,
      message: `MiniMax TTS failed: ${text}`,
    })
  }

  const result = await resp.json() as any

  if (result.data?.audio) {
    const audioBuffer = Buffer.from(result.data.audio, 'hex')
    setHeader(event, 'Content-Type', 'audio/mpeg')
    setHeader(event, 'Content-Length', audioBuffer.length.toString())
    return audioBuffer
  }

  throw createError({
    statusCode: 500,
    message: 'No audio data in MiniMax response',
  })
})
