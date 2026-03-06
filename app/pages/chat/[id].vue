<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const chat = useChatStore()
const projectsStore = useProjectsStore()
const settings = useSettingsStore()
const showProjectMenu = ref(false)
const chatInputRef = ref<InstanceType<any> | null>(null)
const isDragging = ref(false)
let dragCounter = 0

function onPageDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}
function onPageDragOver(e: DragEvent) {
  e.preventDefault()
}
function onPageDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}
function onPageDrop(e: DragEvent) {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  if (e.dataTransfer?.files.length) {
    chatInputRef.value?.handleDroppedFiles(e.dataTransfer.files)
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      await chat.loadConversation(String(id))
      // Scroll to bottom when loading a conversation
      nextTick(() => scrollToBottom())
    }
  },
  { immediate: true },
)

// Global paste handler — catches Ctrl+V screenshot even when textarea isn't focused
function onGlobalPaste(e: ClipboardEvent) {
  // Skip if the paste target is already the textarea (ChatInput handles it)
  if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return

  const imageFiles: File[] = []

  const items = e.clipboardData?.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
  }

  if (!imageFiles.length && e.clipboardData?.files?.length) {
    for (let i = 0; i < e.clipboardData.files.length; i++) {
      const file = e.clipboardData.files[i]
      if (file.type.startsWith('image/')) {
        imageFiles.push(file)
      }
    }
  }

  if (imageFiles.length) {
    e.preventDefault()
    chatInputRef.value?.handleDroppedFiles(imageFiles)
  }
}

onMounted(() => {
  document.addEventListener('paste', onGlobalPaste)
})

onUnmounted(() => {
  chat.clearConversation()
  document.removeEventListener('paste', onGlobalPaste)
})

// --- Auto-scroll logic ---
const scrollContainer = ref<HTMLElement | null>(null)
const userScrolledUp = ref(false)

function isNearBottom(threshold = 80): boolean {
  const el = scrollContainer.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function scrollToBottom() {
  const el = scrollContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function onScroll() {
  if (!chat.isStreaming) return
  // User scrolled away from bottom during streaming → pause auto-scroll
  userScrolledUp.value = !isNearBottom()
}

// Auto-scroll during streaming when content changes
watch(
  () => [chat.streamingContent, chat.toolCalls.length],
  () => {
    if (chat.isStreaming && !userScrolledUp.value) {
      nextTick(() => scrollToBottom())
    }
  },
)

// When new messages are added (user sends or streaming finishes)
watch(
  () => chat.messages.length,
  () => {
    // Reset scroll lock and scroll down on new messages
    userScrolledUp.value = false
    nextTick(() => scrollToBottom())
  },
)

// Reset scroll lock when streaming starts (user just sent a message)
watch(
  () => chat.isStreaming,
  (streaming) => {
    if (streaming) {
      userScrolledUp.value = false
      nextTick(() => scrollToBottom())
    }
  },
)
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div
        class="flex flex-col h-full relative"
        @dragenter="onPageDragEnter"
        @dragover="onPageDragOver"
        @dragleave="onPageDragLeave"
        @drop="onPageDrop"
      >
        <!-- Full-page drag overlay -->
        <div
          v-if="isDragging"
          class="absolute inset-0 z-50 flex items-center justify-center bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm pointer-events-none"
        >
          <div class="text-center">
            <UIcon name="i-lucide-image-plus" class="size-12 text-[var(--ui-text-muted)] mx-auto mb-2" />
            <p class="text-sm font-medium text-[var(--ui-text-muted)]">{{ t('chat.dropFiles') }}</p>
          </div>
        </div>
        <!-- Project context banner -->
        <div
          v-if="projectsStore.activeProject"
          class="px-4 py-2 text-xs text-[var(--ui-text-dimmed)] border-b border-[var(--ui-border-muted)] flex items-center gap-2 bg-[var(--ui-bg)]"
        >
          <UIcon name="i-lucide-folder" class="size-3.5 opacity-60" />
          <span class="font-medium text-[var(--ui-text-muted)]">{{ projectsStore.activeProject.displayName }}</span>
          <span class="font-mono truncate flex-1">{{ projectsStore.activeProject.path }}</span>

          <!-- Project settings dropdown -->
          <UPopover v-model:open="showProjectMenu">
            <button
              class="p-1 rounded-md text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-bg-elevated)] transition-colors"
            >
              <UIcon name="i-lucide-settings" class="size-3.5" />
            </button>
            <template #content>
              <div class="py-1 w-52">
                <NuxtLink
                  :to="`/project-settings/${projectsStore.activeProject.id}`"
                  class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--ui-bg-elevated)] transition-colors cursor-pointer"
                  @click="showProjectMenu = false"
                >
                  <UIcon name="i-lucide-sliders-horizontal" class="size-4" />
                  {{ t('projectSettings.title') }}
                </NuxtLink>
                <div class="flex items-center justify-between px-3 py-2 text-sm">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-volume-x" class="size-4" />
                    {{ t('projectSettings.autoRead') }}
                  </div>
                  <USwitch v-model="settings.ttsAutoRead" size="xs" />
                </div>
              </div>
            </template>
          </UPopover>
        </div>

        <!-- Messages area (scrollable) -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto scrollbar-thin" @scroll="onScroll">
          <div class="px-4 py-6">
            <ChatMessages />
          </div>
        </div>

        <!-- Input area (sticky bottom) -->
        <div class="chat-input-area border-t border-[var(--ui-border-muted)]">
          <div class="px-4 py-3">
            <ChatInput ref="chatInputRef" />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
