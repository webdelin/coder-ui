import { readMultipartFormData } from 'h3'
import { eq } from 'drizzle-orm'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { db } from '../../db'
import { appSettings } from '../../db/schema'

const execFileAsync = promisify(execFile)

async function getAppSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
  return row?.value ?? null
}

// Local transcription using faster-whisper via Python subprocess
async function transcribeLocal(audioData: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('wav') ? 'wav' : 'webm'
  const ts = Date.now()
  const tmpAudio = join(tmpdir(), `coder-ui-stt-${ts}.${ext}`)
  const tmpWav = join(tmpdir(), `coder-ui-stt-${ts}.wav`)

  try {
    await writeFile(tmpAudio, audioData)

    // Convert to 16kHz mono WAV using ffmpeg
    await execFileAsync('ffmpeg', [
      '-i', tmpAudio,
      '-ar', '16000',
      '-ac', '1',
      '-f', 'wav',
      tmpWav,
      '-y',
      '-loglevel', 'error',
    ], { timeout: 30000 })

    // Run faster-whisper via Python
    const pyScript = `
import sys, json
from faster_whisper import WhisperModel
model = WhisperModel("base", device="cpu", compute_type="int8")
segments, _ = model.transcribe(sys.argv[1], language=None)
text = " ".join(s.text.strip() for s in segments)
print(json.dumps({"text": text}))
`
    const { stdout } = await execFileAsync('python3', ['-c', pyScript, tmpWav], {
      timeout: 60000,
    })

    const result = JSON.parse(stdout.trim())
    return result.text || ''
  } finally {
    await unlink(tmpAudio).catch(() => {})
    await unlink(tmpWav).catch(() => {})
  }
}

// Remote transcription via Whisper-compatible API
async function transcribeRemote(
  audioData: Buffer,
  mimeType: string,
  apiUrl: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const blob = new Blob([audioData], { type: mimeType || 'audio/webm' })
  const body = new FormData()
  body.append('file', blob, 'audio.webm')
  body.append('model', model)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
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
  return result.text || ''
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

  const engine = await getAppSetting('sttEngine') || 'local'

  // Only use remote API if explicitly set to 'whisper' AND api key is configured
  if (engine === 'whisper') {
    const whisperApiKey = await getAppSetting('sttWhisperApiKey')
    if (whisperApiKey) {
      const whisperUrl = await getAppSetting('sttWhisperUrl') || 'https://api.groq.com/openai/v1/audio/transcriptions'
      const whisperModel = await getAppSetting('sttWhisperModel') || 'whisper-large-v3-turbo'
      const text = await transcribeRemote(
        audioField.data,
        audioField.type || 'audio/webm',
        whisperUrl,
        whisperApiKey,
        whisperModel,
      )
      return { text }
    }
    // No API key configured — fall through to local
  }

  // Local transcription (default for 'local', 'browser' fallback, or whisper without key)
  try {
    const text = await transcribeLocal(audioField.data, audioField.type || 'audio/webm')
    return { text }
  } catch (e: any) {
    console.error('[STT] Local transcription failed:', e.message)
    throw createError({
      statusCode: 500,
      message: `Local transcription failed: ${e.message}. Install: pip install faster-whisper`,
    })
  }
})
