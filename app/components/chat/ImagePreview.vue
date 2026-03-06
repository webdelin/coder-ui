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
      class="relative size-16 rounded-lg overflow-visible border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]"
    >
      <img
        :src="img.dataUrl"
        :alt="img.name"
        class="size-full object-cover rounded-lg"
      >
      <button
        class="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center rounded-full bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] shadow-sm hover:opacity-80 transition-opacity"
        @click="emit('remove', img.id)"
      >
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </div>
  </div>
</template>
