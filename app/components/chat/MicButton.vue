<script setup lang="ts">
const emit = defineEmits<{
  transcript: [text: string]
  interim: [text: string]
}>()

const toast = useToast()
const settings = useSettingsStore()
const isRecording = ref(false)
const status = ref<'idle' | 'starting' | 'recording' | 'transcribing' | 'error'>('idle')
const errorMsg = ref('')
let recognition: any = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

// Expose status to parent
defineExpose({ status, isRecording })

// Determine which STT engine to use
const hasBrowserSTT = ref(false)

onMounted(() => {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  hasBrowserSTT.value = !!SR

  if (SR && settings.sttEngine === 'browser') {
    initBrowserSTT(SR)
  }
})

// Watch for engine changes
watch(() => settings.sttEngine, (engine) => {
  if (engine === 'browser' && hasBrowserSTT.value) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) initBrowserSTT(SR)
  }
})

function initBrowserSTT(SR: any) {
  recognition = new SR()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = navigator.language || 'de-DE'

  recognition.onresult = (event: any) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        emit('transcript', event.results[i][0].transcript)
      } else {
        interim += event.results[i][0].transcript
      }
    }
    if (interim) emit('interim', interim)
  }

  recognition.onerror = (event: any) => {
    console.error('[MicButton] recognition error:', event.error)
    status.value = 'error'
    isRecording.value = false

    const msgs: Record<string, string> = {
      'not-allowed': 'Mikrofon verweigert.',
      'no-speech': 'Keine Sprache erkannt.',
      'audio-capture': 'Kein Mikrofon gefunden.',
      'network': 'Netzwerkfehler bei Spracherkennung.',
      'service-not-allowed': 'Spracherkennung blockiert.',
      'aborted': '',
    }
    const msg = msgs[event.error] ?? `Fehler: ${event.error}`
    if (msg) {
      errorMsg.value = msg
      toast.add({ title: msg, color: 'error' })
    }
  }

  recognition.onstart = () => {
    status.value = 'recording'
  }

  recognition.onend = () => {
    if (isRecording.value) {
      try { recognition.start() } catch { isRecording.value = false; status.value = 'idle' }
    } else {
      status.value = 'idle'
    }
  }
}

// Determine if we should use MediaRecorder (server-side transcription) mode
const useServerSTT = computed(() => {
  if (settings.sttEngine === 'local' || settings.sttEngine === 'whisper') return true
  if (settings.sttEngine === 'browser' && !hasBrowserSTT.value) return true
  return false
})

async function toggle() {
  errorMsg.value = ''

  if (isRecording.value) {
    stopRecording()
    return
  }

  // Start recording
  status.value = 'starting'

  // Request microphone permission
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    status.value = 'error'
    errorMsg.value = 'Mikrofon-Zugriff verweigert'
    toast.add({ title: 'Mikrofon-Zugriff verweigert', color: 'error' })
    return
  }

  if (useServerSTT.value) {
    startMediaRecorder(stream)
  } else {
    // Release stream for browser SpeechRecognition
    stream.getTracks().forEach(t => t.stop())
    startBrowserSTT()
  }
}

function startBrowserSTT() {
  if (!recognition) {
    status.value = 'error'
    errorMsg.value = 'SpeechRecognition nicht verfügbar'
    toast.add({ title: 'SpeechRecognition nicht verfügbar', color: 'error' })
    return
  }

  try {
    recognition.start()
    isRecording.value = true
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e.message
    toast.add({ title: `Start fehlgeschlagen: ${e.message}`, color: 'error' })
  }
}

function startMediaRecorder(stream: MediaStream) {
  audioChunks = []

  // Use webm/opus if supported, fallback to default
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : ''

  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }

  mediaRecorder.onstop = async () => {
    // Stop all tracks to release the mic
    stream.getTracks().forEach(t => t.stop())

    if (!audioChunks.length) {
      status.value = 'idle'
      return
    }

    status.value = 'transcribing'
    emit('interim', '')

    try {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const result = await $fetch<{ text: string }>('/api/stt/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (result.text?.trim()) {
        emit('transcript', result.text.trim())
        emit('interim', '')
      } else {
        emit('interim', '')
        errorMsg.value = 'Keine Sprache erkannt'
      }
      status.value = 'idle'
    } catch (e: any) {
      console.error('[MicButton] Whisper transcription failed:', e)
      status.value = 'error'
      emit('interim', '')
      const msg = e.data?.message || e.message || 'Transkription fehlgeschlagen'
      errorMsg.value = msg
      toast.add({ title: msg, color: 'error' })
    }
  }

  mediaRecorder.onerror = () => {
    stream.getTracks().forEach(t => t.stop())
    status.value = 'error'
    isRecording.value = false
    errorMsg.value = 'Aufnahme fehlgeschlagen'
  }

  mediaRecorder.start(1000) // Collect chunks every second
  isRecording.value = true
  status.value = 'recording'
}

function stopRecording() {
  isRecording.value = false

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else if (recognition) {
    recognition.stop()
    status.value = 'idle'
  }
}

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<template>
  <button
    class="flex items-center justify-center shrink-0 transition-all"
    :class="isRecording
      ? 'text-red-500'
      : status === 'transcribing'
        ? 'text-[var(--ui-text-muted)] animate-pulse'
        : status === 'error'
          ? 'text-[var(--ui-color-error)]'
          : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)]'"
    :title="errorMsg || (isRecording ? 'Aufnahme stoppen' : status === 'transcribing' ? 'Transkribiere...' : 'Spracheingabe')"
    :disabled="status === 'transcribing'"
    @click="toggle"
  >
    <!-- Sound wave animation while recording -->
    <div v-if="isRecording" class="flex items-center gap-[3px] h-5">
      <span class="stt-bar w-[3px] rounded-full bg-red-500" />
      <span class="stt-bar w-[3px] rounded-full bg-red-500" style="animation-delay: 0.15s" />
      <span class="stt-bar w-[3px] rounded-full bg-red-500" style="animation-delay: 0.3s" />
      <span class="stt-bar w-[3px] rounded-full bg-red-500" style="animation-delay: 0.45s" />
      <span class="stt-bar w-[3px] rounded-full bg-red-500" style="animation-delay: 0.6s" />
    </div>
    <UIcon
      v-else-if="status === 'transcribing'"
      name="i-lucide-loader"
      class="size-[18px] animate-spin"
    />
    <UIcon
      v-else
      name="i-lucide-mic"
      class="size-[18px]"
    />
  </button>
</template>
