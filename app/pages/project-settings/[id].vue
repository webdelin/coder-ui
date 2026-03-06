<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const projectsStore = useProjectsStore()
const projectSettingsStore = useProjectSettingsStore()

const saving = ref(false)
const activeTab = ref('permissions')

const projectId = computed(() => String(route.params.id))
const project = computed(() =>
  projectsStore.list.find(p => p.id === projectId.value),
)

// Load settings when page mounts
onMounted(async () => {
  if (projectId.value) {
    await projectSettingsStore.load(projectId.value)
  }
})

const tabs = computed(() => [
  { label: t('projectSettings.permissions'), value: 'permissions' },
  { label: t('projectSettings.environment'), value: 'environment' },
  { label: t('projectSettings.git'), value: 'git' },
  { label: t('projectSettings.cleanup'), value: 'cleanup' },
])

const permissionModeOptions = [
  { label: 'Default - Standard permission prompting', value: 'default' },
  { label: 'Accept Edits - Automatically accepts file edit permissions', value: 'acceptEdits' },
  { label: 'Plan - Planning mode only, no file modifications', value: 'plan' },
  { label: 'Bypass Permissions - Skip all permission checks', value: 'bypassPermissions' },
]

// Dynamic list helpers
function addAllow() {
  projectSettingsStore.settings.permissions.allow.push('')
}
function removeAllow(index: number) {
  projectSettingsStore.settings.permissions.allow.splice(index, 1)
}
function addDeny() {
  projectSettingsStore.settings.permissions.deny.push('')
}
function removeDeny(index: number) {
  projectSettingsStore.settings.permissions.deny.splice(index, 1)
}
function addDirectory() {
  projectSettingsStore.settings.permissions.additionalDirectories.push('')
}
function removeDirectory(index: number) {
  projectSettingsStore.settings.permissions.additionalDirectories.splice(index, 1)
}

// Environment key-value helpers
const envEntries = computed({
  get() {
    return Object.entries(projectSettingsStore.settings.env).map(([key, value]) => ({ key, value }))
  },
  set(entries: Array<{ key: string; value: string }>) {
    const env: Record<string, string> = {}
    for (const e of entries) {
      if (e.key.trim()) env[e.key.trim()] = e.value
    }
    projectSettingsStore.settings.env = env
  },
})

const envList = ref<Array<{ key: string; value: string }>>(
  Object.entries(projectSettingsStore.settings.env).map(([key, value]) => ({ key, value })),
)

watch(() => projectSettingsStore.settings.env, (env) => {
  envList.value = Object.entries(env).map(([key, value]) => ({ key, value }))
}, { immediate: true })

function addEnvVar() {
  envList.value.push({ key: '', value: '' })
}
function removeEnvVar(index: number) {
  envList.value.splice(index, 1)
  syncEnv()
}
function syncEnv() {
  const env: Record<string, string> = {}
  for (const e of envList.value) {
    if (e.key.trim()) env[e.key.trim()] = e.value
  }
  projectSettingsStore.settings.env = env
}

