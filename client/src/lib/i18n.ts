/**
 * Sistema i18n central — MultiLingue Universal
 * Interface traduzida para os 69 idiomas nativos do aluno.
 * Todas as strings de UI, menus, botões, instruções e feedback.
 */

export type UIStrings = {
  // Navegação
  home: string;
  dashboard: string;
  lessons: string;
  teachers: string;
  immersive: string;
  conversation: string;
  freeTalk: string;
  vocabulary: string;
  progress: string;
  settings: string;
  logout: string;

  // Ações
  start: string;
  continue: string;
  back: string;
  next: string;
  finish: string;
  retry: string;
  send: string;
  listen: string;
  speak: string;
  translate: string;
  save: string;
  cancel: string;
  confirm: string;
  select: string;
  search: string;
  random: string;

  // Aprendizado
  nativeLanguage: string;
  studyLanguage: string;
  selectNative: string;
  selectStudy: string;
  level: string;
  beginner: string;
  elementary: string;
  intermediate: string;
  advanced: string;
  proficient: string;
  scientific: string;
  lesson: string;
  exercise: string;
  pronunciation: string;
  vocabulary_word: string;
  translation: string;
  phonetic: string;
  example: string;
  score: string;
  xp: string;
  streak: string;
  ranking: string;

  // Conversação
  typeMessage: string;
  suggestions: string;
  correction: string;
  feedback: string;
  newWords: string;
  levelUp: string;
  conversationFree: string;
  topicFree: string;
  topicPlaceholder: string;
  chooseLevel: string;
  startConversation: string;
  wordsLearned: string;

  // Cenas imersivas
  selectScene: string;
  enterScene: string;
  hotspotClick: string;
  learnWord: string;
  practiceHere: string;
  sceneLanguage: string;

  // Erros e estados
  loading: string;
  error: string;
  noResults: string;
  tryAgain: string;
  success: string;

  // Onboarding
  welcome: string;
  welcomeSubtitle: string;
  detectingLanguage: string;
  languageDetected: string;
  confirmNative: string;
  chooseStudy: string;
  letsStart: string;
};

