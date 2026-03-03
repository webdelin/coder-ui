<script setup lang="ts">
const emit = defineEmits<{
  transcript: [text: string]
  interim: [text: string]
}>()

const toast = useToast()
const isRecording = ref(false)
const isSupported = ref(false)
let recognition: any = null

onMounted(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  isSupported.value = !!SpeechRecognition

  if (!SpeechRecognition) return

  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = navigator.language || 'en-US'

  recognition.onresult = (event: any) => {
    let interimTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        emit('transcript', result[0].transcript)
      } else {
        interimTranscript += result[0].transcript
      }
    }
    if (interimTranscript) {
      emit('interim', interimTranscript)
    }
  }

  recognition.onerror = (event: any) => {
    isRecording.value = false
    const messages: Record<string, string> = {
      'not-allowed': 'Microphone access denied. Allow microphone in browser settings.',
      'no-speech': 'No speech detected. Try again.',
      'audio-capture': 'No microphone found. Check your audio devices.',
      'network': 'Network error. Speech recognition requires internet.',
      'aborted': '',
    }
    const msg = messages[event.error] ?? `Speech recognition error: ${event.error}`
    if (msg) {
      toast.add({ title: msg, color: 'error' })
    }
  }

  recognition.onend = () => {
    // Auto-restart if still recording (browser may stop after silence)
    if (isRecording.value) {
      try {
        recognition.start()
      } catch {
        isRecording.value = false
      }
    }
  }
})

async function toggle() {
  if (!recognition) {
    toast.add({ title: 'Speech recognition not supported in this browser', color: 'error' })
    return
  }

  if (isRecording.value) {
    isRecording.value = false
    recognition.stop()
  } else {
    // Check microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      toast.add({ title: 'Microphone access denied', color: 'error' })
      return
    }

    try {
      recognition.start()
      isRecording.value = true
    } catch (e: any) {
      toast.add({ title: `Could not start recording: ${e.message}`, color: 'error' })
    }
  }
}

onUnmounted(() => {
  if (isRecording.value && recognition) {
    isRecording.value = false
    recognition.stop()
  }
})
</script>

<template>
  <button
    class="size-12 rounded-full flex items-center justify-center shrink-0 transition-all"
    :class="isRecording
      ? 'bg-red-500 text-white mic-pulse'
      : 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] hover:opacity-80'"
    :title="isRecording ? 'Stop recording' : 'Start voice input'"
    @click="toggle"
  >
    <UIcon
      :name="isRecording ? 'i-lucide-mic-off' : 'i-lucide-mic'"
      class="size-5"
    />
  </button>
</template>
