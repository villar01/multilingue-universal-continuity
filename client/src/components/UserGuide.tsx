/**
 * UserGuide — Catálogo de Instruções de Uso
 * Exibe um guia resumido de como usar o MultiLingue Universal
 * no idioma nativo do aluno. Abre como modal/drawer.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, X, ChevronRight, Globe, Mic, Brain, Zap, Trophy, MessageSquare, Camera, Headphones, BookMarked, Star } from "lucide-react";

// ─── Translations ────────────────────────────────────────────────────────────

type GuideSection = {
  icon: string;
  title: string;
  steps: string[];
};

type GuideContent = {
  welcome: string;
  subtitle: string;
  sections: GuideSection[];
  tip: string;
};

const GUIDE_CONTENT: Record<string, GuideContent> = {
  "pt-BR": {
    welcome: "Bem-vindo ao MultiLingue Universal!",
    subtitle: "Guia rápido para começar a aprender",
    tip: "💡 Dica: Use fones de ouvido para melhor experiência de pronúncia.",
    sections: [
      {
        icon: "🌍",
        title: "1. Escolha seu idioma",
        steps: [
          "Na tela inicial, selecione seu idioma nativo (ex: Português).",
          "Escolha o idioma que deseja aprender (ex: Inglês, Espanhol, Francês…).",
          "Clique em 'Começar' para entrar na plataforma.",
        ],
      },
      {
        icon: "🏖️",
        title: "2. Cenas Imersivas",
        steps: [
          "Acesse 'Cenas Imersivas' no menu principal.",
          "Clique nos objetos da cena (praia, cidade, floresta…) para aprender vocabulário.",
          "Toque no ícone 🔊 para ouvir a pronúncia neural de alta qualidade.",
          "Adicione palavras ao caderno clicando no ícone 📓.",
        ],
      },
      {
        icon: "👨‍🏫",
        title: "3. Professor com IA",
        steps: [
          "Acesse 'Professores com IA' para conversar com seu professor virtual.",
          "Escolha um modo: Diálogo, Vocabulário com RA ou Caça ao Tesouro.",
          "Fale com o microfone 🎤 para praticar sua pronúncia.",
          "O professor corrige e dá dicas em tempo real.",
        ],
      },
      {
        icon: "📚",
        title: "4. Aulas Estruturadas",
        steps: [
          "Vá em 'Dashboard' → 'Aulas' para ver as lições disponíveis.",
          "Cada aula tem vocabulário, gramática e exercícios interativos.",
          "O professor fala as instruções — ouça e repita.",
          "Responda as perguntas para ganhar pontos XP.",
        ],
      },
      {
        icon: "🧠",
        title: "5. Memória Diária",
        steps: [
          "Acesse 'Memória Diária' para revisar palavras com flashcards.",
          "Pratique todos os dias para não esquecer o vocabulário.",
          "No ciclo Pareto, tente lembrar sem olhar, escreva a palavra e crie uma frase nova.",
          "O sistema Pareto prioriza as palavras mais usadas no idioma.",
        ],
      },
      {
        icon: "💬",
        title: "6. Conversa Livre",
        steps: [
          "Use 'Conversa Livre' para falar com a IA sem roteiro.",
          "Pratique situações do dia a dia: restaurante, viagem, trabalho…",
          "A IA corrige seus erros e sugere expressões naturais.",
        ],
      },
      {
        icon: "🏆",
        title: "7. Progresso e Conquistas",
        steps: [
          "Veja seu progresso em 'Dashboard' → 'Meu Progresso'.",
          "Ganhe medalhas e certificados ao completar módulos.",
          "Compare seu nível no Ranking global.",
        ],
      },
    ],
  },
  "en-US": {
    welcome: "Welcome to MultiLingue Universal!",
    subtitle: "Quick guide to start learning",
    tip: "💡 Tip: Use headphones for the best pronunciation experience.",
    sections: [
      { icon: "🌍", title: "1. Choose your language", steps: ["On the home screen, select your native language.", "Choose the language you want to learn.", "Click 'Start' to enter the platform."] },
      { icon: "🏖️", title: "2. Immersive Scenes", steps: ["Go to 'Immersive Scenes' in the main menu.", "Click on objects in the scene to learn vocabulary.", "Tap 🔊 to hear high-quality neural pronunciation.", "Add words to your notebook with the 📓 icon."] },
      { icon: "👨‍🏫", title: "3. AI Teacher", steps: ["Access 'AI Teachers' to chat with your virtual teacher.", "Choose a mode: Dialogue, AR Vocabulary, or Treasure Hunt.", "Use the microphone 🎤 to practice your pronunciation.", "The teacher corrects and gives tips in real time."] },
      { icon: "📚", title: "4. Structured Lessons", steps: ["Go to 'Dashboard' → 'Lessons' to see available classes.", "Each lesson has vocabulary, grammar, and interactive exercises.", "The teacher speaks instructions — listen and repeat.", "Answer questions to earn XP points."] },
      { icon: "🧠", title: "5. Daily Memory", steps: ["Access 'Daily Memory' to review words with flashcards.", "Practice every day to retain vocabulary.", "The Pareto system shows the 1,100 most-used words."] },
      { icon: "💬", title: "6. Free Talk", steps: ["Use 'Free Talk' to speak with the AI freely.", "Practice everyday situations: restaurant, travel, work…", "The AI corrects your mistakes and suggests natural expressions."] },
      { icon: "🏆", title: "7. Progress & Achievements", steps: ["See your progress in 'Dashboard' → 'My Progress'.", "Earn medals and certificates when completing modules.", "Compare your level on the global Ranking."] },
    ],
  },
  "es-ES": {
    welcome: "¡Bienvenido a MultiLingue Universal!",
    subtitle: "Guía rápida para empezar a aprender",
    tip: "💡 Consejo: Usa auriculares para la mejor experiencia de pronunciación.",
    sections: [
      { icon: "🌍", title: "1. Elige tu idioma", steps: ["En la pantalla de inicio, selecciona tu idioma nativo.", "Elige el idioma que quieres aprender.", "Haz clic en 'Empezar' para entrar a la plataforma."] },
      { icon: "🏖️", title: "2. Escenas Inmersivas", steps: ["Ve a 'Escenas Inmersivas' en el menú principal.", "Haz clic en los objetos de la escena para aprender vocabulario.", "Toca 🔊 para escuchar la pronunciación neural.", "Añade palabras al cuaderno con el ícono 📓."] },
      { icon: "👨‍🏫", title: "3. Profesor con IA", steps: ["Accede a 'Profesores con IA' para hablar con tu profesor virtual.", "Elige un modo: Diálogo, Vocabulario AR o Caza del Tesoro.", "Usa el micrófono 🎤 para practicar tu pronunciación.", "El profesor corrige y da consejos en tiempo real."] },
      { icon: "📚", title: "4. Lecciones Estructuradas", steps: ["Ve a 'Dashboard' → 'Lecciones' para ver las clases.", "Cada lección tiene vocabulario, gramática y ejercicios.", "El profesor habla las instrucciones — escucha y repite.", "Responde preguntas para ganar puntos XP."] },
      { icon: "🧠", title: "5. Memoria Diaria", steps: ["Accede a 'Memoria Diaria' para repasar con flashcards.", "Practica todos los días para retener el vocabulario.", "El sistema Pareto muestra las 1.100 palabras más usadas."] },
      { icon: "💬", title: "6. Conversación Libre", steps: ["Usa 'Conversación Libre' para hablar con la IA libremente.", "Practica situaciones cotidianas: restaurante, viaje, trabajo…", "La IA corrige tus errores y sugiere expresiones naturales."] },
      { icon: "🏆", title: "7. Progreso y Logros", steps: ["Ve tu progreso en 'Dashboard' → 'Mi Progreso'.", "Gana medallas y certificados al completar módulos.", "Compara tu nivel en el Ranking global."] },
    ],
  },
  "fr-FR": {
    welcome: "Bienvenue sur MultiLingue Universal !",
    subtitle: "Guide rapide pour commencer à apprendre",
    tip: "💡 Conseil : Utilisez des écouteurs pour la meilleure expérience de prononciation.",
    sections: [
      { icon: "🌍", title: "1. Choisissez votre langue", steps: ["Sur l'écran d'accueil, sélectionnez votre langue maternelle.", "Choisissez la langue que vous voulez apprendre.", "Cliquez sur 'Commencer' pour entrer sur la plateforme."] },
      { icon: "🏖️", title: "2. Scènes Immersives", steps: ["Allez dans 'Scènes Immersives' dans le menu principal.", "Cliquez sur les objets de la scène pour apprendre le vocabulaire.", "Appuyez sur 🔊 pour entendre la prononciation neurale.", "Ajoutez des mots au carnet avec l'icône 📓."] },
      { icon: "👨‍🏫", title: "3. Professeur IA", steps: ["Accédez à 'Professeurs IA' pour parler avec votre professeur virtuel.", "Choisissez un mode : Dialogue, Vocabulaire RA ou Chasse au Trésor.", "Utilisez le microphone 🎤 pour pratiquer votre prononciation.", "Le professeur corrige et donne des conseils en temps réel."] },
      { icon: "📚", title: "4. Leçons Structurées", steps: ["Allez dans 'Dashboard' → 'Leçons' pour voir les cours.", "Chaque leçon a du vocabulaire, de la grammaire et des exercices.", "Le professeur parle les instructions — écoutez et répétez.", "Répondez aux questions pour gagner des points XP."] },
      { icon: "🧠", title: "5. Mémoire Quotidienne", steps: ["Accédez à 'Mémoire Quotidienne' pour réviser avec des flashcards.", "Pratiquez chaque jour pour retenir le vocabulaire.", "Le système Pareto montre les 1 100 mots les plus utilisés."] },
      { icon: "💬", title: "6. Conversation Libre", steps: ["Utilisez 'Conversation Libre' pour parler librement avec l'IA.", "Pratiquez des situations quotidiennes : restaurant, voyage, travail…", "L'IA corrige vos erreurs et suggère des expressions naturelles."] },
      { icon: "🏆", title: "7. Progrès et Réussites", steps: ["Voyez vos progrès dans 'Dashboard' → 'Mon Progrès'.", "Gagnez des médailles et des certificats en complétant les modules.", "Comparez votre niveau dans le Classement mondial."] },
    ],
  },
  "de-DE": {
    welcome: "Willkommen bei MultiLingue Universal!",
    subtitle: "Schnellanleitung zum Starten",
    tip: "💡 Tipp: Verwende Kopfhörer für das beste Aussprache-Erlebnis.",
    sections: [
      { icon: "🌍", title: "1. Wähle deine Sprache", steps: ["Wähle auf dem Startbildschirm deine Muttersprache.", "Wähle die Sprache, die du lernen möchtest.", "Klicke auf 'Starten', um die Plattform zu betreten."] },
      { icon: "🏖️", title: "2. Immersive Szenen", steps: ["Gehe zu 'Immersive Szenen' im Hauptmenü.", "Klicke auf Objekte in der Szene, um Vokabular zu lernen.", "Tippe auf 🔊, um die neurale Aussprache zu hören.", "Füge Wörter mit dem 📓-Symbol zum Notizbuch hinzu."] },
      { icon: "👨‍🏫", title: "3. KI-Lehrer", steps: ["Gehe zu 'KI-Lehrer', um mit deinem virtuellen Lehrer zu sprechen.", "Wähle einen Modus: Dialog, AR-Vokabular oder Schatzsuche.", "Benutze das Mikrofon 🎤, um deine Aussprache zu üben.", "Der Lehrer korrigiert und gibt Tipps in Echtzeit."] },
      { icon: "📚", title: "4. Strukturierte Lektionen", steps: ["Gehe zu 'Dashboard' → 'Lektionen' für verfügbare Kurse.", "Jede Lektion hat Vokabular, Grammatik und Übungen.", "Der Lehrer spricht die Anweisungen — höre zu und wiederhole.", "Beantworte Fragen, um XP-Punkte zu verdienen."] },
      { icon: "🧠", title: "5. Tägliches Gedächtnis", steps: ["Gehe zu 'Tägliches Gedächtnis' für Flashcard-Übungen.", "Übe jeden Tag, um Vokabular zu behalten.", "Das Pareto-System zeigt die 1.100 meistgenutzten Wörter."] },
      { icon: "💬", title: "6. Freies Gespräch", steps: ["Nutze 'Freies Gespräch', um frei mit der KI zu sprechen.", "Übe Alltagssituationen: Restaurant, Reise, Arbeit…", "Die KI korrigiert Fehler und schlägt natürliche Ausdrücke vor."] },
      { icon: "🏆", title: "7. Fortschritt & Erfolge", steps: ["Sieh deinen Fortschritt in 'Dashboard' → 'Mein Fortschritt'.", "Verdiene Medaillen und Zertifikate beim Abschließen von Modulen.", "Vergleiche dein Level im globalen Ranking."] },
    ],
  },
  "it-IT": {
    welcome: "Benvenuto su MultiLingue Universal!",
    subtitle: "Guida rapida per iniziare ad imparare",
    tip: "💡 Suggerimento: Usa le cuffie per la migliore esperienza di pronuncia.",
    sections: [
      { icon: "🌍", title: "1. Scegli la tua lingua", steps: ["Nella schermata iniziale, seleziona la tua lingua madre.", "Scegli la lingua che vuoi imparare.", "Clicca su 'Inizia' per entrare nella piattaforma."] },
      { icon: "🏖️", title: "2. Scene Immersive", steps: ["Vai a 'Scene Immersive' nel menu principale.", "Clicca sugli oggetti della scena per imparare il vocabolario.", "Tocca 🔊 per sentire la pronuncia neurale.", "Aggiungi parole al quaderno con l'icona 📓."] },
      { icon: "👨‍🏫", title: "3. Insegnante IA", steps: ["Accedi a 'Insegnanti IA' per parlare con il tuo insegnante virtuale.", "Scegli una modalità: Dialogo, Vocabolario AR o Caccia al Tesoro.", "Usa il microfono 🎤 per praticare la pronuncia.", "L'insegnante corregge e dà consigli in tempo reale."] },
      { icon: "📚", title: "4. Lezioni Strutturate", steps: ["Vai a 'Dashboard' → 'Lezioni' per le lezioni disponibili.", "Ogni lezione ha vocabolario, grammatica ed esercizi.", "L'insegnante parla le istruzioni — ascolta e ripeti.", "Rispondi alle domande per guadagnare punti XP."] },
      { icon: "🧠", title: "5. Memoria Giornaliera", steps: ["Accedi a 'Memoria Giornaliera' per ripassare con flashcard.", "Pratica ogni giorno per mantenere il vocabolario.", "Il sistema Pareto mostra le 1.100 parole più usate."] },
      { icon: "💬", title: "6. Conversazione Libera", steps: ["Usa 'Conversazione Libera' per parlare liberamente con l'IA.", "Pratica situazioni quotidiane: ristorante, viaggio, lavoro…", "L'IA corregge gli errori e suggerisce espressioni naturali."] },
      { icon: "🏆", title: "7. Progressi e Risultati", steps: ["Vedi i tuoi progressi in 'Dashboard' → 'Il Mio Progresso'.", "Guadagna medaglie e certificati completando i moduli.", "Confronta il tuo livello nel Ranking globale."] },
    ],
  },
  "ja-JP": {
    welcome: "MultiLingue Universalへようこそ！",
    subtitle: "学習を始めるためのクイックガイド",
    tip: "💡 ヒント：発音練習にはヘッドフォンをご使用ください。",
    sections: [
      { icon: "🌍", title: "1. 言語を選ぶ", steps: ["ホーム画面で母国語を選択してください。", "学びたい言語を選んでください。", "「スタート」をクリックしてプラットフォームに入ります。"] },
      { icon: "🏖️", title: "2. 没入型シーン", steps: ["メインメニューの「没入型シーン」へ移動。", "シーン内のオブジェクトをクリックして語彙を学びます。", "🔊をタップして高品質な発音を聞きましょう。", "📓アイコンでノートに単語を追加できます。"] },
      { icon: "👨‍🏫", title: "3. AIティーチャー", steps: ["「AIティーチャー」でバーチャル先生と会話。", "モードを選択：ダイアログ、AR語彙、宝探し。", "マイク🎤で発音を練習しましょう。", "先生がリアルタイムで修正とアドバイスをします。"] },
      { icon: "📚", title: "4. 構造化レッスン", steps: ["「ダッシュボード」→「レッスン」で授業を確認。", "各レッスンに語彙・文法・演習があります。", "先生の指示を聞いて繰り返しましょう。", "質問に答えてXPポイントを獲得。"] },
      { icon: "🧠", title: "5. デイリーメモリー", steps: ["「デイリーメモリー」でフラッシュカード復習。", "毎日練習して語彙を定着させましょう。", "パレートシステムで最頻出1,100語を学習。"] },
      { icon: "💬", title: "6. フリートーク", steps: ["「フリートーク」でAIと自由に会話。", "日常の場面を練習：レストラン、旅行、仕事…", "AIが間違いを修正し自然な表現を提案します。"] },
      { icon: "🏆", title: "7. 進捗と実績", steps: ["「ダッシュボード」→「マイ進捗」で確認。", "モジュール完了でメダルと証明書を獲得。", "グローバルランキングでレベルを比較。"] },
    ],
  },
  "zh-CN": {
    welcome: "欢迎使用 MultiLingue Universal！",
    subtitle: "快速入门学习指南",
    tip: "💡 提示：使用耳机获得最佳发音体验。",
    sections: [
            { icon: "🌍", title: "1. 选择语言", steps: ["在主屏幕上选择您的母语。", "选择您想学习的语言。", "点击'开始'进入平台。"] },
            { icon: "🏖️", title: "2. 沉浸式场景", steps: ["在主菜单中进入'沉浸式场景'。", "点击场景中的物体学习词汇。", "点击🔊收听高质量神经语音发音。", "用📓图标将单词添加到笔记本。"] },
            { icon: "👨‍🏫", title: "3. AI 教师", steps: ["进入'AI教师'与虚拟老师对话。", "选择模式：对话、AR词汇或寻宝游戏。", "使用麦克风🎤练习发音。", "老师实时纠正并给出建议。"] },
            { icon: "📚", title: "4. 结构化课程", steps: ["进入'仪表板'→'课程'查看可用课程。", "每节课包含词汇、语法和互动练习。", "听老师的指示并跟读。", "回答问题赚取XP积分。"] },
            { icon: "🧠", title: "5. 每日记忆", steps: ["进入'每日记忆'用闪卡复习单词。", "每天练习以巩固词汇。", "帕累托系统显示最常用的1,100个单词。"] },
            { icon: "💬", title: "6. 自由对话", steps: ["使用'自由对话'与AI自由交流。", "练习日常场景：餐厅、旅行、工作…", "AI纠正错误并建议自然表达。"] },
            { icon: "🏆", title: "7. 进度与成就", steps: ["在'仪表板'→'我的进度'查看进度。", "完成模块获得奖章和证书。", "在全球排名中比较您的水平。"] },
    ],
  },
  "ko-KR": {
    welcome: "MultiLingue Universal에 오신 것을 환영합니다!",
    subtitle: "학습 시작을 위한 빠른 가이드",
    tip: "💡 팁: 발음 연습에는 헤드폰을 사용하세요.",
    sections: [
      { icon: "🌍", title: "1. 언어 선택", steps: ["홈 화면에서 모국어를 선택하세요.", "배우고 싶은 언어를 선택하세요.", "'시작'을 클릭하여 플랫폼에 입장하세요."] },
      { icon: "🏖️", title: "2. 몰입형 장면", steps: ["메인 메뉴에서 '몰입형 장면'으로 이동하세요.", "장면의 물체를 클릭하여 어휘를 배우세요.", "🔊를 탭하여 고품질 발음을 들으세요.", "📓 아이콘으로 단어를 노트에 추가하세요."] },
      { icon: "👨‍🏫", title: "3. AI 선생님", steps: ["'AI 선생님'에서 가상 선생님과 대화하세요.", "모드 선택: 대화, AR 어휘 또는 보물찾기.", "마이크 🎤로 발음을 연습하세요.", "선생님이 실시간으로 수정하고 조언합니다."] },
      { icon: "📚", title: "4. 구조화된 수업", steps: ["'대시보드' → '수업'에서 수업을 확인하세요.", "각 수업에는 어휘, 문법, 연습이 있습니다.", "선생님의 지시를 듣고 따라 하세요.", "질문에 답하여 XP 포인트를 획득하세요."] },
      { icon: "🧠", title: "5. 일일 메모리", steps: ["'일일 메모리'에서 플래시카드로 복습하세요.", "매일 연습하여 어휘를 유지하세요.", "파레토 시스템으로 가장 많이 사용되는 1,100개 단어를 학습하세요."] },
      { icon: "💬", title: "6. 자유 대화", steps: ["'자유 대화'에서 AI와 자유롭게 대화하세요.", "일상 상황 연습: 식당, 여행, 직장…", "AI가 실수를 수정하고 자연스러운 표현을 제안합니다."] },
      { icon: "🏆", title: "7. 진행 상황 및 성취", steps: ["'대시보드' → '내 진행 상황'에서 확인하세요.", "모듈 완료 시 메달과 인증서를 획득하세요.", "글로벌 랭킹에서 레벨을 비교하세요."] },
    ],
  },
  "ru-RU": {
    welcome: "Добро пожаловать в MultiLingue Universal!",
    subtitle: "Краткое руководство по началу обучения",
    tip: "💡 Совет: Используйте наушники для лучшего опыта произношения.",
    sections: [
      { icon: "🌍", title: "1. Выберите язык", steps: ["На главном экране выберите родной язык.", "Выберите язык, который хотите изучать.", "Нажмите 'Начать', чтобы войти на платформу."] },
      { icon: "🏖️", title: "2. Иммерсивные сцены", steps: ["Перейдите в 'Иммерсивные сцены' в главном меню.", "Нажимайте на объекты сцены для изучения словаря.", "Нажмите 🔊, чтобы услышать нейронное произношение.", "Добавляйте слова в тетрадь с иконкой 📓."] },
      { icon: "👨‍🏫", title: "3. Учитель ИИ", steps: ["Перейдите в 'Учителя ИИ' для разговора с виртуальным учителем.", "Выберите режим: Диалог, Словарь AR или Охота за сокровищами.", "Используйте микрофон 🎤 для практики произношения.", "Учитель исправляет и даёт советы в реальном времени."] },
      { icon: "📚", title: "4. Структурированные уроки", steps: ["Перейдите в 'Панель управления' → 'Уроки'.", "Каждый урок содержит словарь, грамматику и упражнения.", "Слушайте инструкции учителя и повторяйте.", "Отвечайте на вопросы для получения очков XP."] },
      { icon: "🧠", title: "5. Ежедневная память", steps: ["Перейдите в 'Ежедневная память' для повторения с флэш-картами.", "Практикуйтесь каждый день для запоминания словаря.", "Система Парето показывает 1 100 наиболее используемых слов."] },
      { icon: "💬", title: "6. Свободный разговор", steps: ["Используйте 'Свободный разговор' для общения с ИИ.", "Практикуйте повседневные ситуации: ресторан, путешествие, работа…", "ИИ исправляет ошибки и предлагает естественные выражения."] },
      { icon: "🏆", title: "7. Прогресс и достижения", steps: ["Смотрите прогресс в 'Панель управления' → 'Мой прогресс'.", "Получайте медали и сертификаты за завершение модулей.", "Сравнивайте уровень в глобальном рейтинге."] },
    ],
  },
  "ar-SA": {
    welcome: "مرحباً بك في MultiLingue Universal!",
    subtitle: "دليل سريع للبدء في التعلم",
    tip: "💡 نصيحة: استخدم سماعات الأذن للحصول على أفضل تجربة نطق.",
    sections: [
      { icon: "🌍", title: "١. اختر لغتك", steps: ["في الشاشة الرئيسية، اختر لغتك الأم.", "اختر اللغة التي تريد تعلمها.", "انقر على 'ابدأ' للدخول إلى المنصة."] },
      { icon: "🏖️", title: "٢. المشاهد الغامرة", steps: ["اذهب إلى 'المشاهد الغامرة' في القائمة الرئيسية.", "انقر على الأشياء في المشهد لتعلم المفردات.", "اضغط على 🔊 لسماع النطق العصبي عالي الجودة.", "أضف الكلمات إلى الدفتر بأيقونة 📓."] },
      { icon: "👨‍🏫", title: "٣. المعلم بالذكاء الاصطناعي", steps: ["ادخل إلى 'معلمو الذكاء الاصطناعي' للتحدث مع معلمك الافتراضي.", "اختر وضعاً: حوار، مفردات AR، أو صيد الكنز.", "استخدم الميكروفون 🎤 لتدريب نطقك.", "يقوم المعلم بالتصحيح وتقديم النصائح في الوقت الفعلي."] },
      { icon: "📚", title: "٤. الدروس المنظمة", steps: ["اذهب إلى 'لوحة التحكم' → 'الدروس' لرؤية الدروس المتاحة.", "كل درس يحتوي على مفردات وقواعد وتمارين.", "استمع إلى تعليمات المعلم وكررها.", "أجب على الأسئلة لكسب نقاط XP."] },
      { icon: "🧠", title: "٥. الذاكرة اليومية", steps: ["ادخل إلى 'الذاكرة اليومية' للمراجعة بالبطاقات التعليمية.", "تدرب كل يوم للحفاظ على المفردات.", "نظام باريتو يعرض أكثر 1,100 كلمة استخداماً."] },
      { icon: "💬", title: "٦. المحادثة الحرة", steps: ["استخدم 'المحادثة الحرة' للتحدث بحرية مع الذكاء الاصطناعي.", "تدرب على مواقف يومية: مطعم، سفر، عمل…", "يقوم الذكاء الاصطناعي بتصحيح الأخطاء واقتراح تعبيرات طبيعية."] },
      { icon: "🏆", title: "٧. التقدم والإنجازات", steps: ["شاهد تقدمك في 'لوحة التحكم' → 'تقدمي'.", "اكسب الميداليات والشهادات عند إكمال الوحدات.", "قارن مستواك في التصنيف العالمي."] },
    ],
  },
  "hi-IN": {
    welcome: "MultiLingue Universal में आपका स्वागत है!",
    subtitle: "सीखना शुरू करने के लिए त्वरित मार्गदर्शिका",
    tip: "💡 सुझाव: सर्वोत्तम उच्चारण अनुभव के लिए हेडफ़ोन का उपयोग करें।",
    sections: [
      { icon: "🌍", title: "1. अपनी भाषा चुनें", steps: ["होम स्क्रीन पर अपनी मातृभाषा चुनें।", "वह भाषा चुनें जो आप सीखना चाहते हैं।", "प्लेटफ़ॉर्म में प्रवेश करने के लिए 'शुरू करें' पर क्लिक करें।"] },
      { icon: "🏖️", title: "2. इमर्सिव दृश्य", steps: ["मुख्य मेनू में 'इमर्सिव दृश्य' पर जाएं।", "शब्दावली सीखने के लिए दृश्य में वस्तुओं पर क्लिक करें।", "उच्च गुणवत्ता वाला उच्चारण सुनने के लिए 🔊 टैप करें।", "📓 आइकन से शब्दों को नोटबुक में जोड़ें।"] },
      { icon: "👨‍🏫", title: "3. AI शिक्षक", steps: ["अपने वर्चुअल शिक्षक से बात करने के लिए 'AI शिक्षक' पर जाएं।", "मोड चुनें: संवाद, AR शब्दावली, या खजाना खोज।", "उच्चारण अभ्यास के लिए माइक्रोफ़ोन 🎤 का उपयोग करें।", "शिक्षक वास्तविक समय में सुधार और सुझाव देते हैं।"] },
      { icon: "📚", title: "4. संरचित पाठ", steps: ["उपलब्ध कक्षाओं के लिए 'डैशबोर्ड' → 'पाठ' पर जाएं।", "प्रत्येक पाठ में शब्दावली, व्याकरण और अभ्यास हैं।", "शिक्षक के निर्देश सुनें और दोहराएं।", "XP अंक अर्जित करने के लिए प्रश्नों का उत्तर दें।"] },
      { icon: "🧠", title: "5. दैनिक स्मृति", steps: ["फ्लैशकार्ड से समीक्षा के लिए 'दैनिक स्मृति' पर जाएं।", "शब्दावली बनाए रखने के लिए हर दिन अभ्यास करें।", "पारेटो प्रणाली सबसे अधिक उपयोग किए जाने वाले 1,100 शब्द दिखाती है।"] },
      { icon: "💬", title: "6. मुक्त वार्तालाप", steps: ["AI के साथ स्वतंत्र रूप से बात करने के लिए 'मुक्त वार्तालाप' का उपयोग करें।", "दैनिक स्थितियों का अभ्यास करें: रेस्तरां, यात्रा, काम…", "AI गलतियों को सुधारता है और प्राकृतिक अभिव्यक्तियां सुझाता है।"] },
      { icon: "🏆", title: "7. प्रगति और उपलब्धियां", steps: ["'डैशबोर्ड' → 'मेरी प्रगति' में अपनी प्रगति देखें।", "मॉड्यूल पूरा करने पर पदक और प्रमाण पत्र अर्जित करें।", "वैश्विक रैंकिंग में अपना स्तर तुलना करें।"] },
    ],
  },
};

const SAFETY_GUIDE_SECTIONS: Record<"pt" | "en", GuideSection> = {
  pt: {
    icon: "🛡️",
    title: "8. Segurança e controle parental",
    steps: [
      "Alunos: usem apenas o seu perfil e avisem um responsável se aparecer algo desconfortável ou inadequado.",
      "Microfone: o aplicativo pede permissão antes de gravar; permita somente quando quiser praticar fala e desligue a gravação ao terminar.",
      "Responsáveis: acessem 'Controle Parental' para definir PIN, tempo de uso, níveis, alertas e histórico supervisionável.",
      "Conteúdo inadequado para a idade gera alerta visual e sonoro quando ativado. Conteúdo ilegal ou de alto risco continua bloqueado; somente tema legal e etariamente inadequado pode receber decisão temporária com PIN.",
      "As ferramentas apoiam a proteção, mas o acompanhamento e a orientação do menor continuam sendo responsabilidade do pai, mãe ou responsável legal.",
    ],
  },
  en: {
    icon: "🛡️",
    title: "8. Safety and parental controls",
    steps: [
      "Learners: use only your own profile and tell a responsible adult if anything feels uncomfortable or inappropriate.",
      "Microphone: the app asks before recording. Allow it only when you want speaking practice and stop recording when finished.",
      "Responsible adults: open 'Parental Control' to set a PIN, time limits, levels, alerts, and supervised history.",
      "Age-inappropriate content triggers a visual and optional audible alert. Illegal or high-risk content remains blocked; only legal age-inappropriate topics can receive a temporary PIN-confirmed decision.",
      "These tools support safety but never replace the ongoing care and guidance of a parent or legal guardian.",
    ],
  },
};

// Fallback to English if language not found
function getGuideContent(langCode: string): GuideContent {
  let content: GuideContent | undefined = GUIDE_CONTENT[langCode];
  const base = langCode.split("-")[0];
  if (!content) {
    const match = Object.keys(GUIDE_CONTENT).find(k => k.startsWith(base));
    content = match ? GUIDE_CONTENT[match] : GUIDE_CONTENT["en-US"];
  }
  const safety = base === "pt" ? SAFETY_GUIDE_SECTIONS.pt : SAFETY_GUIDE_SECTIONS.en;
  return { ...content, sections: [...content.sections, safety] };
}

// ─── Label for the button in each native language ────────────────────────────
const GUIDE_BUTTON_LABEL: Record<string, string> = {
  "pt-BR": "📖 Instruções de Uso",
  "pt-PT": "📖 Instruções de Uso",
  "en-US": "📖 How to Use",
  "en-GB": "📖 How to Use",
  "es-ES": "📖 Instrucciones de Uso",
  "es-MX": "📖 Instrucciones de Uso",
  "fr-FR": "📖 Guide d'Utilisation",
  "de-DE": "📖 Bedienungsanleitung",
  "it-IT": "📖 Istruzioni d'Uso",
  "ja-JP": "📖 使い方ガイド",
  "zh-CN": "📖 使用说明",
  "ko-KR": "📖 사용 가이드",
  "ru-RU": "📖 Руководство",
  "ar-SA": "📖 دليل الاستخدام",
  "hi-IN": "📖 उपयोग मार्गदर्शिका",
  "nl-NL": "📖 Gebruikshandleiding",
  "pl-PL": "📖 Instrukcja Obsługi",
  "tr-TR": "📖 Kullanım Kılavuzu",
  "sv-SE": "📖 Användarguide",
  "id-ID": "📖 Panduan Penggunaan",
};

function getButtonLabel(langCode: string): string {
  if (GUIDE_BUTTON_LABEL[langCode]) return GUIDE_BUTTON_LABEL[langCode];
  const base = langCode.split("-")[0];
  const match = Object.keys(GUIDE_BUTTON_LABEL).find(k => k.startsWith(base));
  return match ? GUIDE_BUTTON_LABEL[match] : "📖 How to Use";
}

// ─── Main component ───────────────────────────────────────────────────────────

interface UserGuideProps {
  nativeLang?: string;
  /** If true, renders as a compact nav button (no full button) */
  compact?: boolean;
  /** Custom trigger className */
  triggerClassName?: string;
}