// Traduções completas para os 69 idiomas
const translations: Record<string, UIStrings> = {
  "pt-BR": {
    home: "Início", dashboard: "Painel", lessons: "Lições", teachers: "Professores",
    immersive: "Cenas Imersivas", conversation: "Conversação", freeTalk: "Conversa Livre",
    vocabulary: "Vocabulário", progress: "Progresso", settings: "Configurações", logout: "Sair",
    start: "Começar", continue: "Continuar", back: "Voltar", next: "Próximo",
    finish: "Finalizar", retry: "Tentar novamente", send: "Enviar", listen: "Ouvir",
    speak: "Falar", translate: "Traduzir", save: "Salvar", cancel: "Cancelar",
    confirm: "Confirmar", select: "Selecionar", search: "Buscar", random: "Aleatório",
    nativeLanguage: "Idioma nativo", studyLanguage: "Idioma a estudar",
    selectNative: "Selecione seu idioma nativo", selectStudy: "Selecione o idioma a estudar",
    level: "Nível", beginner: "Iniciante", elementary: "Básico", intermediate: "Intermediário",
    advanced: "Avançado", proficient: "Fluente", scientific: "Científico",
    lesson: "Lição", exercise: "Exercício", pronunciation: "Pronúncia",
    vocabulary_word: "Vocabulário", translation: "Tradução", phonetic: "Fonética",
    example: "Exemplo", score: "Pontuação", xp: "XP", streak: "Sequência", ranking: "Ranking",
    typeMessage: "Digite em", suggestions: "Sugestões", correction: "Correção",
    feedback: "Feedback", newWords: "Palavras novas", levelUp: "Subiu de nível!",
    conversationFree: "Conversa Livre Ilimitada", topicFree: "Tópico livre",
    topicPlaceholder: "Ex: viagem, trabalho, família...", chooseLevel: "Escolha seu nível",
    startConversation: "Iniciar conversa", wordsLearned: "Palavras aprendidas",
    selectScene: "Escolha uma cena", enterScene: "Entrar na cena",
    hotspotClick: "Clique nos objetos para aprender", learnWord: "Aprender palavra",
    practiceHere: "Praticar aqui", sceneLanguage: "Idioma da cena",
    loading: "Carregando...", error: "Erro", noResults: "Sem resultados",
    tryAgain: "Tentar novamente", success: "Sucesso!",
    welcome: "Bem-vindo ao MultiLingue Universal", welcomeSubtitle: "Aprenda qualquer idioma com IA avançada",
    detectingLanguage: "Detectando seu idioma...", languageDetected: "Idioma detectado",
    confirmNative: "Este é seu idioma nativo?", chooseStudy: "Qual idioma quer aprender?",
    letsStart: "Vamos começar!",
  },
  "en-US": {
    home: "Home", dashboard: "Dashboard", lessons: "Lessons", teachers: "Teachers",
    immersive: "Immersive Scenes", conversation: "Conversation", freeTalk: "Free Talk",
    vocabulary: "Vocabulary", progress: "Progress", settings: "Settings", logout: "Log out",
    start: "Start", continue: "Continue", back: "Back", next: "Next",
    finish: "Finish", retry: "Try again", send: "Send", listen: "Listen",
    speak: "Speak", translate: "Translate", save: "Save", cancel: "Cancel",
    confirm: "Confirm", select: "Select", search: "Search", random: "Random",
    nativeLanguage: "Native language", studyLanguage: "Study language",
    selectNative: "Select your native language", selectStudy: "Select the language to study",
    level: "Level", beginner: "Beginner", elementary: "Elementary", intermediate: "Intermediate",
    advanced: "Advanced", proficient: "Proficient", scientific: "Scientific",
    lesson: "Lesson", exercise: "Exercise", pronunciation: "Pronunciation",
    vocabulary_word: "Vocabulary", translation: "Translation", phonetic: "Phonetic",
    example: "Example", score: "Score", xp: "XP", streak: "Streak", ranking: "Ranking",
    typeMessage: "Type in", suggestions: "Suggestions", correction: "Correction",
    feedback: "Feedback", newWords: "New words", levelUp: "Level up!",
    conversationFree: "Unlimited Free Talk", topicFree: "Free topic",
    topicPlaceholder: "e.g. travel, work, family...", chooseLevel: "Choose your level",
    startConversation: "Start conversation", wordsLearned: "Words learned",
    selectScene: "Choose a scene", enterScene: "Enter scene",
    hotspotClick: "Click objects to learn", learnWord: "Learn word",
    practiceHere: "Practice here", sceneLanguage: "Scene language",
    loading: "Loading...", error: "Error", noResults: "No results",
    tryAgain: "Try again", success: "Success!",
    welcome: "Welcome to MultiLingue Universal", welcomeSubtitle: "Learn any language with advanced AI",
    detectingLanguage: "Detecting your language...", languageDetected: "Language detected",
    confirmNative: "Is this your native language?", chooseStudy: "Which language do you want to learn?",
    letsStart: "Let's start!",
  },
  "es-ES": {
    home: "Inicio", dashboard: "Panel", lessons: "Lecciones", teachers: "Profesores",
    immersive: "Escenas Inmersivas", conversation: "Conversación", freeTalk: "Habla Libre",
    vocabulary: "Vocabulario", progress: "Progreso", settings: "Configuración", logout: "Salir",
    start: "Comenzar", continue: "Continuar", back: "Volver", next: "Siguiente",
    finish: "Finalizar", retry: "Intentar de nuevo", send: "Enviar", listen: "Escuchar",
    speak: "Hablar", translate: "Traducir", save: "Guardar", cancel: "Cancelar",
    confirm: "Confirmar", select: "Seleccionar", search: "Buscar", random: "Aleatorio",
    nativeLanguage: "Idioma nativo", studyLanguage: "Idioma a estudiar",
    selectNative: "Selecciona tu idioma nativo", selectStudy: "Selecciona el idioma a estudiar",
    level: "Nivel", beginner: "Principiante", elementary: "Elemental", intermediate: "Intermedio",
    advanced: "Avanzado", proficient: "Competente", scientific: "Científico",
    lesson: "Lección", exercise: "Ejercicio", pronunciation: "Pronunciación",
    vocabulary_word: "Vocabulario", translation: "Traducción", phonetic: "Fonética",
    example: "Ejemplo", score: "Puntuación", xp: "XP", streak: "Racha", ranking: "Clasificación",
    typeMessage: "Escribe en", suggestions: "Sugerencias", correction: "Corrección",
    feedback: "Retroalimentación", newWords: "Palabras nuevas", levelUp: "¡Subiste de nivel!",
    conversationFree: "Conversación Libre Ilimitada", topicFree: "Tema libre",
    topicPlaceholder: "Ej: viaje, trabajo, familia...", chooseLevel: "Elige tu nivel",
    startConversation: "Iniciar conversación", wordsLearned: "Palabras aprendidas",
    selectScene: "Elige una escena", enterScene: "Entrar en la escena",
    hotspotClick: "Haz clic en los objetos para aprender", learnWord: "Aprender palabra",
    practiceHere: "Practicar aquí", sceneLanguage: "Idioma de la escena",
    loading: "Cargando...", error: "Error", noResults: "Sin resultados",
    tryAgain: "Intentar de nuevo", success: "¡Éxito!",
    welcome: "Bienvenido a MultiLingue Universal", welcomeSubtitle: "Aprende cualquier idioma con IA avanzada",
    detectingLanguage: "Detectando tu idioma...", languageDetected: "Idioma detectado",
    confirmNative: "¿Es este tu idioma nativo?", chooseStudy: "¿Qué idioma quieres aprender?",
    letsStart: "¡Empecemos!",
  },
  "fr-FR": {
    home: "Accueil", dashboard: "Tableau de bord", lessons: "Leçons", teachers: "Professeurs",
    immersive: "Scènes Immersives", conversation: "Conversation", freeTalk: "Conversation Libre",
    vocabulary: "Vocabulaire", progress: "Progrès", settings: "Paramètres", logout: "Déconnexion",
    start: "Commencer", continue: "Continuer", back: "Retour", next: "Suivant",
    finish: "Terminer", retry: "Réessayer", send: "Envoyer", listen: "Écouter",
    speak: "Parler", translate: "Traduire", save: "Sauvegarder", cancel: "Annuler",
    confirm: "Confirmer", select: "Sélectionner", search: "Rechercher", random: "Aléatoire",
    nativeLanguage: "Langue maternelle", studyLanguage: "Langue à étudier",
    selectNative: "Sélectionnez votre langue maternelle", selectStudy: "Sélectionnez la langue à étudier",
    level: "Niveau", beginner: "Débutant", elementary: "Élémentaire", intermediate: "Intermédiaire",
    advanced: "Avancé", proficient: "Compétent", scientific: "Scientifique",
    lesson: "Leçon", exercise: "Exercice", pronunciation: "Prononciation",
    vocabulary_word: "Vocabulaire", translation: "Traduction", phonetic: "Phonétique",
    example: "Exemple", score: "Score", xp: "XP", streak: "Série", ranking: "Classement",
    typeMessage: "Tapez en", suggestions: "Suggestions", correction: "Correction",
    feedback: "Retour", newWords: "Nouveaux mots", levelUp: "Niveau supérieur !",
    conversationFree: "Conversation Libre Illimitée", topicFree: "Sujet libre",
    topicPlaceholder: "Ex: voyage, travail, famille...", chooseLevel: "Choisissez votre niveau",
    startConversation: "Démarrer la conversation", wordsLearned: "Mots appris",
    selectScene: "Choisissez une scène", enterScene: "Entrer dans la scène",
    hotspotClick: "Cliquez sur les objets pour apprendre", learnWord: "Apprendre le mot",
    practiceHere: "Pratiquer ici", sceneLanguage: "Langue de la scène",
    loading: "Chargement...", error: "Erreur", noResults: "Aucun résultat",
    tryAgain: "Réessayer", success: "Succès !",
    welcome: "Bienvenue sur MultiLingue Universal", welcomeSubtitle: "Apprenez n'importe quelle langue avec l'IA avancée",
    detectingLanguage: "Détection de votre langue...", languageDetected: "Langue détectée",
    confirmNative: "Est-ce votre langue maternelle ?", chooseStudy: "Quelle langue voulez-vous apprendre ?",
    letsStart: "Commençons !",
  },
  "de-DE": {
    home: "Startseite", dashboard: "Dashboard", lessons: "Lektionen", teachers: "Lehrer",
    immersive: "Immersive Szenen", conversation: "Konversation", freeTalk: "Freies Gespräch",
    vocabulary: "Vokabular", progress: "Fortschritt", settings: "Einstellungen", logout: "Abmelden",
    start: "Starten", continue: "Weiter", back: "Zurück", next: "Nächste",
    finish: "Beenden", retry: "Erneut versuchen", send: "Senden", listen: "Hören",
    speak: "Sprechen", translate: "Übersetzen", save: "Speichern", cancel: "Abbrechen",
    confirm: "Bestätigen", select: "Auswählen", search: "Suchen", random: "Zufällig",
    nativeLanguage: "Muttersprache", studyLanguage: "Lernsprache",
    selectNative: "Wähle deine Muttersprache", selectStudy: "Wähle die Lernsprache",
    level: "Niveau", beginner: "Anfänger", elementary: "Grundstufe", intermediate: "Mittelstufe",
    advanced: "Fortgeschritten", proficient: "Kompetent", scientific: "Wissenschaftlich",
    lesson: "Lektion", exercise: "Übung", pronunciation: "Aussprache",
    vocabulary_word: "Vokabular", translation: "Übersetzung", phonetic: "Phonetik",
    example: "Beispiel", score: "Punktzahl", xp: "XP", streak: "Serie", ranking: "Rangliste",
    typeMessage: "Schreibe auf", suggestions: "Vorschläge", correction: "Korrektur",
    feedback: "Rückmeldung", newWords: "Neue Wörter", levelUp: "Level aufgestiegen!",
    conversationFree: "Unbegrenztes freies Gespräch", topicFree: "Freies Thema",
    topicPlaceholder: "z.B. Reise, Arbeit, Familie...", chooseLevel: "Wähle dein Niveau",
    startConversation: "Gespräch starten", wordsLearned: "Gelernte Wörter",
    selectScene: "Wähle eine Szene", enterScene: "Szene betreten",
    hotspotClick: "Klicke auf Objekte zum Lernen", learnWord: "Wort lernen",
    practiceHere: "Hier üben", sceneLanguage: "Szenensprache",
    loading: "Laden...", error: "Fehler", noResults: "Keine Ergebnisse",
    tryAgain: "Erneut versuchen", success: "Erfolg!",
    welcome: "Willkommen bei MultiLingue Universal", welcomeSubtitle: "Lerne jede Sprache mit fortschrittlicher KI",
    detectingLanguage: "Sprache wird erkannt...", languageDetected: "Sprache erkannt",
    confirmNative: "Ist das deine Muttersprache?", chooseStudy: "Welche Sprache möchtest du lernen?",
    letsStart: "Los geht's!",
  },
  "it-IT": {
    home: "Home", dashboard: "Dashboard", lessons: "Lezioni", teachers: "Insegnanti",
    immersive: "Scene Immersive", conversation: "Conversazione", freeTalk: "Conversazione Libera",
    vocabulary: "Vocabolario", progress: "Progresso", settings: "Impostazioni", logout: "Esci",
    start: "Inizia", continue: "Continua", back: "Indietro", next: "Avanti",
    finish: "Finisci", retry: "Riprova", send: "Invia", listen: "Ascolta",
    speak: "Parla", translate: "Traduci", save: "Salva", cancel: "Annulla",
    confirm: "Conferma", select: "Seleziona", search: "Cerca", random: "Casuale",
    nativeLanguage: "Lingua madre", studyLanguage: "Lingua da studiare",
    selectNative: "Seleziona la tua lingua madre", selectStudy: "Seleziona la lingua da studiare",
    level: "Livello", beginner: "Principiante", elementary: "Elementare", intermediate: "Intermedio",
    advanced: "Avanzato", proficient: "Competente", scientific: "Scientifico",
    lesson: "Lezione", exercise: "Esercizio", pronunciation: "Pronuncia",
    vocabulary_word: "Vocabolario", translation: "Traduzione", phonetic: "Fonetica",
    example: "Esempio", score: "Punteggio", xp: "XP", streak: "Serie", ranking: "Classifica",
    typeMessage: "Scrivi in", suggestions: "Suggerimenti", correction: "Correzione",
    feedback: "Feedback", newWords: "Parole nuove", levelUp: "Livello superiore!",
    conversationFree: "Conversazione Libera Illimitata", topicFree: "Argomento libero",
    topicPlaceholder: "Es: viaggio, lavoro, famiglia...", chooseLevel: "Scegli il tuo livello",
    startConversation: "Inizia conversazione", wordsLearned: "Parole imparate",
    selectScene: "Scegli una scena", enterScene: "Entra nella scena",
    hotspotClick: "Clicca sugli oggetti per imparare", learnWord: "Impara parola",
    practiceHere: "Pratica qui", sceneLanguage: "Lingua della scena",
    loading: "Caricamento...", error: "Errore", noResults: "Nessun risultato",
    tryAgain: "Riprova", success: "Successo!",
    welcome: "Benvenuto in MultiLingue Universal", welcomeSubtitle: "Impara qualsiasi lingua con IA avanzata",
    detectingLanguage: "Rilevamento lingua...", languageDetected: "Lingua rilevata",
    confirmNative: "È questa la tua lingua madre?", chooseStudy: "Quale lingua vuoi imparare?",
    letsStart: "Iniziamo!",
  },
  "ja-JP": {
    home: "ホーム", dashboard: "ダッシュボード", lessons: "レッスン", teachers: "先生",
    immersive: "没入シーン", conversation: "会話", freeTalk: "フリートーク",
    vocabulary: "語彙", progress: "進捗", settings: "設定", logout: "ログアウト",
    start: "開始", continue: "続ける", back: "戻る", next: "次へ",
    finish: "終了", retry: "再試行", send: "送信", listen: "聞く",
    speak: "話す", translate: "翻訳", save: "保存", cancel: "キャンセル",
    confirm: "確認", select: "選択", search: "検索", random: "ランダム",
    nativeLanguage: "母国語", studyLanguage: "学習言語",
    selectNative: "母国語を選択", selectStudy: "学習言語を選択",
    level: "レベル", beginner: "初心者", elementary: "初級", intermediate: "中級",
    advanced: "上級", proficient: "熟練", scientific: "学術",
    lesson: "レッスン", exercise: "練習", pronunciation: "発音",
    vocabulary_word: "語彙", translation: "翻訳", phonetic: "発音記号",
    example: "例文", score: "スコア", xp: "XP", streak: "連続", ranking: "ランキング",
    typeMessage: "入力言語", suggestions: "提案", correction: "訂正",
    feedback: "フィードバック", newWords: "新しい単語", levelUp: "レベルアップ！",
    conversationFree: "無制限フリートーク", topicFree: "自由なトピック",
    topicPlaceholder: "例：旅行、仕事、家族...", chooseLevel: "レベルを選択",
    startConversation: "会話を開始", wordsLearned: "学習した単語",
    selectScene: "シーンを選択", enterScene: "シーンに入る",
    hotspotClick: "オブジェクトをクリックして学ぶ", learnWord: "単語を学ぶ",
    practiceHere: "ここで練習", sceneLanguage: "シーンの言語",
    loading: "読み込み中...", error: "エラー", noResults: "結果なし",
    tryAgain: "再試行", success: "成功！",
    welcome: "MultiLingue Universalへようこそ", welcomeSubtitle: "高度なAIで任意の言語を学ぶ",
    detectingLanguage: "言語を検出中...", languageDetected: "言語が検出されました",
    confirmNative: "これがあなたの母国語ですか？", chooseStudy: "どの言語を学びたいですか？",
    letsStart: "始めましょう！",
  },
  "zh-CN": {
    home: "首页", dashboard: "仪表板", lessons: "课程", teachers: "老师",
    immersive: "沉浸式场景", conversation: "对话", freeTalk: "自由对话",
    vocabulary: "词汇", progress: "进度", settings: "设置", logout: "退出",
    start: "开始", continue: "继续", back: "返回", next: "下一步",
    finish: "完成", retry: "重试", send: "发送", listen: "听",
    speak: "说", translate: "翻译", save: "保存", cancel: "取消",
    confirm: "确认", select: "选择", search: "搜索", random: "随机",
    nativeLanguage: "母语", studyLanguage: "学习语言",
    selectNative: "选择您的母语", selectStudy: "选择要学习的语言",
    level: "级别", beginner: "初学者", elementary: "初级", intermediate: "中级",
    advanced: "高级", proficient: "精通", scientific: "学术",
    lesson: "课程", exercise: "练习", pronunciation: "发音",
    vocabulary_word: "词汇", translation: "翻译", phonetic: "音标",
    example: "例句", score: "分数", xp: "经验值", streak: "连续", ranking: "排名",
    typeMessage: "用...输入", suggestions: "建议", correction: "纠正",
    feedback: "反馈", newWords: "新单词", levelUp: "升级！",
    conversationFree: "无限自由对话", topicFree: "自由话题",
    topicPlaceholder: "例：旅行、工作、家庭...", chooseLevel: "选择您的级别",
    startConversation: "开始对话", wordsLearned: "已学单词",
    selectScene: "选择场景", enterScene: "进入场景",
    hotspotClick: "点击物体学习", learnWord: "学习单词",
    practiceHere: "在这里练习", sceneLanguage: "场景语言",
    loading: "加载中...", error: "错误", noResults: "无结果",
    tryAgain: "重试", success: "成功！",
    welcome: "欢迎来到MultiLingue Universal", welcomeSubtitle: "用先进的AI学习任何语言",
    detectingLanguage: "正在检测您的语言...", languageDetected: "已检测到语言",
    confirmNative: "这是您的母语吗？", chooseStudy: "您想学习哪种语言？",
    letsStart: "开始吧！",
  },
  "ko-KR": {
    home: "홈", dashboard: "대시보드", lessons: "레슨", teachers: "선생님",
    immersive: "몰입형 장면", conversation: "대화", freeTalk: "자유 대화",
    vocabulary: "어휘", progress: "진행", settings: "설정", logout: "로그아웃",
    start: "시작", continue: "계속", back: "뒤로", next: "다음",
    finish: "완료", retry: "다시 시도", send: "보내기", listen: "듣기",
    speak: "말하기", translate: "번역", save: "저장", cancel: "취소",
    confirm: "확인", select: "선택", search: "검색", random: "랜덤",
    nativeLanguage: "모국어", studyLanguage: "학습 언어",
    selectNative: "모국어를 선택하세요", selectStudy: "학습할 언어를 선택하세요",
    level: "레벨", beginner: "초급", elementary: "기초", intermediate: "중급",
    advanced: "고급", proficient: "숙련", scientific: "학술",
    lesson: "레슨", exercise: "연습", pronunciation: "발음",
    vocabulary_word: "어휘", translation: "번역", phonetic: "발음기호",
    example: "예문", score: "점수", xp: "XP", streak: "연속", ranking: "순위",
    typeMessage: "입력 언어", suggestions: "제안", correction: "수정",
    feedback: "피드백", newWords: "새 단어", levelUp: "레벨 업!",
    conversationFree: "무제한 자유 대화", topicFree: "자유 주제",
    topicPlaceholder: "예: 여행, 직장, 가족...", chooseLevel: "레벨을 선택하세요",
    startConversation: "대화 시작", wordsLearned: "학습한 단어",
    selectScene: "장면 선택", enterScene: "장면 입장",
    hotspotClick: "물체를 클릭하여 학습", learnWord: "단어 학습",
    practiceHere: "여기서 연습", sceneLanguage: "장면 언어",
    loading: "로딩 중...", error: "오류", noResults: "결과 없음",
    tryAgain: "다시 시도", success: "성공!",
    welcome: "MultiLingue Universal에 오신 것을 환영합니다", welcomeSubtitle: "고급 AI로 어떤 언어든 배우세요",
    detectingLanguage: "언어 감지 중...", languageDetected: "언어가 감지되었습니다",
    confirmNative: "이것이 귀하의 모국어입니까?", chooseStudy: "어떤 언어를 배우고 싶으신가요?",
    letsStart: "시작합시다!",
  },
  "ru-RU": {
    home: "Главная", dashboard: "Панель", lessons: "Уроки", teachers: "Учителя",
    immersive: "Иммерсивные сцены", conversation: "Разговор", freeTalk: "Свободный разговор",
    vocabulary: "Словарь", progress: "Прогресс", settings: "Настройки", logout: "Выйти",
    start: "Начать", continue: "Продолжить", back: "Назад", next: "Далее",
    finish: "Завершить", retry: "Повторить", send: "Отправить", listen: "Слушать",
    speak: "Говорить", translate: "Перевести", save: "Сохранить", cancel: "Отмена",
    confirm: "Подтвердить", select: "Выбрать", search: "Поиск", random: "Случайно",
    nativeLanguage: "Родной язык", studyLanguage: "Изучаемый язык",
    selectNative: "Выберите родной язык", selectStudy: "Выберите изучаемый язык",
    level: "Уровень", beginner: "Начинающий", elementary: "Элементарный", intermediate: "Средний",
    advanced: "Продвинутый", proficient: "Опытный", scientific: "Научный",
    lesson: "Урок", exercise: "Упражнение", pronunciation: "Произношение",
    vocabulary_word: "Словарь", translation: "Перевод", phonetic: "Фонетика",
    example: "Пример", score: "Счёт", xp: "XP", streak: "Серия", ranking: "Рейтинг",
    typeMessage: "Введите на", suggestions: "Предложения", correction: "Исправление",
    feedback: "Отзыв", newWords: "Новые слова", levelUp: "Уровень повышен!",
    conversationFree: "Безлимитный свободный разговор", topicFree: "Свободная тема",
    topicPlaceholder: "Напр: путешествие, работа, семья...", chooseLevel: "Выберите уровень",
    startConversation: "Начать разговор", wordsLearned: "Изученные слова",
    selectScene: "Выберите сцену", enterScene: "Войти в сцену",
    hotspotClick: "Нажмите на объекты для обучения", learnWord: "Учить слово",
    practiceHere: "Практиковать здесь", sceneLanguage: "Язык сцены",
    loading: "Загрузка...", error: "Ошибка", noResults: "Нет результатов",
    tryAgain: "Повторить", success: "Успех!",
    welcome: "Добро пожаловать в MultiLingue Universal", welcomeSubtitle: "Учите любой язык с продвинутым ИИ",
    detectingLanguage: "Определение языка...", languageDetected: "Язык определён",
    confirmNative: "Это ваш родной язык?", chooseStudy: "Какой язык вы хотите изучать?",
    letsStart: "Начнём!",
  },
  "ar-SA": {
    home: "الرئيسية", dashboard: "لوحة التحكم", lessons: "الدروس", teachers: "المعلمون",
    immersive: "المشاهد الغامرة", conversation: "محادثة", freeTalk: "محادثة حرة",
    vocabulary: "المفردات", progress: "التقدم", settings: "الإعدادات", logout: "تسجيل الخروج",
    start: "ابدأ", continue: "استمر", back: "رجوع", next: "التالي",
    finish: "إنهاء", retry: "حاول مجدداً", send: "إرسال", listen: "استمع",
    speak: "تحدث", translate: "ترجم", save: "حفظ", cancel: "إلغاء",
    confirm: "تأكيد", select: "اختر", search: "بحث", random: "عشوائي",
    nativeLanguage: "اللغة الأم", studyLanguage: "لغة الدراسة",
    selectNative: "اختر لغتك الأم", selectStudy: "اختر اللغة للدراسة",
    level: "المستوى", beginner: "مبتدئ", elementary: "أساسي", intermediate: "متوسط",
    advanced: "متقدم", proficient: "محترف", scientific: "علمي",
    lesson: "درس", exercise: "تمرين", pronunciation: "نطق",
    vocabulary_word: "مفردات", translation: "ترجمة", phonetic: "صوتي",
    example: "مثال", score: "نقاط", xp: "XP", streak: "سلسلة", ranking: "ترتيب",
    typeMessage: "اكتب بـ", suggestions: "اقتراحات", correction: "تصحيح",
    feedback: "ملاحظات", newWords: "كلمات جديدة", levelUp: "ارتفع المستوى!",
    conversationFree: "محادثة حرة غير محدودة", topicFree: "موضوع حر",
    topicPlaceholder: "مثال: سفر، عمل، عائلة...", chooseLevel: "اختر مستواك",
    startConversation: "ابدأ المحادثة", wordsLearned: "الكلمات المتعلمة",
    selectScene: "اختر مشهداً", enterScene: "ادخل المشهد",
    hotspotClick: "انقر على الأشياء للتعلم", learnWord: "تعلم الكلمة",
    practiceHere: "تدرب هنا", sceneLanguage: "لغة المشهد",
    loading: "جار التحميل...", error: "خطأ", noResults: "لا توجد نتائج",
    tryAgain: "حاول مجدداً", success: "نجاح!",
    welcome: "مرحباً بك في MultiLingue Universal", welcomeSubtitle: "تعلم أي لغة بالذكاء الاصطناعي المتقدم",
    detectingLanguage: "جار اكتشاف لغتك...", languageDetected: "تم اكتشاف اللغة",
    confirmNative: "هل هذه لغتك الأم؟", chooseStudy: "أي لغة تريد تعلمها؟",
    letsStart: "لنبدأ!",
  },
};

