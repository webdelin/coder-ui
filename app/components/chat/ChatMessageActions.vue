<script setup lang="ts">
const tts = useTTSStore()
const toast = useToast()

const props = defineProps<{
  messageId: string
  content: string
}>()

async function copy() {
  await navigator.clipboard.writeText(props.content)
  toast.add({ title: 'Copied to clipboard', color: 'success' })
}
</script>

<template>
  <div class="flex gap-1">
    <UButton
      size="xs"
      variant="ghost"
      color="neutral"
      icon="i-lucide-copy"
      @click="copy"
    />
    <UButton
      size="xs"
      variant="ghost"
      color="neutral"
      :icon="tts.currentId === messageId && tts.isPlaying
        ? 'i-lucide-square'
        : 'i-lucide-volume-2'"
      :loading="tts.currentId === messageId && tts.isLoading"
      @click="tts.currentId === messageId && tts.isPlaying
        ? tts.stop()
        : tts.speak(content, messageId)"
    />
  </div>
</template>
