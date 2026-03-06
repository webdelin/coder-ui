import { defineStore } from 'pinia'

export interface ProjectPermissions {
  defaultMode: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  allow: string[]
  deny: string[]
  additionalDirectories: string[]
}

export interface ProjectSettings {
  permissions: ProjectPermissions
  env: Record<string, string>
  includeCoAuthoredBy: boolean
  cleanupPeriodDays: number
}

export const defaultProjectSettings: ProjectSettings = {
  permissions: {
    defaultMode: 'acceptEdits',
    allow: [],
    deny: [],
    additionalDirectories: [],
  },
  env: {},
  includeCoAuthoredBy: true,
  cleanupPeriodDays: 30,
}

export const useProjectSettingsStore = defineStore('projectSettings', () => {
  const settings = ref<ProjectSettings>({ ...defaultProjectSettings })
  const loading = ref(false)
  const currentProjectId = ref<string | null>(null)

  async function load(projectId: string) {
    loading.value = true
    currentProjectId.value = projectId
    try {
      const data = await $fetch<ProjectSettings>('/api/project-settings', {
        query: { projectId },
      })
      settings.value = data
    } catch {
      settings.value = { ...defaultProjectSettings }
    } finally {
      loading.value = false
    }
  }

  async function save(projectId: string) {
    await $fetch('/api/project-settings', {
      method: 'POST',
      body: { projectId, settings: settings.value },
    })
  }

  function reset() {
    settings.value = {
      ...defaultProjectSettings,
      permissions: { ...defaultProjectSettings.permissions },
      env: {},
    }
  }

  return {
    settings,
    loading,
    currentProjectId,
    load,
    save,
    reset,
  }
})
