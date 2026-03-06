export default {
  // Layout / sidebar
  'sidebar.newChat': 'New Chat',
  'sidebar.newChatShort': 'New chat',
  'sidebar.projects': 'Projects',
  'sidebar.settings': 'Settings',
  'sidebar.noConversations': 'No conversations yet',
  'sidebar.unassigned': 'Unassigned',
  'sidebar.noProjects': 'No projects yet',
  'sidebar.createToStart': 'Create a project to get started',
  'sidebar.rename': 'Rename',
  'sidebar.delete': 'Delete',

  // Time ago
  'time.justNow': 'just now',
  'time.minutesAgo': '{n}m ago',
  'time.hoursAgo': '{n}h ago',
  'time.daysAgo': '{n}d ago',

  // Home page
  'home.welcome': 'Welcome to Coder UI',
  'home.selectProject': 'Select a project to start chatting',
  'home.createProject': 'Create New Project',
  'home.orContinue': 'Or continue from the sidebar to resume an existing session',
  'home.deleteConfirm': 'Delete project "{name}"? Conversations will become unassigned.',
  'home.projectDeleted': 'Project "{name}" deleted',
  'home.renameTitle': 'Rename',
  'home.deleteTitle': 'Delete project',

  // Chat
  'chat.startNew': 'Start a new conversation in {name}',
  'chat.selectToStart': 'Select a project or conversation to get started',
  'chat.placeholder': 'Type a message...',
  'chat.dropFiles': 'Drop files here',
  'chat.transcribing': 'Transcribing...',
  'chat.attachFiles': 'Attach files',
  'chat.selectModel': 'Select model',

  // Thinking phrases
  'thinking.thinking': 'Thinking...',
  'thinking.pondering': 'Pondering...',
  'thinking.processing': 'Processing...',
  'thinking.analyzing': 'Analyzing...',
  'thinking.reflecting': 'Reflecting...',
  'thinking.evaluating': 'Evaluating...',
  'thinking.considering': 'Considering...',
  'thinking.reasoning': 'Reasoning...',

  // Copy code
  'code.copy': 'Copy code',

  // Message actions
  'actions.copy': 'Copy',
  'actions.copied': 'Copied',
  'actions.tts': 'Text to speech',

  // Tool calls
  'tool.command': 'Command',
  'tool.input': 'Input',
  'tool.result': 'Result',
  'tool.runningCommand': 'Running command...',
  'tool.updateTodo': 'Update todo list',
  'tool.file': 'file',

  // Mic / STT
  'mic.denied': 'Microphone access denied.',
  'mic.noSpeech': 'No speech detected.',
  'mic.noMic': 'No microphone found.',
  'mic.networkError': 'Network error during speech recognition.',
  'mic.blocked': 'Speech recognition blocked.',
  'mic.accessDenied': 'Microphone access denied',
  'mic.unavailable': 'SpeechRecognition not available',
  'mic.startFailed': 'Start failed: {message}',
  'mic.noSpeechDetected': 'No speech detected',
  'mic.transcriptionFailed': 'Transcription failed',
  'mic.recordingFailed': 'Recording failed',
  'mic.stopRecording': 'Stop recording',
  'mic.voiceInput': 'Voice input',

  // Create project dialog
  'project.createTitle': 'Create New Project',
  'project.createDescription': 'Link a directory on your filesystem as a project.',
  'project.pathLabel': 'Project Path',
  'project.pathRequired': 'Path is required',
  'project.displayNameLabel': 'Display Name',
  'project.displayNameHint': 'Optional',
  'project.cancel': 'Cancel',
  'project.createButton': 'Create Project',
  'project.created': 'Project "{name}" created',
  'project.createFailed': 'Failed to create project',

  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Configure your AI providers and preferences.',
  'settings.providers': 'Providers',
  'settings.cliNote': 'Uses locally installed Claude Code CLI. No API key needed — it uses your existing Claude authentication.',
  'settings.ollamaNote': 'Runs locally via Ollama. No API key needed. Default: http://localhost:11434/v1',
  'settings.apiKeyLabel': 'API Key',
  'settings.apiKeyPlaceholder': 'Enter API key...',
  'settings.defaults': 'Defaults',
  'settings.systemPrompt': 'System Prompt',
  'settings.systemPromptPlaceholder': 'Optional system prompt for all conversations...',

  // TTS settings
  'settings.tts': 'Text-to-Speech',
  'settings.enableTts': 'Enable TTS',
  'settings.ttsDescription': 'Show speak button on messages',
  'settings.autoRead': 'Auto-Read',
  'settings.autoReadDescription': 'Automatically read responses aloud',
  'settings.engine': 'Engine',
  'settings.voice': 'Voice',
  'settings.speed': 'Speed',
  'settings.systemDefault': 'System default',
  'settings.noVoices': 'No voices available — your browser may need to load them first.',
  'settings.minimaxKeyRequired': 'MiniMax API key required — configure it in Providers above.',

  // STT settings
  'settings.stt': 'Speech-to-Text',
  'settings.sttLocalDesc': 'Runs faster-whisper locally on the server. No API key needed. Requires: pip install faster-whisper',
  'settings.sttBrowserDesc': 'Uses browser SpeechRecognition (Chrome/Edge only). Falls back to local in Firefox.',
  'settings.sttWhisperDesc': 'Records audio and transcribes via Whisper API (Groq, OpenAI). Works in all browsers.',
  'settings.sttProvider': 'Provider',
  'settings.sttApiKeyPlaceholder': 'Enter Whisper API key...',
  'settings.sttGroqNote': 'Get a free key at',
  'settings.sttApiUrl': 'API URL',
  'settings.sttModel': 'Model',

  // Appearance
  'settings.appearance': 'Appearance',
  'settings.colorMode': 'Color Mode',
  'settings.language': 'Language',

  // Save / Danger
  'settings.save': 'Save Settings',
  'settings.saved': 'Settings saved',
  'settings.saveFailed': 'Failed to save',
  'settings.dangerZone': 'Danger Zone',
  'settings.deleteAll': 'Delete All Conversations',
  'settings.deleteAllDescription': 'Permanently remove all conversations and messages. This cannot be undone.',
  'settings.deleteAllButton': 'Delete All',
  'settings.confirmDelete': 'Confirm Delete',
  'settings.allDeleted': 'All conversations deleted',
  'settings.clearFailed': 'Failed to clear',

  // TTS engine options
  'ttsEngine.local': 'Local (Browser)',
  'ttsEngine.minimax': 'MiniMax API',

  // STT engine options
  'sttEngine.local': 'Local (faster-whisper)',
  'sttEngine.browser': 'Browser (Chrome/Edge)',
  'sttEngine.whisper': 'Whisper API (Groq/OpenAI)',

  // STT presets
  'sttPreset.groq': 'Groq (Free)',
  'sttPreset.openai': 'OpenAI',
  'sttPreset.custom': 'Custom',

  // Speed options
  'speed.normal': '1.0x (Normal)',

  // Project Settings
  'projectSettings.title': 'Project Settings',
  'projectSettings.settingsFor': 'Settings for',
  'projectSettings.permissions': 'Permissions',
  'projectSettings.environment': 'Environment',
  'projectSettings.git': 'Git',
  'projectSettings.cleanup': 'Cleanup',
  'projectSettings.permissionsFramework': 'Permissions Framework',
  'projectSettings.permissionsDesc': 'Configure Claude\'s access permissions and behavior.',
  'projectSettings.defaultMode': 'Default Permission Mode',
  'projectSettings.allowList': 'Allow List',
  'projectSettings.allowListDesc': 'Whitelist specific tools or patterns.',
  'projectSettings.allowPlaceholder': 'e.g., Bash(git diff:*)',
  'projectSettings.addAllowRule': 'Add Allow Rule',
  'projectSettings.denyList': 'Deny List',
  'projectSettings.denyListDesc': 'Blacklist specific tools or patterns.',
  'projectSettings.denyPlaceholder': 'e.g., WebFetch, Bash(curl:*)',
  'projectSettings.addDenyRule': 'Add Deny Rule',
  'projectSettings.additionalDirs': 'Additional Directories',
  'projectSettings.additionalDirsDesc': 'Extra directories Claude can access beyond the project root.',
  'projectSettings.dirPlaceholder': 'e.g., ../docs/',
  'projectSettings.addDirectory': 'Add Directory',
  'projectSettings.envTitle': 'Environment Variables',
  'projectSettings.envDesc': 'Set environment variables for Claude Code sessions in this project.',
  'projectSettings.addEnvVar': 'Add Variable',
  'projectSettings.gitTitle': 'Git Settings',
  'projectSettings.gitDesc': 'Configure git-related behavior for this project.',
  'projectSettings.coAuthoredBy': 'Include Co-Authored-By',
  'projectSettings.coAuthoredByDesc': 'Add co-authored-by metadata to commits made by Claude.',
  'projectSettings.cleanupTitle': 'Cleanup',
  'projectSettings.cleanupDesc': 'Configure automatic cleanup of old sessions and temporary files.',
  'projectSettings.cleanupPeriod': 'Auto-cleanup period',
  'projectSettings.days': 'days',
  'projectSettings.saveSettings': 'Save Settings',
  'projectSettings.resetDefaults': 'Reset to Defaults',
  'projectSettings.saved': 'Project settings saved',
  'projectSettings.saveFailed': 'Failed to save settings',
  'projectSettings.resetDone': 'Settings reset to defaults',
  'projectSettings.autoRead': 'Auto-read messages',

  // Memory
  'memory.title': 'Memories',
  'memory.count': '{n} memories',
  'memory.empty': 'No memories yet. Memories are created automatically from conversations.',
  'memory.add': 'Add',
  'memory.addPlaceholder': 'Add a memory...',
  'memory.delete': 'Delete memory',
  'memory.type.auto': 'Auto',
  'memory.type.manual': 'Manual',
} as const