export default function UserGuide({ nativeLang = "pt-BR", compact = false, triggerClassName }: UserGuideProps) {
  const [open, setOpen] = useState(false);
  const guide = getGuideContent(nativeLang);
  const buttonLabel = getButtonLabel(nativeLang);
  const isRTL = nativeLang.startsWith("ar");

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName || (compact
          ? "text-gray-700 hover:text-purple-700 font-medium transition-colors py-2 flex items-center gap-1"
          : "flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all border border-purple-200 hover:border-purple-400"
        )}
        title={buttonLabel}
      >
        <BookOpen className="h-4 w-4 flex-shrink-0" />
        <span>{compact ? buttonLabel : buttonLabel.replace(/^📖\s*/, "")}</span>
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-700 to-blue-600 px-6 py-5 rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {guide.welcome}
              </DialogTitle>
              <p className="text-purple-100 text-sm mt-1">{guide.subtitle}</p>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Tip box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
              {guide.tip}
            </div>

            {/* Sections */}
            {guide.sections.map((section, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  {section.title}
                </h3>
                <ol className="space-y-2">
                  {section.steps.map((step, si) => (
                    <li key={si} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center mt-0.5">
                        {si + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {/* Footer */}
            <div className="text-center py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                MultiLingue Universal · {nativeLang.startsWith("pt") ? "Plataforma de Ensino com IA Avançada" : "Advanced AI Language Learning Platform"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
