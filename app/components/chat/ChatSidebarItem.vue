<script setup lang="ts">
import type { Conversation } from '~/stores/conversations'

const props = defineProps<{
  conversation: Conversation
}>()

const conversationsStore = useConversationsStore()
const route = useRoute()
const router = useRouter()

const editingId = ref<string | null>(null)
const editingTitle = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const isActive = computed(() => route.params.id === props.conversation.id)

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function startRename() {
  editingId.value = props.conversation.id
  editingTitle.value = props.conversation.title
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

async function finishRename() {
  if (!editingId.value) return
  const title = editingTitle.value.trim()
  if (title) {
    await conversationsStore.rename(editingId.value, title)
  }
  editingId.value = null
}

function cancelRename() {
  editingId.value = null
}

async function deleteConversation() {
  await conversationsStore.remove(props.conversation.id)
  if (isActive.value) {
    router.push('/')
  }
}
</script>

<template>
  <div class="group flex items-center">
    <!-- Editing mode -->
    <div v-if="editingId === conversation.id" class="flex-1 flex items-center gap-1 px-2 py-1">
      <input
        ref="editInputRef"
        v-model="editingTitle"
        class="flex-1 text-sm bg-[var(--ui-bg-elevated)] border border-[var(--ui-border-active)] rounded px-2 py-0.5 outline-none"
        @keydown.enter="finishRename"
        @keydown.escape="cancelRename"
        @blur="finishRename"
      >
    </div>

    <!-- Normal mode -->
    <NuxtLink
      v-else
      :to="`/chat/${conversation.id}`"
      class="flex-1 min-w-0 px-2 py-1.5 rounded-md transition-colors"
      :class="isActive
        ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]'
        : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-elevated)] hover:text-[var(--ui-text-highlighted)]'"
      @dblclick.prevent="startRename"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-message-square" class="size-3.5 shrink-0" />
        <span class="truncate text-sm flex-1">{{ conversation.title }}</span>
        <span
          v-if="conversation.messageCount"
          class="text-[10px] text-[var(--ui-text-muted)] shrink-0 tabular-nums"
        >
          {{ conversation.messageCount }}
        </span>
      </div>
    </NuxtLink>

    <!-- Actions -->
    <div v-if="editingId !== conversation.id" class="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="p-1 rounded text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)]"
        title="Rename"
        @click.prevent="startRename"
      >
        <UIcon name="i-lucide-pencil" class="size-3" />
      </button>
      <button
        class="p-0.5 rounded text-[var(--ui-text-muted)] hover:text-[var(--ui-color-error)] text-sm leading-none"
        title="Delete"
        @click.prevent="deleteConversation"
      >
        &times;
      </button>
    </div>
  </div>
</template>
