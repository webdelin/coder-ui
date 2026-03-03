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
      return props.input.command as string || 'Running command...'
    case 'Edit':
      return `Edit ${(props.input.file_path as string) || 'file'}`
    case 'Read':
      return `Read ${(props.input.file_path as string) || 'file'}`
    case 'Write':
      return `Write ${(props.input.file_path as string) || 'file'}`
    case 'Glob':
      return `Search: ${props.input.pattern || ''}`
    case 'Grep':
      return `Grep: ${props.input.pattern || ''}`
    case 'WebFetch':
      return `Fetch: ${props.input.url || ''}`
    case 'WebSearch':
      return `Search: ${props.input.query || ''}`
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
  <div class="border border-default rounded-lg overflow-hidden my-2">
    <button
      class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-elevated transition-colors text-left"
      @click="expanded = !expanded"
    >
      <UIcon :name="toolIcon" class="size-4 shrink-0" />
      <span class="font-mono text-xs font-medium text-primary">{{ name }}</span>
      <span class="truncate text-muted">{{ summary }}</span>
      <UIcon
        v-if="status === 'running'"
        name="i-lucide-loader"
        class="size-4 shrink-0 ml-auto animate-spin text-primary"
      />
      <UIcon
        v-else
        name="i-lucide-check"
        class="size-4 shrink-0 ml-auto text-success"
      />
      <UIcon
        :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-4 shrink-0"
      />
    </button>

    <div v-if="expanded" class="border-t border-default">
      <!-- Input -->
      <div v-if="name === 'Bash' && input.command" class="px-3 py-2 bg-elevated">
        <pre class="text-xs font-mono whitespace-pre-wrap break-all">$ {{ input.command }}</pre>
      </div>
      <div v-else-if="name === 'Edit'" class="px-3 py-2 bg-elevated text-xs space-y-1">
        <div class="font-mono text-muted">{{ input.file_path }}</div>
        <div v-if="input.old_string" class="text-error line-through">{{ input.old_string }}</div>
        <div v-if="input.new_string" class="text-success">{{ input.new_string }}</div>
      </div>
      <div v-else class="px-3 py-2 bg-elevated">
        <pre class="text-xs font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(input, null, 2) }}</pre>
      </div>

      <!-- Result -->
      <div v-if="result" class="px-3 py-2 border-t border-default">
        <pre class="text-xs font-mono whitespace-pre-wrap break-all text-muted max-h-60 overflow-auto">{{ truncatedResult }}</pre>
      </div>
    </div>
  </div>
</template>
