import { readMultipartFormData } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { appSettings } from '../../db/schema'

async function getAppSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
  return row?.value ?? null
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'No form data' })
  }

  const audioField = formData.find(f => f.name === 'audio')
  if (!audioField || !audioField.data) {
    throw createError({ statusCode: 400, message: 'No audio file provided' })
  }

  const whisperUrl = await getAppSetting('sttWhisperUrl') || 'https://api.groq.com/openai/v1/audio/transcriptions'
  const whisperApiKey = await getAppSetting('sttWhisperApiKey')
  const whisperModel = await getAppSetting('sttWhisperModel') || 'whisper-large-v3-turbo'

  if (!whisperApiKey) {
    throw createError({
      statusCode: 400,
      message: 'Whisper API key not configured. Set it in Settings > Speech-to-Text.',
    })
  }

  // Build multipart form for Whisper-compatible API
  const blob = new Blob([audioField.data], { type: audioField.type || 'audio/webm' })
  const body = new FormData()
  body.append('file', blob, audioField.filename || 'audio.webm')
  body.append('model', whisperModel)

  const response = await fetch(whisperUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whisperApiKey}`,
    },
    body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[STT] Whisper API error:', response.status, errorText)
    throw createError({
      statusCode: response.status,
      message: `Whisper API error: ${errorText}`,
    })
  }

  const result = await response.json() as { text: string }
  return { text: result.text }
})
