import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export const useTTSStore = defineStore('tts', () => {
  const settings = useSettingsStore()
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentId = ref<string | null>(null)
  const audioRef = ref<HTMLAudioElement | null>(null)

  async function speak(text: string, messageId: string) {
    stop()
    if (!settings.ttsEnabled) return

    currentId.value = messageId
    isLoading.value = true

    // Try MiniMax TTS if configured
    try {
      const hasMinimaxKey = settings.providers.minimax.apiKey
      if (hasMinimaxKey) {
        const response = await fetch('/api/tts/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: settings.ttsVoice,
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.value = audio

          audio.onended = () => {
            isPlaying.value = false
            currentId.value = null
            URL.revokeObjectURL(url)
          }

          isLoading.value = false
          isPlaying.value = true
          await audio.play()
          return
        }
      }
    } catch {
      // fall through to Web Speech API
    }

    // Fallback: Web Speech API
    isLoading.value = false
    if (!('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => {
      isPlaying.value = false
      currentId.value = null
    }
    isPlaying.value = true
    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    audioRef.value?.pause()
    audioRef.value = null
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
    }
    isPlaying.value = false
    isLoading.value = false
    currentId.value = null
  }

  return { isPlaying, isLoading, currentId, speak, stop }
})