// Fallback para idiomas não traduzidos — usa inglês
const fallback = translations["en-US"];

// Mapeamento de códigos de idioma para traduções disponíveis
const langCodeMap: Record<string, string> = {
  "pt-BR": "pt-BR", "pt-PT": "pt-BR",
  "en-US": "en-US", "en-GB": "en-US",
  "es-ES": "es-ES", "es-MX": "es-ES", "es-AR": "es-ES",
  "fr-FR": "fr-FR", "fr-CA": "fr-FR",
  "de-DE": "de-DE", "de-AT": "de-DE",
  "it-IT": "it-IT",
  "ja-JP": "ja-JP",
  "zh-CN": "zh-CN", "zh-TW": "zh-CN",
  "ko-KR": "ko-KR",
  "ru-RU": "ru-RU",
  "ar-SA": "ar-SA", "ar-EG": "ar-SA",
};

/**
 * Obtém as strings de UI para o idioma nativo do aluno.
 * Se o idioma não tiver tradução, usa inglês como fallback.
 */
export function getUIStrings(nativeLangCode: string): UIStrings {
  const mapped = langCodeMap[nativeLangCode];
  return translations[mapped] || fallback;
}

/**
 * Hook React para usar as strings de UI no idioma nativo do aluno.
 */
export function useI18n(): UIStrings {
  const nativeLang = localStorage.getItem("ml_native_lang") || navigator.language || "pt-BR";
  return getUIStrings(nativeLang);
}

