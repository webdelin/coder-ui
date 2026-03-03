import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export interface LocalVoiceInfo {
  name: string
  lang: string
}

export const useTTSStore = defineStore('tts', () => {
  const settings = useSettingsStore()
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentId = ref<string | null>(null)
  const audioRef = ref<HTMLAudioElement | null>(null)

  // Store only plain data, not browser SpeechSynthesisVoice objects
  const localVoices = ref<LocalVoiceInfo[]>([])

  function loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    localVoices.value = voices.map(v => ({ name: v.name, lang: v.lang }))
  }

  onMounted(() => {
    loadVoices()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  function findBrowserVoice(name: string): SpeechSynthesisVoice | undefined {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    return window.speechSynthesis.getVoices().find(v => v.name === name)
  }

  async function speak(text: string, messageId: string) {
    stop()
    if (!settings.ttsEnabled) return

    currentId.value = messageId
    isLoading.value = true

    if (settings.ttsEngine === 'minimax') {
      await speakMinimax(text)
    } else {
      speakLocal(text)
    }
  }

  async function speakMinimax(text: string) {
    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.ttsVoice,
          speed: settings.ttsSpeed,
        }),
      })

      if (!response.ok) {
        speakLocal(text)
        return
      }

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
    } catch {
      speakLocal(text)
    }
  }

  function speakLocal(text: string) {
    isLoading.value = false
    if (!('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = settings.ttsSpeed

    if (settings.ttsLocalVoice) {
      const voice = findBrowserVoice(settings.ttsLocalVoice)
      if (voice) utterance.voice = voice
    }

    utterance.onend = () => {
      isPlaying.value = false
      currentId.value = null
    }
    utterance.onerror = () => {
      isPlaying.value = false
      currentId.value = null
    }

    isPlaying.value = true
    window.speechSynthesis.speak(utterance)
  }

  async function autoSpeak(text: string, messageId: string) {
    if (!settings.ttsAutoRead || !settings.ttsEnabled) return
    await speak(text, messageId)
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

  return { isPlaying, isLoading, currentId, localVoices, speak, autoSpeak, stop }
})