async function save() {
  saving.value = true
  syncEnv()
  try {
    // Filter out empty entries before saving
    const perms = projectSettingsStore.settings.permissions
    perms.allow = perms.allow.filter(v => v.trim())
    perms.deny = perms.deny.filter(v => v.trim())
    perms.additionalDirectories = perms.additionalDirectories.filter(v => v.trim())

    await projectSettingsStore.save(projectId.value)
    toast.add({ title: t('projectSettings.saved'), color: 'success' })
  } catch (e: any) {
    toast.add({ title: t('projectSettings.saveFailed'), description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

function resetToDefaults() {
  projectSettingsStore.reset()
  envList.value = []
  toast.add({ title: t('projectSettings.resetDone'), color: 'info' })
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <!-- Header -->
        <div>
          <div class="flex items-center gap-2 text-xs text-[var(--ui-text-dimmed)] mb-2">
            <NuxtLink
              v-if="project"
              :to="`/chat/${projectsStore.list.find(p => p.id === projectId)?.id || ''}`"
              class="hover:text-[var(--ui-text-muted)] transition-colors"
            >
              {{ project?.displayName }}
            </NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="size-3" />
            <span>{{ t('projectSettings.title') }}</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight">
            {{ t('projectSettings.settingsFor') }} {{ project?.displayName || projectId }}
          </h2>
          <p class="text-sm text-[var(--ui-text-muted)] mt-1">{{ project?.path }}</p>
        </div>

        <!-- Tabs -->
        <div class="border-b border-[var(--ui-border)]">
          <div class="flex">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === tab.value
                ? 'border-[var(--ui-bg-inverted)] text-[var(--ui-text)]'
                : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Permissions Tab -->
        <div v-if="activeTab === 'permissions'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold">{{ t('projectSettings.permissionsFramework') }}</h3>
            <p class="text-sm text-[var(--ui-text-muted)]">{{ t('projectSettings.permissionsDesc') }}</p>
          </div>

          <!-- Default Permission Mode -->
          <UFormField :label="t('projectSettings.defaultMode')">
            <USelectMenu
              v-model="projectSettingsStore.settings.permissions.defaultMode"
              :items="permissionModeOptions"
              value-key="value"
              size="sm"
              class="w-full"
            />
          </UFormField>

          <!-- Allow List -->
          <div class="space-y-2">
            <div>
              <h4 class="text-sm font-medium">{{ t('projectSettings.allowList') }}</h4>
              <p class="text-xs text-[var(--ui-text-muted)]">{{ t('projectSettings.allowListDesc') }}</p>
            </div>
            <div
              v-for="(_, index) in projectSettingsStore.settings.permissions.allow"
              :key="`allow-${index}`"
              class="flex gap-2"
            >
              <UInput
                v-model="projectSettingsStore.settings.permissions.allow[index]"
                :placeholder="t('projectSettings.allowPlaceholder')"
                class="flex-1"
                size="sm"
              />
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                @click="removeAllow(index)"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <button
              class="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-dashed border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)] hover:border-[var(--ui-border-hover)] hover:text-[var(--ui-text)] transition-colors"
              @click="addAllow"
            >
              <UIcon name="i-lucide-plus" class="size-3.5" />
              {{ t('projectSettings.addAllowRule') }}
            </button>
          </div>

          <!-- Deny List -->
          <div class="space-y-2">
            <div>
              <h4 class="text-sm font-medium">{{ t('projectSettings.denyList') }}</h4>
              <p class="text-xs text-[var(--ui-text-muted)]">{{ t('projectSettings.denyListDesc') }}</p>
            </div>
            <div
              v-for="(_, index) in projectSettingsStore.settings.permissions.deny"
              :key="`deny-${index}`"
              class="flex gap-2"
            >
              <UInput
                v-model="projectSettingsStore.settings.permissions.deny[index]"
                :placeholder="t('projectSettings.denyPlaceholder')"
                class="flex-1"
                size="sm"
              />
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                @click="removeDeny(index)"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <button
              class="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-dashed border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)] hover:border-[var(--ui-border-hover)] hover:text-[var(--ui-text)] transition-colors"
              @click="addDeny"
            >
              <UIcon name="i-lucide-plus" class="size-3.5" />
              {{ t('projectSettings.addDenyRule') }}
            </button>
          </div>

          <!-- Additional Directories -->
          <div class="space-y-2">
            <div>
              <h4 class="text-sm font-medium">{{ t('projectSettings.additionalDirs') }}</h4>
              <p class="text-xs text-[var(--ui-text-muted)]">{{ t('projectSettings.additionalDirsDesc') }}</p>
            </div>
            <div
              v-for="(_, index) in projectSettingsStore.settings.permissions.additionalDirectories"
              :key="`dir-${index}`"
              class="flex gap-2"
            >
              <UInput
                v-model="projectSettingsStore.settings.permissions.additionalDirectories[index]"
                :placeholder="t('projectSettings.dirPlaceholder')"
                class="flex-1"
                size="sm"
              />
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                @click="removeDirectory(index)"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <button
              class="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-dashed border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)] hover:border-[var(--ui-border-hover)] hover:text-[var(--ui-text)] transition-colors"
              @click="addDirectory"
            >
              <UIcon name="i-lucide-plus" class="size-3.5" />
              {{ t('projectSettings.addDirectory') }}
            </button>
          </div>
        </div>

        <!-- Environment Tab -->
        <div v-if="activeTab === 'environment'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold">{{ t('projectSettings.envTitle') }}</h3>
            <p class="text-sm text-[var(--ui-text-muted)]">{{ t('projectSettings.envDesc') }}</p>
          </div>

          <div class="space-y-2">
            <div
              v-for="(entry, index) in envList"
              :key="`env-${index}`"
              class="flex gap-2"
            >
              <UInput
                v-model="entry.key"
                placeholder="KEY"
                class="w-1/3"
                size="sm"
                @blur="syncEnv"
              />
              <UInput
                v-model="entry.value"
                placeholder="value"
                class="flex-1"
                size="sm"
                @blur="syncEnv"
              />
              <button
                class="p-1.5 rounded-md text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                @click="removeEnvVar(index)"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <button
              class="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-dashed border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)] hover:border-[var(--ui-border-hover)] hover:text-[var(--ui-text)] transition-colors"
              @click="addEnvVar"
            >
              <UIcon name="i-lucide-plus" class="size-3.5" />
              {{ t('projectSettings.addEnvVar') }}
            </button>
          </div>
        </div>

        <!-- Git Tab -->
        <div v-if="activeTab === 'git'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold">{{ t('projectSettings.gitTitle') }}</h3>
            <p class="text-sm text-[var(--ui-text-muted)]">{{ t('projectSettings.gitDesc') }}</p>
          </div>

          <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-medium">{{ t('projectSettings.coAuthoredBy') }}</span>
                <p class="text-xs text-[var(--ui-text-muted)]">{{ t('projectSettings.coAuthoredByDesc') }}</p>
              </div>
              <USwitch v-model="projectSettingsStore.settings.includeCoAuthoredBy" />
            </div>
          </div>
        </div>

        <!-- Cleanup Tab -->
        <div v-if="activeTab === 'cleanup'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold">{{ t('projectSettings.cleanupTitle') }}</h3>
            <p class="text-sm text-[var(--ui-text-muted)]">{{ t('projectSettings.cleanupDesc') }}</p>
          </div>

          <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4 space-y-4">
            <UFormField :label="t('projectSettings.cleanupPeriod')">
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="projectSettingsStore.settings.cleanupPeriodDays"
                  type="number"
                  :min="1"
                  class="w-24"
                  size="sm"
                />
                <span class="text-sm text-[var(--ui-text-muted)]">{{ t('projectSettings.days') }}</span>
              </div>
            </UFormField>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3 pt-4">
          <button
            class="px-4 py-2 rounded-md bg-[var(--ui-bg-elevated)] text-sm font-medium hover:bg-[var(--ui-bg-accented)] transition-colors"
            @click="resetToDefaults"
          >
            {{ t('projectSettings.resetDefaults') }}
          </button>
          <button
            :disabled="saving"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[var(--ui-bg-inverted)] text-[var(--ui-bg)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            @click="save"
          >
            <UIcon v-if="!saving" name="i-lucide-save" class="size-4" />
            <UIcon v-else name="i-lucide-loader" class="size-4 animate-spin" />
            {{ t('projectSettings.saveSettings') }}
          </button>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
