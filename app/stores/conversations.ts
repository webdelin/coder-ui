import { defineStore } from 'pinia'

export interface Conversation {
  id: string
  title: string
  projectId: string | null
  provider: string
  model: string
  systemPrompt: string | null
  createdAt: string
  updatedAt: string
  messageCount?: number
}

export const useConversationsStore = defineStore('conversations', () => {
  const list = ref<Conversation[]>([])
  const loading = ref(false)

  const byProject = computed(() => {
    const map = new Map<string | null, Conversation[]>()
    for (const conv of list.value) {
      const key = conv.projectId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(conv)
    }
    return map
  })

  function forProject(projectId: string): Conversation[] {
    return byProject.value.get(projectId) ?? []
  }

  function unassigned(): Conversation[] {
    return byProject.value.get(null) ?? []
  }

  async function fetchAll() {
    loading.value = true
    try {
      list.value = await $fetch<Conversation[]>('/api/conversations')
    } finally {
      loading.value = false
    }
  }

  async function create(provider: string, model: string, projectId?: string) {
    const conv = await $fetch<Conversation>('/api/conversations', {
      method: 'POST',
      body: { provider, model, projectId },
    })
    list.value.unshift(conv)
    return conv
  }

  async function rename(id: string, title: string) {
    const updated = await $fetch<Conversation>(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: { title },
    })
    const idx = list.value.findIndex(c => c.id === id)
    if (idx !== -1) list.value[idx] = updated
  }

  async function remove(id: string) {
    await $fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    list.value = list.value.filter(c => c.id !== id)
  }

  async function clearAll() {
    await $fetch('/api/conversations', { method: 'DELETE' })
    list.value = []
  }

  return {
    list, loading, byProject,
    forProject, unassigned,
    fetchAll, create, rename, remove, clearAll,
  }
})
