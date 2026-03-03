export default {
  // Layout / sidebar
  'sidebar.newChat': 'Neuer Chat',
  'sidebar.newChatShort': 'Neuer Chat',
  'sidebar.projects': 'Projekte',
  'sidebar.settings': 'Einstellungen',
  'sidebar.noConversations': 'Keine Unterhaltungen',
  'sidebar.unassigned': 'Nicht zugeordnet',
  'sidebar.noProjects': 'Keine Projekte',
  'sidebar.createToStart': 'Erstelle ein Projekt, um loszulegen',
  'sidebar.rename': 'Umbenennen',
  'sidebar.delete': 'Löschen',

  // Time ago
  'time.justNow': 'gerade eben',
  'time.minutesAgo': 'vor {n} Min',
  'time.hoursAgo': 'vor {n} Std',
  'time.daysAgo': 'vor {n} T',

  // Home page
  'home.welcome': 'Willkommen bei Coder UI',
  'home.selectProject': 'Wähle ein Projekt, um zu chatten',
  'home.createProject': 'Neues Projekt erstellen',
  'home.orContinue': 'Oder fahre über die Seitenleiste mit einer bestehenden Sitzung fort',
  'home.deleteConfirm': 'Projekt "{name}" löschen? Unterhaltungen werden nicht zugeordnet.',
  'home.projectDeleted': 'Projekt "{name}" gelöscht',
  'home.renameTitle': 'Umbenennen',
  'home.deleteTitle': 'Projekt löschen',

  // Chat
  'chat.startNew': 'Neue Unterhaltung in {name} starten',
  'chat.selectToStart': 'Wähle ein Projekt oder eine Unterhaltung',
  'chat.placeholder': 'Nachricht eingeben...',
  'chat.dropFiles': 'Dateien hier ablegen',
  'chat.transcribing': 'Transkribiere...',
  'chat.attachFiles': 'Dateien anhängen',
  'chat.selectModel': 'Modell wählen',

  // Thinking phrases
  'thinking.thinking': 'Denke nach...',
  'thinking.pondering': 'Überlege...',
  'thinking.processing': 'Verarbeite...',
  'thinking.analyzing': 'Analysiere...',
  'thinking.reflecting': 'Reflektiere...',
  'thinking.evaluating': 'Bewerte...',
  'thinking.considering': 'Erwäge...',
  'thinking.reasoning': 'Schlussfolgere...',

  // Copy code
  'code.copy': 'Code kopieren',

  // Message actions
  'actions.copy': 'Kopieren',
  'actions.copied': 'Kopiert',
  'actions.tts': 'Vorlesen',

  // Tool calls
  'tool.command': 'Befehl',
  'tool.input': 'Eingabe',
  'tool.result': 'Ergebnis',
  'tool.runningCommand': 'Befehl wird ausgeführt...',
  'tool.updateTodo': 'Aufgabenliste aktualisieren',
  'tool.file': 'Datei',

  // Mic / STT
  'mic.denied': 'Mikrofon verweigert.',
  'mic.noSpeech': 'Keine Sprache erkannt.',
  'mic.noMic': 'Kein Mikrofon gefunden.',
  'mic.networkError': 'Netzwerkfehler bei Spracherkennung.',
  'mic.blocked': 'Spracherkennung blockiert.',
  'mic.accessDenied': 'Mikrofon-Zugriff verweigert',
  'mic.unavailable': 'SpeechRecognition nicht verfügbar',
  'mic.startFailed': 'Start fehlgeschlagen: {message}',
  'mic.noSpeechDetected': 'Keine Sprache erkannt',
  'mic.transcriptionFailed': 'Transkription fehlgeschlagen',
  'mic.recordingFailed': 'Aufnahme fehlgeschlagen',
  'mic.stopRecording': 'Aufnahme stoppen',
  'mic.voiceInput': 'Spracheingabe',

  // Create project dialog
  'project.createTitle': 'Neues Projekt erstellen',
  'project.createDescription': 'Verknüpfe ein Verzeichnis als Projekt.',
  'project.pathLabel': 'Projektpfad',
  'project.pathRequired': 'Pfad ist erforderlich',
  'project.displayNameLabel': 'Anzeigename',
  'project.displayNameHint': 'Optional',
  'project.cancel': 'Abbrechen',
  'project.createButton': 'Projekt erstellen',
  'project.created': 'Projekt "{name}" erstellt',
  'project.createFailed': 'Projekt konnte nicht erstellt werden',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'KI-Anbieter und Einstellungen konfigurieren.',
  'settings.providers': 'Anbieter',
  'settings.cliNote': 'Verwendet lokal installiertes Claude Code CLI. Kein API-Schlüssel nötig — nutzt Ihre bestehende Claude-Authentifizierung.',
  'settings.apiKeyLabel': 'API-Schlüssel',
  'settings.apiKeyPlaceholder': 'API-Schlüssel eingeben...',
  'settings.defaults': 'Standardwerte',
  'settings.systemPrompt': 'System-Prompt',
  'settings.systemPromptPlaceholder': 'Optionaler System-Prompt für alle Unterhaltungen...',

  // TTS settings
  'settings.tts': 'Sprachausgabe',
  'settings.enableTts': 'TTS aktivieren',
  'settings.ttsDescription': 'Vorlesen-Button bei Nachrichten anzeigen',
  'settings.autoRead': 'Auto-Vorlesen',
  'settings.autoReadDescription': 'Antworten automatisch vorlesen',
  'settings.engine': 'Engine',
  'settings.voice': 'Stimme',
  'settings.speed': 'Geschwindigkeit',
  'settings.systemDefault': 'Systemstandard',
  'settings.noVoices': 'Keine Stimmen verfügbar — der Browser muss sie eventuell erst laden.',
  'settings.minimaxKeyRequired': 'MiniMax API-Schlüssel erforderlich — oben bei Anbieter konfigurieren.',

  // STT settings
  'settings.stt': 'Spracheingabe',
  'settings.sttLocalDesc': 'Führt faster-whisper lokal auf dem Server aus. Kein API-Schlüssel nötig. Erfordert: pip install faster-whisper',
  'settings.sttBrowserDesc': 'Nutzt Browser-Spracherkennung (Chrome/Edge). In Firefox wird lokal transkribiert.',
  'settings.sttWhisperDesc': 'Nimmt Audio auf und transkribiert über Whisper API (Groq, OpenAI). Funktioniert in allen Browsern.',
  'settings.sttProvider': 'Anbieter',
  'settings.sttApiKeyPlaceholder': 'Whisper API-Schlüssel eingeben...',
  'settings.sttGroqNote': 'Kostenlosen Schlüssel erhalten bei',
  'settings.sttApiUrl': 'API-URL',
  'settings.sttModel': 'Modell',

  // Appearance
  'settings.appearance': 'Darstellung',
  'settings.colorMode': 'Farbmodus',
  'settings.language': 'Sprache',

  // Save / Danger
  'settings.save': 'Speichern',
  'settings.saved': 'Einstellungen gespeichert',
  'settings.saveFailed': 'Speichern fehlgeschlagen',
  'settings.dangerZone': 'Gefahrenzone',
  'settings.deleteAll': 'Alle Unterhaltungen löschen',
  'settings.deleteAllDescription': 'Alle Unterhaltungen und Nachrichten unwiderruflich löschen.',
  'settings.deleteAllButton': 'Alle löschen',
  'settings.confirmDelete': 'Löschen bestätigen',
  'settings.allDeleted': 'Alle Unterhaltungen gelöscht',
  'settings.clearFailed': 'Löschen fehlgeschlagen',

  // TTS engine options
  'ttsEngine.local': 'Lokal (Browser)',
  'ttsEngine.minimax': 'MiniMax API',

  // STT engine options
  'sttEngine.local': 'Lokal (faster-whisper)',
  'sttEngine.browser': 'Browser (Chrome/Edge)',
  'sttEngine.whisper': 'Whisper API (Groq/OpenAI)',

  // STT presets
  'sttPreset.groq': 'Groq (kostenlos)',
  'sttPreset.openai': 'OpenAI',
  'sttPreset.custom': 'Benutzerdefiniert',

  // Speed options
  'speed.normal': '1.0x (Normal)',
} as const
