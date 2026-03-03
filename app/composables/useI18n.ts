import { messages, type Locale, type MessageKey } from '~/i18n'

export function useI18n() {
  const settings = useSettingsStore()

  function t(key: MessageKey, params?: Record<string, string | number>): string {
    const locale = settings.locale as Locale
    const msg = messages[locale]?.[key] ?? messages.en[key] ?? key
    if (!params) return msg
    return msg.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }

  return { t }
}
