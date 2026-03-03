<script setup lang="ts">
const { t } = useI18n()
const memoriesStore = useMemoriesStore()
const projectsStore = useProjectsStore()
const chat = useChatStore()

const newMemory = ref('')
const adding = ref(false)

const activeProjectId = computed(() => projectsStore.activeProjectId)
const activeConversationId = computed(() => chat.conversationId)

// Load memories when project or conversation changes
watch(
  [activeProjectId, activeConversationId],
  ([projectId, conversationId]) => {
    if (conversationId) {
      memoriesStore.fetchForConversation(conversationId)
    } else if (projectId) {
      memoriesStore.fetchForProject(projectId)
    } else {
      memoriesStore.clear()
    }
  },
  { immediate: true },
)

async function addMemory() {
  if (!newMemory.value.trim()) return
  adding.value = true
  try {
    await memoriesStore.create(
      newMemory.value.trim(),
      activeProjectId.value ?? undefined,
      activeConversationId.value ?? undefined,
    )
    newMemory.value = ''
  } finally {
    adding.value = false
  }
}

async function removeMemory(id: string) {
  await memoriesStore.remove(id)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-[10px] font-semibold text-[var(--ui-text-dimmed)] uppercase tracking-widest">
        {{ t('memory.title') }}
      </h3>
      <span v-if="memoriesStore.list.length" class="text-[10px] text-[var(--ui-text-dimmed)]">
        {{ t('memory.count', { n: memoriesStore.list.length }) }}
      </span>
    </div>

    <!-- Add memory -->
    <div class="flex gap-2">
      <input
        v-model="newMemory"
        type="text"
        :placeholder="t('memory.addPlaceholder')"
        class="flex-1 min-w-0 h-8 px-3 text-xs rounded-md bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] placeholder:text-[var(--ui-text-dimmed)] focus:outline-none focus:border-[var(--ui-border-active)]"
        @keydown.enter="addMemory"
      >
      <button
        :disabled="!newMemory.trim() || adding"
        class="h-8 px-3 text-xs font-medium rounded-md bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] disabled:opacity-40 hover:opacity-80 transition-opacity"
        @click="addMemory"
      >
        {{ t('memory.add') }}
      </button>
    </div>

    <!-- Memory list -->
    <div v-if="memoriesStore.loading" class="text-xs text-[var(--ui-text-dimmed)] py-4 text-center">
      Loading...
    </div>

    <div v-else-if="memoriesStore.list.length === 0" class="text-xs text-[var(--ui-text-dimmed)] py-4 text-center">
      {{ t('memory.empty') }}
    </div>

    <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
      <div
        v-for="memory in memoriesStore.list"
        :key="memory.id"
        class="group rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-3 space-y-1.5"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs text-[var(--ui-text-highlighted)] leading-relaxed whitespace-pre-wrap break-words min-w-0">
            {{ memory.content }}
          </p>
          <button
            class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ui-text-dimmed)] hover:text-[var(--ui-color-error)]"
            :title="t('memory.delete')"
            @click="removeMemory(memory.id)"
          >
            <UIcon name="i-lucide-trash-2" class="size-3.5" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-[10px] text-[var(--ui-text-dimmed)]">
          <span
            class="px-1.5 py-0.5 rounded-sm"
            :class="memory.type === 'auto'
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-green-500/10 text-green-400'"
          >
            {{ t(`memory.type.${memory.type}`) }}
          </span>
          <span>{{ formatDate(memory.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
