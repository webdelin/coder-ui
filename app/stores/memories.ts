import { defineStore } from 'pinia'

export interface Memory {
  id: string
  projectId: string | null
  conversationId: string | null
  content: string
  type: string
  sourceMessageId: string | null
  createdAt: string
  updatedAt: string
}

export const useMemoriesStore = defineStore('memories', () => {
  const list = ref<Memory[]>([])
  const loading = ref(false)

  async function fetchForProject(projectId: string) {
    loading.value = true
    try {
      list.value = await $fetch<Memory[]>('/api/memories', {
        query: { projectId },
      })
    } finally {
      loading.value = false
    }
  }

  async function fetchForConversation(conversationId: string) {
    loading.value = true
    try {
      list.value = await $fetch<Memory[]>('/api/memories', {
        query: { conversationId },
      })
    } finally {
      loading.value = false
    }
  }

  async function create(content: string, projectId?: string, conversationId?: string) {
    const result = await $fetch<{ id: string }>('/api/memories', {
      method: 'POST',
      body: { content, projectId, conversationId, type: 'manual' },
    })
    if (projectId) await fetchForProject(projectId)
    else if (conversationId) await fetchForConversation(conversationId)
    return result
  }

  async function remove(id: string) {
    await $fetch(`/api/memories/${id}`, { method: 'DELETE' })
    list.value = list.value.filter(m => m.id !== id)
  }

  function clear() {
    list.value = []
  }

  return { list, loading, fetchForProject, fetchForConversation, create, remove, clear }
})
