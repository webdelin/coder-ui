import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

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

function settingsPath(projectPath: string): string {
  return join(projectPath, '.claude', 'settings.json')
}

export async function getProjectSettings(projectPath: string): Promise<ProjectSettings> {
  try {
    const raw = await readFile(settingsPath(projectPath), 'utf-8')
    const parsed = JSON.parse(raw)
    // Merge with defaults to fill any missing fields
    return {
      ...defaultProjectSettings,
      ...parsed,
      permissions: {
        ...defaultProjectSettings.permissions,
        ...(parsed.permissions || {}),
      },
    }
  } catch {
    return { ...defaultProjectSettings }
  }
}

export async function saveProjectSettings(projectPath: string, settings: ProjectSettings): Promise<void> {
  const dir = join(projectPath, '.claude')
  await mkdir(dir, { recursive: true })
  await writeFile(settingsPath(projectPath), JSON.stringify(settings, null, 2), 'utf-8')
}
