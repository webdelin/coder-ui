import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default('New Chat'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  systemPrompt: text('system_prompt'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  model: text('model'),
  provider: text('provider'),
  tokensUsed: integer('tokens_used'),
  durationMs: integer('duration_ms'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const providerSettings = sqliteTable('provider_settings', {
  provider: text('provider').primaryKey(),
  apiKey: text('api_key'),
  groupId: text('group_id'),
  baseUrl: text('base_url'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

export type Conversation = typeof conversations.$inferSelect
export type InsertConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type InsertMessage = typeof messages.$inferInsert
export type ProviderSetting = typeof providerSettings.$inferSelect
