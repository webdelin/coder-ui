<script setup lang="ts">
import type { PendingImage } from '~/stores/chat'

const { t } = useI18n()
const chat = useChatStore()
const settings = useSettingsStore()
const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingImages = ref<PendingImage[]>([])
const isDragging = ref(false)
const micButtonRef = ref<InstanceType<typeof import('./MicButton.vue').default> | null>(null)

const modelSelectItems = computed(() =>
  settings.availableModels.map(m => ({
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

const micStatus = computed(() => micButtonRef.value?.status ?? 'idle')
const micIsRecording = computed(() => micButtonRef.value?.isRecording ?? false)

function submit() {
  if (!input.value.trim() && !pendingImages.value.length) return
  if (chat.isStreaming) return
  chat.sendMessage(
    input.value.trim(),
    pendingImages.value.length ? [...pendingImages.value] : undefined,
  )
  input.value = ''
  pendingImages.value = []
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

// File handling
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

function processFiles(files: FileList | File[]) {
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) continue
    if (file.size > MAX_SIZE) continue

    const reader = new FileReader()
    reader.onload = () => {
      pendingImages.value.push({
        id: crypto.randomUUID(),
        dataUrl: reader.result as string,
        mediaType: file.type,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    processFiles(input.files)
    input.value = ''
  }
}

function removeImage(id: string) {
  pendingImages.value = pendingImages.value.filter(i => i.id !== id)
}

// Paste handler
function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  const imageFiles: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) imageFiles.push(file)
    }
  }
  if (imageFiles.length) {
    e.preventDefault()
    processFiles(imageFiles)
  }
}

// Speech-to-text
const interimText = ref('')

function onTranscript(text: string) {
  interimText.value = ''
  input.value += (input.value ? ' ' : '') + text
}

function onInterim(text: string) {
  interimText.value = text
}

// Drag and drop (counter approach to handle child element enter/leave)
let dragCounter = 0

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
}
function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  if (e.dataTransfer?.files.length) {
    processFiles(e.dataTransfer.files)
  }
}
</script>

<template>
  <div
    class="space-y-2 relative"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Drag overlay -->
    <div
      v-if="isDragging"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--ui-border-active)] bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm pointer-events-none"
    >
      <div class="text-center">
        <UIcon name="i-lucide-plus" class="size-8 text-[var(--ui-text-muted)] mx-auto mb-1" />
        <p class="text-sm text-[var(--ui-text-muted)]">{{ t('chat.dropFiles') }}</p>
      </div>
    </div>

    <!-- Image previews -->
    <ChatImagePreview
      :images="pendingImages"
      @remove="removeImage"
    />

    <!-- Transcription typing indicator -->
    <div
      v-if="micStatus === 'transcribing'"
      class="flex items-center gap-2 px-4 py-2"
    >
      <div class="flex items-center gap-1">
        <span class="stt-typing-dot w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)]" />
        <span class="stt-typing-dot w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)]" style="animation-delay: 0.2s" />
        <span class="stt-typing-dot w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)]" style="animation-delay: 0.4s" />
      </div>
      <span class="text-xs text-[var(--ui-text-muted)]">{{ t('chat.transcribing') }}</span>
    </div>

    <div class="flex items-end gap-2">
      <!-- File attach button (plus icon) -->
      <button
        class="size-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-elevated)]"
        :title="t('chat.attachFiles')"
        @click="openFilePicker"
      >
        <UIcon name="i-lucide-plus" class="size-5" />
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        class="hidden"
        @change="onFileSelected"
      >

      <!-- Input area with mic inside -->
      <div class="flex-1 relative flex items-end">
        <textarea
          ref="textareaRef"
          v-model="input"
          :placeholder="t('chat.placeholder')"
          class="w-full min-h-11 bg-[var(--ui-bg-elevated)] text-sm text-[var(--ui-text-highlighted)] border-0 rounded-2xl pl-4 pr-10 py-2.5 font-medium resize-none outline-none leading-6 overflow-y-hidden transition-[height] duration-100 placeholder:text-[var(--ui-text-muted)] focus:ring-1 focus:ring-[var(--ui-border-active)]"
          :disabled="false"
          rows="1"
          autofocus
          @keydown="handleKeydown"
          @input="autoResize"
          @paste="handlePaste"
        />
        <!-- Mic button inside input -->
        <div class="absolute right-2.5 bottom-2.5">
          <ChatMicButton
            ref="micButtonRef"
            @transcript="onTranscript"
            @interim="onInterim"
          />
        </div>
      </div>

      <!-- Send / Stop button -->
      <button
        v-if="chat.isStreaming"
        class="size-10 rounded-full bg-[var(--ui-bg-elevated)] flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
        @click="chat.stopStreaming()"
      >
        <div class="w-3 h-3 bg-[var(--ui-text-highlighted)] rounded-sm" />
      </button>
      <button
        v-else
        :disabled="!input.trim() && !pendingImages.length"
        class="size-10 rounded-full bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
        @click="submit"
      >
        <UIcon name="i-lucide-arrow-up" class="size-5" />
      </button>
    </div>

    <!-- Interim speech text -->
    <div v-if="interimText" class="px-4 text-xs text-[var(--ui-text-muted)] italic truncate">
      {{ interimText }}...
    </div>

    <!-- Model selector -->
    <div class="flex items-center gap-2 px-1">
      <USelectMenu
        v-model="selectedModelValue"
        :items="modelSelectItems"
        value-key="value"
        :placeholder="t('chat.selectModel')"
        size="xs"
        class="min-w-48"
        variant="ghost"
      />
    </div>
  </div>
</template>
