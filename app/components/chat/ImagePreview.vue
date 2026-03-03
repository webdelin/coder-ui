<script setup lang="ts">
import type { PendingImage } from '~/stores/chat'

defineProps<{
  images: PendingImage[]
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div v-if="images.length" class="flex flex-wrap gap-2">
    <div
      v-for="img in images"
      :key="img.id"
      class="relative group size-16 rounded-lg overflow-hidden border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]"
    >
      <img
        :src="img.dataUrl"
        :alt="img.name"
        class="size-full object-cover"
      >
      <button
        class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="emit('remove', img.id)"
      >
        <UIcon name="i-lucide-x" class="size-4 text-white" />
      </button>
    </div>
  </div>
</template>
