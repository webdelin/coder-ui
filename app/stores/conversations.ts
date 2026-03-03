import { defineStore } from 'pinia'

export interface Conversation {
  id: string
  title: string
  provider: string
  model: string
  systemPrompt: string | null
  createdAt: string
  updatedAt: string
}

export const useConversationsStore = defineStore('conversations', () => {
  const list = ref<Conversation[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      list.value = await $fetch<Conversation[]>('/api/conversations')
    } finally {
      loading.value = false
    }
  }

  async function create(provider: string, model: string) {
    const conv = await $fetch<Conversation>('/api/conversations', {
      method: 'POST',
      body: { provider, model },
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

  return { list, loading, fetchAll, create, rename, remove }
})