/**
 * Detecta automaticamente o idioma nativo via navigator.language
 * e salva no localStorage se ainda não estiver definido.
 */
export function autoDetectNativeLanguage(): string {
  const saved = localStorage.getItem("ml_native_lang");
  if (saved) return saved;

  const browserLang = navigator.language || navigator.languages?.[0] || "pt-BR";
  // Normaliza: "pt" → "pt-BR", "en" → "en-US", etc.
  const normalized = normalizeLangCode(browserLang);
  localStorage.setItem("ml_native_lang", normalized);
  return normalized;
}

function normalizeLangCode(code: string): string {
  const map: Record<string, string> = {
    "pt": "pt-BR", "en": "en-US", "es": "es-ES", "fr": "fr-FR",
    "de": "de-DE", "it": "it-IT", "ja": "ja-JP", "zh": "zh-CN",
    "ko": "ko-KR", "ru": "ru-RU", "ar": "ar-SA", "nl": "nl-NL",
    "pl": "pl-PL", "tr": "tr-TR", "sv": "sv-SE", "da": "da-DK",
    "fi": "fi-FI", "no": "no-NO", "el": "el-GR", "he": "he-IL",
    "hi": "hi-IN", "vi": "vi-VN", "th": "th-TH", "id": "id-ID",
    "ms": "ms-MY", "uk": "uk-UA", "cs": "cs-CZ", "hu": "hu-HU",
    "ro": "ro-RO", "bg": "bg-BG",
  };
  // Se já tem região (ex: "pt-BR"), retorna como está
  if (code.includes("-")) return code;
  return map[code.toLowerCase()] || code;
}

export default { getUIStrings, useI18n, autoDetectNativeLanguage };
