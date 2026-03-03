<script setup lang="ts">
const props = defineProps<{
  name: string
  input: Record<string, unknown>
  result?: string
  status: 'running' | 'done'
}>()

const expanded = ref(false)

const toolIcon = computed(() => {
  const icons: Record<string, string> = {
    Bash: 'i-lucide-terminal',
    Edit: 'i-lucide-pencil',
    Read: 'i-lucide-file-text',
    Write: 'i-lucide-file-plus',
    Glob: 'i-lucide-search',
    Grep: 'i-lucide-text-search',
    WebFetch: 'i-lucide-globe',
    WebSearch: 'i-lucide-search',
    TodoWrite: 'i-lucide-list-checks',
    NotebookEdit: 'i-lucide-notebook-pen',
    Task: 'i-lucide-git-branch',
  }
  return icons[props.name] || 'i-lucide-wrench'
})

const summary = computed(() => {
  switch (props.name) {
    case 'Bash':
      return (props.input.command as string) || 'Running command...'
    case 'Edit':
      return (props.input.file_path as string) || 'file'
    case 'Read':
      return (props.input.file_path as string) || 'file'
    case 'Write':
      return (props.input.file_path as string) || 'file'
    case 'Glob':
      return (props.input.pattern as string) || ''
    case 'Grep':
      return (props.input.pattern as string) || ''
    case 'WebFetch':
      return (props.input.url as string) || ''
    case 'WebSearch':
      return (props.input.query as string) || ''
    case 'TodoWrite':
      return 'Update todo list'
    default:
      return props.name
  }
})

const truncatedResult = computed(() => {
  if (!props.result) return ''
  return props.result.length > 500
    ? props.result.slice(0, 500) + '...'
    : props.result
})
</script>

<template>
  <div class="tool-call-card bg-[var(--ui-bg-elevated)] mb-3">
    <!-- Header -->
    <button
      class="tool-call-header w-full"
      @click="expanded = !expanded"
    >
      <!-- Status dot -->
      <div
        class="status-dot"
        :class="status === 'running' ? 'status-dot-running' : 'status-dot-done'"
      />

      <!-- Tool name badge -->
      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-[var(--ui-bg)] text-[var(--ui-text-highlighted)] shrink-0">
        {{ name }}
      </span>

      <!-- Description -->
      <span class="text-xs text-[var(--ui-text-muted)] flex-1 min-w-0 truncate text-left">
        {{ summary }}
      </span>

      <!-- Chevron -->
      <UIcon
        :name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        class="size-3.5 shrink-0 text-[var(--ui-text-muted)] transition-transform duration-200"
      />
    </button>

    <!-- Expandable content -->
    <div v-if="expanded" class="tool-call-content space-y-3 border-t border-[var(--ui-border)]">
      <!-- Input section -->
      <div>
        <h4 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wide mb-1.5">
          {{ name === 'Bash' ? 'Command' : 'Input' }}
        </h4>
        <div class="bg-[var(--ui-bg)] rounded border border-[var(--ui-border)] p-3">
          <!-- Bash -->
          <pre v-if="name === 'Bash' && input.command" class="text-xs text-[var(--ui-text-highlighted)]">$ {{ input.command }}</pre>
          <!-- Edit -->
          <div v-else-if="name === 'Edit'" class="space-y-2">
            <div class="text-xs font-mono text-[var(--ui-text-muted)]">{{ input.file_path }}</div>
            <div v-if="input.old_string" class="text-xs font-mono text-red-500 line-through whitespace-pre-wrap">{{ input.old_string }}</div>
            <div v-if="input.new_string" class="text-xs font-mono text-green-500 whitespace-pre-wrap">{{ input.new_string }}</div>
          </div>
          <!-- Default -->
          <pre v-else class="text-xs text-[var(--ui-text-highlighted)]">{{ JSON.stringify(input, null, 2) }}</pre>
        </div>
      </div>

      <!-- Result section -->
      <div v-if="result">
        <h4 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wide mb-1.5">Result</h4>
        <div class="bg-[var(--ui-bg)] rounded border border-[var(--ui-border)] p-3 max-h-48 overflow-y-auto scrollbar-thin">
          <pre class="text-xs text-[var(--ui-text-highlighted)]">{{ truncatedResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
