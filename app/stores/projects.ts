import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  displayName: string
  path: string
  createdAt: string
  updatedAt: string
  conversationCount?: number
}

export const useProjectsStore = defineStore('projects', () => {
  const list = ref<Project[]>([])
  const loading = ref(false)
  const activeProjectId = ref<string | null>(null)
  const expandedIds = ref<Set<string>>(new Set())

  const activeProject = computed(() =>
    list.value.find(p => p.id === activeProjectId.value) || null,
  )

  async function fetchAll() {
    loading.value = true
    try {
      list.value = await $fetch<Project[]>('/api/projects')
    } finally {
      loading.value = false
    }
  }

  async function create(path: string, displayName?: string) {
    const project = await $fetch<Project>('/api/projects', {
      method: 'POST',
      body: { path, displayName },
    })
    list.value.unshift(project)
    return project
  }

  async function rename(id: string, displayName: string) {
    const updated = await $fetch<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: { displayName },
    })
    const idx = list.value.findIndex(p => p.id === id)
    if (idx !== -1) list.value[idx] = updated
  }

  async function remove(id: string) {
    await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
    list.value = list.value.filter(p => p.id !== id)
    if (activeProjectId.value === id) {
      activeProjectId.value = null
    }
  }

  function setActive(id: string | null) {
    activeProjectId.value = id
  }

  function toggleExpanded(id: string) {
    const newSet = new Set(expandedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
      // Auto-select project when expanding
      activeProjectId.value = id
    }
    expandedIds.value = newSet
  }

  function expand(id: string) {
    if (!expandedIds.value.has(id)) {
      const newSet = new Set(expandedIds.value)
      newSet.add(id)
      expandedIds.value = newSet
    }
  }

  function isExpanded(id: string) {
    return expandedIds.value.has(id)
  }

  return {
    list,
    loading,
    activeProjectId,
    activeProject,
    expandedIds,
    fetchAll,
    create,
    rename,
    remove,
    setActive,
    toggleExpanded,
    expand,
    isExpanded,
  }
})
