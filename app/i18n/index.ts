import en from './en'
import ru from './ru'
import de from './de'

export const messages = { en, ru, de } as const

export type Locale = keyof typeof messages
export type MessageKey = keyof typeof en
