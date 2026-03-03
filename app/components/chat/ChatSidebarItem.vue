<script setup lang="ts">
import type { Conversation } from '~/stores/conversations'

const { t } = useI18n()

const props = defineProps<{
  conversation: Conversation
}>()

const conversationsStore = useConversationsStore()
const settings = useSettingsStore()
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

  if (diffSec < 60) return t('time.justNow')
  if (diffMin < 60) return t('time.minutesAgo', { n: diffMin })
  if (diffHour < 24) return t('time.hoursAgo', { n: diffHour })
  if (diffDay < 7) return t('time.daysAgo', { n: diffDay })
  return date.toLocaleDateString(settings.locale, { month: 'short', day: 'numeric' })
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
        class="flex-1 text-xs bg-[var(--ui-bg-elevated)] border border-[var(--ui-border-active)] rounded-md px-2 py-1 outline-none"
        @keydown.enter="finishRename"
        @keydown.escape="cancelRename"
        @blur="finishRename"
      >
    </div>

    <!-- Normal mode -->
    <NuxtLink
      v-else
      :to="`/chat/${conversation.id}`"
      class="flex-1 min-w-0 px-2 py-1 rounded-md transition-colors"
      :class="isActive
        ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]'
        : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-elevated)] hover:text-[var(--ui-text-highlighted)]'"
      @dblclick.prevent="startRename"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-message-square" class="size-3.5 shrink-0 opacity-60" />
        <span class="truncate text-xs flex-1">{{ conversation.title }}</span>
        <span
          v-if="conversation.messageCount"
          class="text-[10px] text-[var(--ui-text-dimmed)] shrink-0 tabular-nums"
        >
          {{ conversation.messageCount }}
        </span>
      </div>
    </NuxtLink>

    <!-- Actions -->
    <div v-if="editingId !== conversation.id" class="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="p-1 rounded-md text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-highlighted)] transition-colors"
        :title="t('sidebar.rename')"
        @click.prevent="startRename"
      >
        <UIcon name="i-lucide-pencil" class="size-3" />
      </button>
      <button
        class="p-1 rounded-md text-[var(--ui-text-dimmed)] hover:text-[var(--ui-color-error)] transition-colors"
        :title="t('sidebar.delete')"
        @click.prevent="deleteConversation"
      >
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </div>
  </div>
</template>
