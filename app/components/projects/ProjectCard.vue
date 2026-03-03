<script setup lang="ts">
import type { Project } from '~/stores/projects'

defineProps<{
  project: Project
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="text-left p-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] hover:bg-[var(--ui-bg-elevated)] hover:border-[var(--ui-border-active)] transition-colors group w-full"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <div class="size-8 rounded-lg bg-[var(--ui-bg-elevated)] group-hover:bg-[var(--ui-bg-accented)] flex items-center justify-center shrink-0 mt-0.5">
        <UIcon name="i-lucide-folder" class="size-4" />
      </div>
      <div class="flex-1 min-w-0">
        <span class="font-semibold text-sm block">{{ project.displayName }}</span>
        <p class="text-xs text-[var(--ui-text-muted)] truncate font-mono mt-0.5">
          {{ project.path }}
        </p>
      </div>
      <UIcon
        name="i-lucide-pencil"
        class="size-3.5 text-[var(--ui-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
      />
    </div>
  </button>
</template>
