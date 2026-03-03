# Coder UI

A local-first, multi-provider AI chat interface inspired by [claude-code-web](https://github.com/anthropics/claude-code). Built with Nuxt 4, SQLite, and SSE streaming.

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite)

## Features

- **Multi-Provider Support** — Claude Code CLI, Anthropic API, MiniMax (Coding Plan), Z.AI
- **Project-Based Organization** — Map filesystem directories to projects, group conversations per project
- **SSE Streaming** — Real-time token streaming with tool call display for Claude Code
- **Claude Code Integration** — Full tool use visualization (file reads, edits, bash commands) via `@anthropic-ai/claude-agent-sdk`
- **Image Upload** — Drag-drop, paste, or click to attach images (Anthropic vision)
- **Text-to-Speech** — MiniMax TTS API with Web Speech API fallback, adjustable speed, auto-read
- **Speech-to-Text** — Browser-native speech recognition via Web Speech API
- **Markdown Rendering** — MDC-powered with syntax highlighting and copy-to-clipboard on code blocks
- **Dynamic Model Fetching** — Models pulled from each provider's API, no hardcoded lists
- **Settings UI** — Provider configuration, TTS, appearance, danger zone
- **Dark / Light Mode** — Nuxt Color Mode with system preference detection

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 (SPA mode, `ssr: false`) |
| UI | Nuxt UI v4, TailwindCSS |
| State | Pinia |
| Database | SQLite via better-sqlite3 + Drizzle ORM (WAL mode) |
| Streaming | Server-Sent Events (Nitro `createEventStream`) |
| Claude Code | `@anthropic-ai/claude-agent-sdk` |
| Anthropic API | `@anthropic-ai/sdk` |
| MiniMax / Z.AI | `openai` SDK (OpenAI-compatible endpoints) |
| Markdown | `@nuxtjs/mdc` |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

The app starts at `http://localhost:3000` (or the `PORT` in `.env`).

## Configuration

API keys can be set in two ways:

1. **Environment variables** in `.env` (see `.env.example`)
2. **Settings UI** at `/settings` — keys stored in the local SQLite database

Provider settings in the UI take priority over environment variables.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_PATH` | SQLite database location (default: `./data/chat.db`) |
| `ANTHROPIC_API_KEY` | Anthropic API key (for direct API access) |
| `MINIMAX_API_KEY` | MiniMax API key (Coding Plan API) |
| `MINIMAX_GROUP_ID` | MiniMax Group ID (optional) |
| `ZAI_API_KEY` | Z.AI API key |
| `PORT` | Server port (default: `3000`) |
| `HOST` | Server host (default: `localhost`) |

### Claude Code CLI

The Claude Code provider requires `claude` CLI installed globally. It uses the Agent SDK to spawn sessions with tool use permissions. No API key needed — it uses the CLI's own authentication.

```bash
npm install -g @anthropic-ai/claude-code
```

## Project Structure

```
app/
  components/
    chat/          # ChatMessages, ChatInput, ChatSidebar, ToolCallDisplay, MicButton, ImagePreview
    projects/      # CreateProjectDialog, ProjectCard
    settings/      # ProviderSettings
  stores/          # Pinia stores: chat, conversations, projects, settings, tts
  pages/           # index (welcome), chat/[id], settings
  layouts/         # default (sidebar + content)
server/
  api/
    chat/          # stream.post (SSE), claude-code.post (Agent SDK SSE)
    conversations/ # CRUD endpoints
    projects/      # CRUD endpoints
    providers/     # Dynamic model listing
    settings/      # App settings persistence
    tts/           # MiniMax TTS synthesis
  db/              # Drizzle schema, migrations, SQLite init
  providers/       # ProviderAdapter implementations (anthropic, minimax, zai, claude-code)
  plugins/         # Database migration on startup
```

## Database Schema

Five tables — `projects`, `conversations`, `messages`, `provider_settings`, `app_settings`.

- **Projects** map to filesystem directories (`path` field used as `cwd` for Claude Code)
- **Conversations** belong to a project (`projectId` nullable, `onDelete: set null`)
- **Messages** cascade-delete with their conversation

Migrations run automatically on server startup.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects with conversation counts |
| `POST` | `/api/projects` | Create project (validates directory exists) |
| `PATCH` | `/api/projects/:id` | Rename project |
| `DELETE` | `/api/projects/:id` | Delete project (conversations become unassigned) |
| `GET` | `/api/conversations` | List conversations (optional `?projectId=` filter) |
| `POST` | `/api/conversations` | Create conversation |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `PATCH` | `/api/conversations/:id` | Update title / system prompt |
| `DELETE` | `/api/conversations/:id` | Delete conversation + messages |
| `DELETE` | `/api/conversations` | Delete all conversations |
| `POST` | `/api/chat/stream` | SSE streaming (Anthropic, MiniMax, Z.AI) |
| `POST` | `/api/chat/claude-code` | SSE streaming (Claude Code CLI via Agent SDK) |
| `GET` | `/api/providers` | List available models per provider |
| `GET/POST` | `/api/settings` | Read/write app settings |
| `POST` | `/api/tts/synthesize` | Text-to-speech via MiniMax API |

## Production Build

```bash
npm run build
node .output/server/index.mjs
```

## License

MIT
