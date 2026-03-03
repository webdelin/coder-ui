export default {
  // Layout / sidebar
  'sidebar.newChat': 'Новый чат',
  'sidebar.newChatShort': 'Новый чат',
  'sidebar.projects': 'Проекты',
  'sidebar.settings': 'Настройки',
  'sidebar.noConversations': 'Нет диалогов',
  'sidebar.unassigned': 'Без проекта',
  'sidebar.noProjects': 'Нет проектов',
  'sidebar.createToStart': 'Создайте проект, чтобы начать',
  'sidebar.rename': 'Переименовать',
  'sidebar.delete': 'Удалить',

  // Time ago
  'time.justNow': 'только что',
  'time.minutesAgo': '{n} мин назад',
  'time.hoursAgo': '{n} ч назад',
  'time.daysAgo': '{n} д назад',

  // Home page
  'home.welcome': 'Добро пожаловать в Coder UI',
  'home.selectProject': 'Выберите проект, чтобы начать чат',
  'home.createProject': 'Создать проект',
  'home.orContinue': 'Или продолжите из боковой панели',
  'home.deleteConfirm': 'Удалить проект "{name}"? Диалоги станут неназначенными.',
  'home.projectDeleted': 'Проект "{name}" удалён',
  'home.renameTitle': 'Переименовать',
  'home.deleteTitle': 'Удалить проект',

  // Chat
  'chat.startNew': 'Начать диалог в {name}',
  'chat.selectToStart': 'Выберите проект или диалог',
  'chat.placeholder': 'Введите сообщение...',
  'chat.dropFiles': 'Перетащите файлы сюда',
  'chat.transcribing': 'Транскрибирование...',
  'chat.attachFiles': 'Прикрепить файлы',
  'chat.selectModel': 'Выберите модель',

  // Thinking phrases
  'thinking.thinking': 'Думаю...',
  'thinking.pondering': 'Размышляю...',
  'thinking.processing': 'Обрабатываю...',
  'thinking.analyzing': 'Анализирую...',
  'thinking.reflecting': 'Оцениваю...',
  'thinking.evaluating': 'Проверяю...',
  'thinking.considering': 'Рассматриваю...',
  'thinking.reasoning': 'Рассуждаю...',

  // Copy code
  'code.copy': 'Копировать код',

  // Message actions
  'actions.copy': 'Копировать',
  'actions.copied': 'Скопировано',
  'actions.tts': 'Озвучить',

  // Tool calls
  'tool.command': 'Команда',
  'tool.input': 'Ввод',
  'tool.result': 'Результат',
  'tool.runningCommand': 'Выполнение команды...',
  'tool.updateTodo': 'Обновить список задач',
  'tool.file': 'файл',

  // Mic / STT
  'mic.denied': 'Доступ к микрофону запрещён.',
  'mic.noSpeech': 'Речь не обнаружена.',
  'mic.noMic': 'Микрофон не найден.',
  'mic.networkError': 'Ошибка сети при распознавании речи.',
  'mic.blocked': 'Распознавание речи заблокировано.',
  'mic.accessDenied': 'Доступ к микрофону запрещён',
  'mic.unavailable': 'SpeechRecognition недоступен',
  'mic.startFailed': 'Ошибка запуска: {message}',
  'mic.noSpeechDetected': 'Речь не обнаружена',
  'mic.transcriptionFailed': 'Ошибка транскрипции',
  'mic.recordingFailed': 'Ошибка записи',
  'mic.stopRecording': 'Остановить запись',
  'mic.voiceInput': 'Голосовой ввод',

  // Create project dialog
  'project.createTitle': 'Создать проект',
  'project.createDescription': 'Привяжите директорию к проекту.',
  'project.pathLabel': 'Путь к проекту',
  'project.pathRequired': 'Укажите путь',
  'project.displayNameLabel': 'Отображаемое имя',
  'project.displayNameHint': 'Необязательно',
  'project.cancel': 'Отмена',
  'project.createButton': 'Создать',
  'project.created': 'Проект "{name}" создан',
  'project.createFailed': 'Не удалось создать проект',

  // Settings
  'settings.title': 'Настройки',
  'settings.subtitle': 'Настройте провайдеры ИИ и параметры.',
  'settings.providers': 'Провайдеры',
  'settings.cliNote': 'Использует локальный Claude Code CLI. API ключ не нужен — используется ваша авторизация Claude.',
  'settings.apiKeyLabel': 'API ключ',
  'settings.apiKeyPlaceholder': 'Введите API ключ...',
  'settings.defaults': 'По умолчанию',
  'settings.systemPrompt': 'Системный промпт',
  'settings.systemPromptPlaceholder': 'Системный промпт для всех диалогов...',

  // TTS settings
  'settings.tts': 'Синтез речи',
  'settings.enableTts': 'Включить TTS',
  'settings.ttsDescription': 'Показывать кнопку озвучки у сообщений',
  'settings.autoRead': 'Авто-озвучка',
  'settings.autoReadDescription': 'Автоматически озвучивать ответы',
  'settings.engine': 'Движок',
  'settings.voice': 'Голос',
  'settings.speed': 'Скорость',
  'settings.systemDefault': 'Системный',
  'settings.noVoices': 'Нет доступных голосов — браузеру может потребоваться время для их загрузки.',
  'settings.minimaxKeyRequired': 'Требуется API ключ MiniMax — настройте его в разделе Провайдеры.',

  // STT settings
  'settings.stt': 'Распознавание речи',
  'settings.sttLocalDesc': 'Запускает faster-whisper локально на сервере. API ключ не нужен. Требуется: pip install faster-whisper',
  'settings.sttBrowserDesc': 'Использует SpeechRecognition браузера (Chrome/Edge). В Firefox — локальное распознавание.',
  'settings.sttWhisperDesc': 'Записывает аудио и транскрибирует через Whisper API (Groq, OpenAI). Работает во всех браузерах.',
  'settings.sttProvider': 'Провайдер',
  'settings.sttApiKeyPlaceholder': 'Введите Whisper API ключ...',
  'settings.sttGroqNote': 'Получите бесплатный ключ на',
  'settings.sttApiUrl': 'URL API',
  'settings.sttModel': 'Модель',

  // Appearance
  'settings.appearance': 'Оформление',
  'settings.colorMode': 'Цветовая тема',
  'settings.language': 'Язык',

  // Save / Danger
  'settings.save': 'Сохранить',
  'settings.saved': 'Настройки сохранены',
  'settings.saveFailed': 'Ошибка сохранения',
  'settings.dangerZone': 'Опасная зона',
  'settings.deleteAll': 'Удалить все диалоги',
  'settings.deleteAllDescription': 'Безвозвратно удалить все диалоги и сообщения. Это действие нельзя отменить.',
  'settings.deleteAllButton': 'Удалить все',
  'settings.confirmDelete': 'Подтвердить',
  'settings.allDeleted': 'Все диалоги удалены',
  'settings.clearFailed': 'Ошибка удаления',

  // TTS engine options
  'ttsEngine.local': 'Локальный (браузер)',
  'ttsEngine.minimax': 'MiniMax API',

  // STT engine options
  'sttEngine.local': 'Локальный (faster-whisper)',
  'sttEngine.browser': 'Браузер (Chrome/Edge)',
  'sttEngine.whisper': 'Whisper API (Groq/OpenAI)',

  // STT presets
  'sttPreset.groq': 'Groq (бесплатно)',
  'sttPreset.openai': 'OpenAI',
  'sttPreset.custom': 'Другой',

  // Speed options
  'speed.normal': '1.0x (обычная)',

  // Memory
  'memory.title': 'Воспоминания',
  'memory.count': '{n} воспоминаний',
  'memory.empty': 'Пока нет воспоминаний. Создаются автоматически из диалогов.',
  'memory.add': 'Добавить',
  'memory.addPlaceholder': 'Добавить воспоминание...',
  'memory.delete': 'Удалить',
  'memory.type.auto': 'Авто',
  'memory.type.manual': 'Ручное',
} as const
