<script setup lang="ts">
const chat = useChatStore()
const settings = useSettingsStore()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const modelSelectItems = computed(() =>
  settings.allModels.map(m => ({
    label: m.label,
    value: `${m.provider}::${m.id}`,
  })),
)

const selectedModelValue = computed({
  get: () => `${settings.activeProvider}::${settings.activeModel}`,
  set: (val: string) => {
    const [provider, ...modelParts] = val.split('::')
    const model = modelParts.join('::')
    settings.setModel(provider as any, model)
  },
})

function submit() {
  if (!input.value.trim() || chat.isStreaming) return
  chat.sendMessage(input.value.trim())
  input.value = ''
  // Reset textarea height
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-end gap-3">
      <!-- Input area -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="input"
          placeholder="Type a message..."
          class="w-full min-h-12 bg-[var(--ui-bg-elevated)] text-sm text-[var(--ui-text-highlighted)] border-0 rounded-3xl px-4 py-3 font-medium resize-none outline-none leading-6 overflow-y-hidden transition-[height] duration-100 placeholder:text-[var(--ui-text-muted)] focus:ring-2 focus:ring-[var(--ui-border-active)]"
          :disabled="false"
          rows="1"
          autofocus
          @keydown="handleKeydown"
          @input="autoResize"
        />
      </div>

      <!-- Send / Stop button -->
      <button
        v-if="chat.isStreaming"
        class="size-12 rounded-full bg-[var(--ui-bg-elevated)] flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
        @click="chat.stopStreaming()"
      >
        <div class="w-3.5 h-3.5 bg-[var(--ui-text-highlighted)] rounded-sm" />
      </button>
      <button
        v-else
        :disabled="!input.trim()"
        class="size-12 rounded-full bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
        @click="submit"
      >
        <UIcon name="i-lucide-send-horizontal" class="size-5" />
      </button>
    </div>

    <!-- Model selector -->
    <div class="flex items-center gap-2 px-1">
      <USelectMenu
        v-model="selectedModelValue"
        :items="modelSelectItems"
        value-key="value"
        placeholder="Select model"
        size="xs"
        class="min-w-48"
        variant="ghost"
      />
    </div>
  </div>
</template>
