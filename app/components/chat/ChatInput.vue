<script setup lang="ts">
const chat = useChatStore()
const settings = useSettingsStore()
const input = ref('')

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
}
</script>

<template>
  <UChatPrompt
    v-model="input"
    :loading="chat.isStreaming"
    placeholder="Ask anything..."
    autofocus
    @submit="submit"
    @keydown.ctrl.enter="submit"
    @keydown.meta.enter="submit"
  >
    <UChatPromptSubmit
      :status="chat.isStreaming ? 'streaming' : 'ready'"
      @stop="chat.stopStreaming()"
    />

    <template #footer>
      <div class="flex items-center gap-2 w-full">
        <USelectMenu
          v-model="selectedModelValue"
          :items="modelSelectItems"
          value-key="value"
          placeholder="Select model"
          size="xs"
          class="min-w-48"
        />
      </div>
    </template>
  </UChatPrompt>
</template>
