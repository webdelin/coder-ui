<script setup lang="ts">
const tts = useTTSStore()
const toast = useToast()

const props = defineProps<{
  messageId: string
  content: string
}>()

async function copy() {
  await navigator.clipboard.writeText(props.content)
  toast.add({ title: 'Copied', color: 'success' })
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      class="size-7 flex items-center justify-center rounded hover:bg-[var(--ui-bg-elevated)] transition-colors text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)]"
      title="Copy"
      @click="copy"
    >
      <UIcon name="i-lucide-copy" class="size-3.5" />
    </button>
    <button
      class="size-7 flex items-center justify-center rounded hover:bg-[var(--ui-bg-elevated)] transition-colors text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)]"
      title="Text to speech"
      @click="tts.currentId === messageId && tts.isPlaying ? tts.stop() : tts.speak(content, messageId)"
    >
      <UIcon
        :name="tts.currentId === messageId && tts.isPlaying ? 'i-lucide-square' : 'i-lucide-volume-2'"
        class="size-3.5"
      />
    </button>
  </div>
</template>
