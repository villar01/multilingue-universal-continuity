import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean, json, date } from "drizzle-orm/mysql-core";

/**
 * MULTILINGUE UNIVERSAL - DATABASE SCHEMA
 * Sistema de ensino de idiomas com IA avançada, voz natural e análise comportamental
 * Suporte a 50+ idiomas do mundo
 */

// ============================================================
// USERS & AUTHENTICATION
// ============================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // User preferences
  nativeLanguage: varchar("nativeLanguage", { length: 10 }), // ISO 639-1 code
  targetLanguageId: int("target_language_id"), // Idioma que o usuário quer aprender
  learningGoal: text("learningGoal"),
  dailyGoalMinutes: int("dailyGoalMinutes").default(10),
  // Gamification
  streakDays: int("streak_days").default(0),
  lastLessonDate: date("last_lesson_date"),
  totalXp: int("total_xp").default(0),
  currentLevel: int("current_level").default(1),
  hearts: int("hearts").default(5),
  maxHearts: int("max_hearts").default(5),
  heartsRefillAt: timestamp("hearts_refill_at"),
  dailyMinutesToday: int("daily_minutes_today").default(0),
  dailyGoalDate: date("daily_goal_date"),
  longestStreak: int("longest_streak").default(0),
  
  // Avatar preference
  selectedAvatar: varchar("selectedAvatar", { length: 50 }).default("teacher1"),
  preferredTeacherId: int("preferred_teacher_id"),
  // Subscription
  subscriptionType: mysqlEnum("subscriptionType", ["free", "monthly", "annual", "lifetime"]).default("free"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "premium", "vip"]).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// EDUCATIONAL CLIPS (Reels/TikTok-style)
// ============================================================

export const educationalClips = mysqlTable("educational_clips", {
  id: int("id").autoincrement().primaryKey(),
  languageId: int("languageId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 512 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  instructorName: varchar("instructorName", { length: 120 }),
  instructorPhotoUrl: varchar("instructorPhotoUrl", { length: 512 }),
  duration: int("duration"), // seconds
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull(),
  category: varchar("category", { length: 100 }), // grammar, vocabulary, pronunciation, culture
  tags: json("tags").$type<string[]>(),
  vocabularyData: json("vocabularyData").$type<Array<{
    word: string;
    translation: string;
    examples?: string[];
  }>>(),
  subtitlesData: json("subtitlesData").$type<Array<{
    startTime: number;
    endTime: number;
    targetText: string;
    nativeText: string;
  }>>(),
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EducationalClip = typeof educationalClips.$inferSelect;
export type InsertEducationalClip = typeof educationalClips.$inferInsert;

export const clipInteractions = mysqlTable("clip_interactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clipId: int("clipId").notNull(),
  interactionType: mysqlEnum("interactionType", ["view", "like", "save", "share"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const avatarVideos = mysqlTable("avatar_videos", {
  id: int("id").autoincrement().primaryKey(),
  clipId: int("clipId").notNull(),
  avatarUrl: varchar("avatarUrl", { length: 512 }).notNull(),
  lipSyncDataUrl: varchar("lipSyncDataUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const lipSyncData = mysqlTable("lip_sync_data", {
  id: int("id").autoincrement().primaryKey(),
  avatarVideoId: int("avatarVideoId").notNull(),
  timestamp: int("timestamp").notNull(), // milliseconds
  viseme: varchar("viseme", { length: 10 }).notNull(), // phoneme mouth shape
  intensity: int("intensity").default(100), // 0-100
});

export const teacherProfiles = mysqlTable("teacher_profiles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  language: varchar("language", { length: 10 }).notNull(),
  specialty: varchar("specialty", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// CONVERSATION SCENARIOS (Roleplay)
// ============================================================

export const conversationScenarios = mysqlTable("conversation_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  cefrLevel: varchar("cefrLevel", { length: 5 }).notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  setting: varchar("setting", { length: 255 }),
  context: text("context"),
  objectives: json("objectives").$type<string[]>(),
  vocabularyDensity: int("vocabularyDensity"),
  grammarComplexity: int("grammarComplexity"),
  culturalContext: text("culturalContext"),
  estimatedDuration: int("estimatedDuration"),
  dialogueCount: int("dialogueCount"),
  branchingPaths: int("branchingPaths"),
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  completionRate: int("completionRate").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversationScenario = typeof conversationScenarios.$inferSelect;
export type InsertConversationScenario = typeof conversationScenarios.$inferInsert;

export const dialogueNodes = mysqlTable("dialogue_nodes", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  nodeIndex: int("nodeIndex").notNull(),
  npcRole: varchar("npcRole", { length: 100 }).notNull(),
  npcDialogue: text("npcDialogue").notNull(),
  npcAudioUrl: varchar("npcAudioUrl", { length: 500 }),
  npcVoiceId: varchar("npcVoiceId", { length: 100 }),
  npcAccent: varchar("npcAccent", { length: 50 }),
  contextHint: text("contextHint"),
  suggestedResponses: json("suggestedResponses"),
  parentNodeId: int("parentNodeId"),
  childNodeIds: json("childNodeIds"),
  commonMistakes: json("commonMistakes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DialogueNode = typeof dialogueNodes.$inferSelect;
export type InsertDialogueNode = typeof dialogueNodes.$inferInsert;

export const conversationResponses = mysqlTable("conversation_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scenarioId: int("scenarioId").notNull(),
  nodeId: int("nodeId").notNull(),
  userText: text("userText").notNull(),
  audioUrl: varchar("audioUrl", { length: 500 }),
  transcribedText: text("transcribedText"),
  grammarScore: int("grammarScore"),
  pronunciationScore: int("pronunciationScore"),
  vocabularyScore: int("vocabularyScore"),
  fluencyScore: int("fluencyScore"),
  overallScore: int("overallScore"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationResponse = typeof conversationResponses.$inferSelect;
export type InsertConversationResponse = typeof conversationResponses.$inferInsert;

// ============================================================
// OFFLINE AI SYSTEM (Ollama + LM Studio)
// ============================================================

// AI Sessions - track conversation contexts
export const aiSessions = mysqlTable("ai_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  context: json("context").$type<Array<{ role: string; content: string }>>().notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  modelUsed: varchar("modelUsed", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// AI Response Cache - multinível (memória + disco)
export const aiCache = mysqlTable("ai_cache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cacheKey", { length: 255 }).notNull().unique(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  language: varchar("language", { length: 10 }),
  modelUsed: varchar("modelUsed", { length: 100 }),
  tokensUsed: int("tokensUsed"),
  hitCount: int("hitCount").default(0).notNull(),
  lastAccessed: timestamp("lastAccessed").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Translation Cache - cache de traduções multilíngue
export const translationCache = mysqlTable("translation_cache", {
  id: int("id").autoincrement().primaryKey(),
  sourceText: text("sourceText").notNull(),
  sourceLang: varchar("sourceLang", { length: 10 }).notNull(),
  targetLang: varchar("targetLang", { length: 10 }).notNull(),
  translatedText: text("translatedText").notNull(),
  cacheKey: varchar("cacheKey", { length: 255 }).notNull().unique(),
  hitCount: int("hitCount").default(0).notNull(),
  lastAccessed: timestamp("lastAccessed").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Metrics & Analytics - rastreamento de performance e economia
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricType: mysqlEnum("metricType", [
    "ai_request",
    "cache_hit",
    "cache_miss",
    "translation",
    "avatar_render",
    "optimization"
  ]).notNull(),
  provider: varchar("provider", { length: 50 }), // ollama, lmstudio, manus
  tokensUsed: int("tokensUsed").default(0),
  tokensSaved: int("tokensSaved").default(0),
  responseTime: float("responseTime"), // milliseconds
  cacheHit: boolean("cacheHit").default(false),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiSession = typeof aiSessions.$inferSelect;
export type AiCache = typeof aiCache.$inferSelect;
export type TranslationCache = typeof translationCache.$inferSelect;
export type Metric = typeof metrics.$inferSelect;

// ============================================================
// LANGUAGES (50+ idiomas do mundo)
// ============================================================

export const languages = mysqlTable("languages", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // ISO 639-1 (ex: 'en', 'es', 'pt')
  name: varchar("name", { length: 100 }).notNull(), // Nome em inglês
  nativeName: varchar("nativeName", { length: 100 }).notNull(), // Nome nativo (ex: 'Español', '中文')
  flag: varchar("flag", { length: 10 }), // Emoji da bandeira
  isActive: boolean("isActive").default(true),
  
  // ElevenLabs voice configuration
  elevenLabsVoiceId: varchar("elevenLabsVoiceId", { length: 100 }),
  elevenLabsVoiceName: varchar("elevenLabsVoiceName", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;

// ============================================================
// VIRTUAL TEACHERS (Professores específicos por idioma)
// ============================================================

export const virtualTeachers = mysqlTable("virtual_teachers", {
  id: int("id").autoincrement().primaryKey(),
  languageId: int("language_id").notNull().references(() => languages.id),
  
  // Informações do professor
  name: varchar("name", { length: 100 }).notNull(), // Nome culturalmente apropriado
  title: varchar("title", { length: 100 }).notNull(), // Ex: "Professor", "Profesora", "先生"
  gender: mysqlEnum("gender", ["male", "female", "neutral"]).notNull(),
  
  // Aparência visual
  avatarStyle: varchar("avatar_style", { length: 50 }).notNull(), // "professional", "friendly", "academic"
  skinTone: varchar("skin_tone", { length: 20 }).notNull(),
  hairColor: varchar("hair_color", { length: 20 }).notNull(),
  hairStyle: varchar("hair_style", { length: 50 }).notNull(),
  photoUrl: text("photo_url"), // CDN URL for photorealistic avatar image
  
  // Personalidade e estilo de ensino
  personality: text("personality").notNull(), // Descrição da personalidade
  teachingStyle: text("teaching_style").notNull(), // Estilo de ensino
  specialties: json("specialties").$type<string[]>(), // Especialidades
  
  // Configuração de voz
  voiceGender: mysqlEnum("voice_gender", ["MALE", "FEMALE", "NEUTRAL"]).notNull(),
  voiceLanguageCode: varchar("voice_language_code", { length: 10 }).notNull(),
  voiceId: varchar("voice_id", { length: 100 }), // TTS voice ID (e.g., "pt-BR-Wavenet-B")
  
  // Frases características
  greetings: json("greetings").$type<string[]>(), // Saudações típicas
  encouragements: json("encouragements").$type<string[]>(), // Frases de encorajamento
  corrections: json("corrections").$type<string[]>(), // Frases de correção
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VirtualTeacher = typeof virtualTeachers.$inferSelect;
export type InsertVirtualTeacher = typeof virtualTeachers.$inferInsert;

// ============================================================
// COURSES
// ============================================================

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  languageId: int("language_id").notNull().references(() => languages.id),
  
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced", "native", "slang"]).notNull(),
  
  // Course metadata
  estimatedHours: int("estimatedHours"),
  lessonCount: int("lessonCount").default(0),
  isPublished: boolean("isPublished").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ============================================================
// LESSONS
// ============================================================

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").notNull(),
  
  // Lesson content
  content: text("content"), // Markdown content
  vocabulary: json("vocabulary").$type<string[]>(), // Array de palavras-chave
  grammar: json("grammar").$type<string[]>(), // Pontos gramaticais
  
  // NEW: Complete lesson structure
  illustrationUrl: text("illustrationUrl"), // URL da ilustração da lição
  storyText: text("storyText"), // História narrativa completa
  vocabularyDetailed: json("vocabularyDetailed").$type<Array<{
    word: string;
    translation: string;
    synonyms: string[];
    slang?: string;
    phonetic: string;
    example: string;
  }>>(),
  grammarDetailed: json("grammarDetailed").$type<Array<{
    topic: string;
    explanation: string;
    examples: string[];
    exercises: string[];
  }>>(),
  phonetics: json("phonetics").$type<Array<{
    sound: string;
    ipa: string;
    examples: string[];
    tips: string;
  }>>(),
  conversationPrompts: json("conversationPrompts").$type<string[]>(), // Prompts para IA conversacional
  
  // Lesson metadata
  estimatedMinutes: int("estimatedMinutes").default(10),
  difficultyScore: float("difficultyScore").default(0.5), // 0.0 - 1.0
  
  // MULTIGERACIONAL: 3 níveis de aprendizado
  ageLevel: mysqlEnum("ageLevel", ["infantil", "adolescente", "adulto"]).default("adulto").notNull(),

  // Nível do curso (selecionável pelo usuário no menu principal)
  courseLevel: mysqlEnum("courseLevel", ["basico", "intermediario", "avancado", "negocios_tecnologia"]).default("basico"),

  // Audio
  audioUrl: text("audioUrl"),
  languageCode: varchar("languageCode", { length: 10 }), // ISO 639-1
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ============================================================
// EXERCISES
// ============================================================

export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  
  type: mysqlEnum("type", [
    "multiple_choice",
    "fill_blank",
    "translation",
    "listening",
    "speaking",
    "conversation",
    "writing"
  ]).notNull(),
  
  question: text("question").notNull(),
  correctAnswer: text("correctAnswer").notNull(),
  options: json("options").$type<string[]>(), // Para multiple choice
  
  // Exercise metadata
  orderIndex: int("orderIndex").notNull(),
  difficultyScore: float("difficultyScore").default(0.5),
  points: int("points").default(10),
  
  // Audio (para listening exercises)
  audioUrl: text("audioUrl"),
  audioText: text("audioText"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

// ============================================================
// USER PROGRESS
// ============================================================

export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  
  // Progress tracking
  currentLessonId: int("currentLessonId"),
  completedLessons: int("completedLessons").default(0),
  totalLessons: int("totalLessons").default(0),
  progressPercentage: float("progressPercentage").default(0),
  
  // Points and streak
  totalPoints: int("totalPoints").default(0),
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  lastStudyDate: timestamp("lastStudyDate"),
  
  // Time tracking
  totalStudyMinutes: int("totalStudyMinutes").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// ============================================================
// COMPLETED LESSONS (Lições completadas individualmente)
// ============================================================

export const completedLessons = mysqlTable("completedLessons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: int("lessonId").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  
  // Performance
  score: int("score").default(0), // 0-100
  xpEarned: int("xpEarned").default(0),
  timeSpentSeconds: int("timeSpentSeconds").default(0),
  attemptsCount: int("attemptsCount").default(1),
  
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompletedLesson = typeof completedLessons.$inferSelect;
export type InsertCompletedLesson = typeof completedLessons.$inferInsert;

// ============================================================
// BEHAVIORAL ANALYSIS (IA Avançada)
// ============================================================

export const behavioralAnalysis = mysqlTable("behavioralAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Learning style
  learningStyle: mysqlEnum("learningStyle", ["visual", "auditory", "kinesthetic", "reading"]),
  learningSpeed: float("learningSpeed").default(1.0), // Multiplicador de velocidade
  
  // Optimal study patterns
  optimalSessionDuration: int("optimalSessionDuration").default(20), // minutos
  optimalTimeOfDay: varchar("optimalTimeOfDay", { length: 20 }), // 'morning', 'afternoon', 'evening', 'night'
  circadianPattern: json("circadianPattern").$type<Record<string, number>>(), // Padrão de performance por hora
  
  // Engagement metrics
  frustrationLevel: float("frustrationLevel").default(0), // 0.0 - 1.0
  engagementScore: float("engagementScore").default(0.5), // 0.0 - 1.0
  motivationLevel: float("motivationLevel").default(0.5), // 0.0 - 1.0
  
  // Strengths and weaknesses
  strongAreas: json("strongAreas").$type<string[]>(),
  weakAreas: json("weakAreas").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BehavioralAnalysis = typeof behavioralAnalysis.$inferSelect;
export type InsertBehavioralAnalysis = typeof behavioralAnalysis.$inferInsert;

// ============================================================
// LEARNING HISTORY (Histórico detalhado)
// ============================================================

export const learningHistory = mysqlTable("learningHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  
  // Attempt details
  attemptNumber: int("attemptNumber").default(1),
  isCorrect: boolean("isCorrect").notNull(),
  userAnswer: text("userAnswer"),
  timeSpentSeconds: int("timeSpentSeconds").notNull(),
  
  // Confidence and difficulty
  confidenceLevel: float("confidenceLevel"), // 0.0 - 1.0 (self-reported or inferred)
  perceivedDifficulty: float("perceivedDifficulty"), // 0.0 - 1.0
  
  // Error analysis
  errorType: varchar("errorType", { length: 100 }), // 'grammar', 'vocabulary', 'pronunciation', etc.
  errorDetails: text("errorDetails"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningHistory = typeof learningHistory.$inferSelect;
export type InsertLearningHistory = typeof learningHistory.$inferInsert;

// ============================================================
// ERROR PATTERNS (Padrões de erro)
// ============================================================

export const errorPatterns = mysqlTable("errorPatterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  errorType: varchar("errorType", { length: 100 }).notNull(),
  errorCategory: varchar("errorCategory", { length: 100 }), // 'grammar', 'vocabulary', 'pronunciation'
  frequency: int("frequency").default(1),
  severity: float("severity").default(0.5), // 0.0 - 1.0
  
  // Suggested remediation
  suggestedExerciseId: int("suggestedExerciseId"),
  remediationStrategy: text("remediationStrategy"),
  
  lastOccurrence: timestamp("lastOccurrence").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ErrorPattern = typeof errorPatterns.$inferSelect;
export type InsertErrorPattern = typeof errorPatterns.$inferInsert;

// ============================================================
// DYNAMIC CONTENT (Conteúdo gerado pela IA)
// ============================================================

export const dynamicContent = mysqlTable("dynamicContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  languageId: int("languageId").notNull(),
  
  contentType: mysqlEnum("contentType", ["exercise", "dialogue", "story", "explanation"]).notNull(),
  generatedContent: json("generatedContent").notNull(), // Conteúdo gerado pelo GPT-4
  
  // Metadata
  prompt: text("prompt"), // Prompt usado para gerar
  difficultyLevel: float("difficultyLevel").default(0.5),
  topics: json("topics").$type<string[]>(),
  
  // Effectiveness tracking
  wasUsed: boolean("wasUsed").default(false),
  effectivenessScore: float("effectivenessScore"), // Feedback do usuário
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DynamicContent = typeof dynamicContent.$inferSelect;
export type InsertDynamicContent = typeof dynamicContent.$inferInsert;

// ============================================================
// PRONUNCIATION ANALYSIS (Análise de pronúncia)
// ============================================================

export const pronunciationAnalysis = mysqlTable("pronunciationAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId"),
  
  // Audio data
  audioUrl: text("audioUrl").notNull(),
  targetText: text("targetText").notNull(),
  transcribedText: text("transcribedText").notNull(),
  
  // Analysis results
  accuracyScore: float("accuracyScore").notNull(), // 0.0 - 1.0
  phonemeErrors: json("phonemeErrors").$type<Array<{phoneme: string, expected: string, actual: string}>>(),
  intonationScore: float("intonationScore"),
  rhythmScore: float("rhythmScore"),
  
  // Feedback
  feedback: text("feedback"),
  suggestedImprovements: json("suggestedImprovements").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PronunciationAnalysis = typeof pronunciationAnalysis.$inferSelect;
export type InsertPronunciationAnalysis = typeof pronunciationAnalysis.$inferInsert;

// ============================================================
// OFFLINE SYNC QUEUE (Sincronização offline)
// ============================================================

export const offlineSyncQueue = mysqlTable("offlineSyncQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete'
  entityType: varchar("entityType", { length: 50 }).notNull(), // 'progress', 'history', 'analysis'
  entityData: json("entityData").notNull(),
  
  synced: boolean("synced").default(false),
  syncedAt: timestamp("syncedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OfflineSyncQueue = typeof offlineSyncQueue.$inferSelect;
export type InsertOfflineSyncQueue = typeof offlineSyncQueue.$inferInsert;

// ============================================================
// ACHIEVEMENTS (Conquistas)
// ============================================================

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // URL ou emoji
  category: varchar("category", { length: 50 }), // 'streak', 'points', 'lessons', 'pronunciation'
  
  // Requirements
  requirementType: varchar("requirementType", { length: 50 }).notNull(),
  requirementValue: int("requirementValue").notNull(),
  
  // Rewards
  pointsReward: int("pointsReward").default(0),
  badgeUrl: text("badgeUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// ============================================================
// USER ACHIEVEMENTS (Conquistas do usuário)
// ============================================================

export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

// ============================================================
// CHALLENGES (Desafios personalizados)
// ============================================================

export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["daily", "weekly", "custom"]).notNull(),
  
  // Challenge requirements
  targetType: varchar("targetType", { length: 50 }).notNull(), // 'lessons', 'exercises', 'minutes', 'points'
  targetValue: int("targetValue").notNull(),
  currentValue: int("currentValue").default(0),
  
  // Rewards
  pointsReward: int("pointsReward").default(0),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "expired"]).default("active"),
  expiresAt: timestamp("expiresAt"),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ============================================================
// SUBSCRIPTIONS (Assinaturas)
// ============================================================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["monthly", "annual", "lifetime"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active"),
  
  // Pricing
  amount: int("amount").notNull(), // Em centavos
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Dates
  startDate: timestamp("startDate").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  cancelledAt: timestamp("cancelledAt"),
  
  // Payment info
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("pix"),
  transactionId: varchar("transactionId", { length: 200 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================
// INVOICES (Notas fiscais)
// ============================================================

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Invoice data
  pdfUrl: text("pdfUrl"),
  xmlUrl: text("xmlUrl"),
  
  // Status
  status: mysqlEnum("status", ["pending", "issued", "cancelled"]).default("pending"),
  issuedAt: timestamp("issuedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "achievement", "new_lesson"]).default("info"),
  
  relatedId: int("relatedId"), // ID relacionado (lessonId, achievementId, etc)
  isRead: boolean("isRead").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


// ============================================
// VÍDEOS INTERATIVOS (Cine Learning)
// ============================================

export const videoScenes = mysqlTable("video_scenes", {
  id: int("id").primaryKey().autoincrement(),
  languageId: int("language_id").notNull().references(() => languages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  
  // Vídeo
  videoUrl: text("video_url").notNull(), // S3 URL
  thumbnailUrl: text("thumbnail_url"),
  duration: int("duration").notNull(), // segundos
  
  // Transcrição e legendas
  transcript: text("transcript").notNull(), // Texto completo da cena
  targetPhrase: text("target_phrase").notNull(), // Frase que o aluno deve repetir
  
  // Metadados
  category: varchar("category", { length: 100 }), // "restaurant", "airport", "business", etc
  difficulty: int("difficulty").notNull().default(1), // 1-10
  orderIndex: int("order_index").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const userVideoProgress = mysqlTable("user_video_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  videoSceneId: int("video_scene_id").notNull().references(() => videoScenes.id),
  
  // Progresso
  completed: boolean("completed").notNull().default(false),
  attempts: int("attempts").notNull().default(0),
  bestScore: int("best_score").notNull().default(0), // 0-100
  
  // Gravação do usuário
  userAudioUrl: text("user_audio_url"), // S3 URL da gravação
  
  // Análise de pronúncia
  pronunciationScore: int("pronunciation_score"), // 0-100
  intonationScore: int("intonation_score"), // 0-100
  speedScore: int("speed_score"), // 0-100
  feedback: text("feedback"), // Feedback da IA
  
  // Timestamps
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});


// Waitlist pré-lançamento
export const waitlist = mysqlTable("waitlist", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  referralCode: varchar("referral_code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});


// Tabela de diálogos bilíngues
export const dialogues = mysqlTable("dialogues", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  nativeLanguageCode: varchar("native_language_code", { length: 10 }).notNull(),
  targetLanguageCode: varchar("target_language_code", { length: 10 }).notNull(),
  nativeText: text("native_text").notNull(),
  targetText: text("target_text").notNull(),
  nativeAudioUrl: varchar("native_audio_url", { length: 500 }),
  targetAudioUrl: varchar("target_audio_url", { length: 500 }),
  tutorComment: text("tutor_comment"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  category: varchar("category", { length: 100 }),
  orderIndex: int("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de progresso em diálogos
export const userDialogueProgress = mysqlTable("user_dialogue_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  dialogueId: int("dialogue_id").notNull(),
  pronunciationScore: int("pronunciation_score"),
  attempts: int("attempts").default(0),
  completed: boolean("completed").default(false),
  lastAttemptAt: timestamp("last_attempt_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});


// ============================================================
// SISTEMA DE FEEDBACK BIDIRECIONAL E AUTOAPERFEIÇOAMENTO
// ============================================================

// Conversas entre admin e IA para melhorias do sistema
export const aiAdminConversations = mysqlTable("ai_admin_conversations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(), // Admin que iniciou a conversa
  
  // Metadados da conversa
  topic: varchar("topic", { length: 255 }), // Tópico principal da conversa
  category: mysqlEnum("category", [
    "feature_request", 
    "bug_report", 
    "optimization", 
    "content_improvement",
    "user_experience",
    "ai_training",
    "general"
  ]).default("general"),
  
  status: mysqlEnum("status", ["active", "resolved", "archived"]).default("active"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Resumo gerado pela IA
  summary: text("summary"),
  actionItems: json("action_items").$type<Array<{
    description: string;
    status: "pending" | "in_progress" | "completed";
    completedAt?: string;
  }>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  resolvedAt: timestamp("resolved_at"),
});

export type AiAdminConversation = typeof aiAdminConversations.$inferSelect;
export type InsertAiAdminConversation = typeof aiAdminConversations.$inferInsert;

// Mensagens individuais nas conversas
export const aiAdminMessages = mysqlTable("ai_admin_messages", {
  id: int("id").primaryKey().autoincrement(),
  conversationId: int("conversation_id").notNull().references(() => aiAdminConversations.id),
  
  role: mysqlEnum("role", ["admin", "ai"]).notNull(),
  content: text("content").notNull(),
  
  // Metadados da mensagem
  messageType: mysqlEnum("message_type", [
    "feedback",
    "suggestion",
    "question",
    "insight",
    "analysis",
    "recommendation"
  ]).default("feedback"),
  
  // Dados estruturados (quando aplicável)
  structuredData: json("structured_data").$type<{
    metrics?: Record<string, number>;
    suggestions?: string[];
    code?: string;
    references?: string[];
  }>(),
  
  // Reações e feedback
  wasHelpful: boolean("was_helpful"),
  wasImplemented: boolean("was_implemented").default(false),
  implementedAt: timestamp("implemented_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type AiAdminMessage = typeof aiAdminMessages.$inferSelect;
export type InsertAiAdminMessage = typeof aiAdminMessages.$inferInsert;

// Insights automáticos gerados pela IA
export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").primaryKey().autoincrement(),
  
  // Tipo de insight
  insightType: mysqlEnum("insight_type", [
    "user_behavior",
    "content_gap",
    "performance_issue",
    "engagement_pattern",
    "learning_effectiveness",
    "system_optimization"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Dados de suporte
  dataSource: varchar("data_source", { length: 100 }), // Qual tabela/métrica foi analisada
  metrics: json("metrics").$type<Record<string, number>>(),
  affectedUsers: int("affected_users"),
  
  // Recomendações
  recommendations: json("recommendations").$type<Array<{
    action: string;
    priority: "low" | "medium" | "high";
    estimatedImpact: string;
  }>>(),
  
  // Status
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  status: mysqlEnum("status", ["new", "reviewed", "in_progress", "resolved", "dismissed"]).default("new"),
  
  // Feedback do admin
  adminNotes: text("admin_notes"),
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

// Histórico de melhorias implementadas
export const systemImprovements = mysqlTable("system_improvements", {
  id: int("id").primaryKey().autoincrement(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Origem da melhoria
  source: mysqlEnum("source", ["admin_feedback", "ai_suggestion", "user_request", "automated_analysis"]).notNull(),
  sourceId: int("source_id"), // ID da conversa, insight ou feedback original
  
  // Categorização
  category: varchar("category", { length: 100 }).notNull(),
  impactArea: json("impact_area").$type<string[]>(), // ["ui", "performance", "content", "ai", etc]
  
  // Métricas de impacto
  beforeMetrics: json("before_metrics").$type<Record<string, number>>(),
  afterMetrics: json("after_metrics").$type<Record<string, number>>(),
  estimatedImpact: text("estimated_impact"),
  actualImpact: text("actual_impact"),
  
  // Status
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "rolled_back"]).default("planned"),
  
  implementedBy: int("implemented_by"),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type SystemImprovement = typeof systemImprovements.$inferSelect;
export type InsertSystemImprovement = typeof systemImprovements.$inferInsert;

// Métricas agregadas para análise da IA
export const platformMetrics = mysqlTable("platform_metrics", {
  id: int("id").primaryKey().autoincrement(),
  
  metricDate: timestamp("metric_date").notNull(),
  metricType: varchar("metric_type", { length: 100 }).notNull(), // "daily", "weekly", "monthly"
  
  // Métricas de usuários
  activeUsers: int("active_users").default(0),
  newUsers: int("new_users").default(0),
  returningUsers: int("returning_users").default(0),
  churnedUsers: int("churned_users").default(0),
  
  // Métricas de engajamento
  lessonsCompleted: int("lessons_completed").default(0),
  averageSessionDuration: int("average_session_duration").default(0), // minutos
  averageAccuracy: float("average_accuracy").default(0),
  
  // Métricas de conversão
  freeToPremiun: int("free_to_premium").default(0),
  revenue: int("revenue").default(0), // centavos
  
  // Métricas de conteúdo
  mostPopularLanguages: json("most_popular_languages").$type<Array<{code: string, count: number}>>(),
  mostPopularLessons: json("most_popular_lessons").$type<Array<{id: number, completions: number}>>(),
  
  // Métricas de qualidade
  averageRating: float("average_rating"),
  feedbackCount: int("feedback_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type PlatformMetric = typeof platformMetrics.$inferSelect;
export type InsertPlatformMetric = typeof platformMetrics.$inferInsert;


// ============================================================
// GESTÃO FINANCEIRA E FISCAL
// ============================================================

// Receitas (pagamentos recebidos)
export const revenues = mysqlTable("revenues", {
  id: int("id").primaryKey().autoincrement(),
  
  // Origem da receita
  source: mysqlEnum("source", ["subscription", "one_time_payment", "refund", "other"]).notNull(),
  userId: int("user_id").references(() => users.id),
  subscriptionId: int("subscription_id").references(() => subscriptions.id),
  
  // Valores
  grossAmount: int("gross_amount").notNull(), // Valor bruto em centavos
  fees: int("fees").notNull().default(0), // Taxas (PagBank, etc)
  netAmount: int("net_amount").notNull(), // Valor líquido
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Informações de pagamento
  paymentMethod: varchar("payment_method", { length: 50 }).default("pix"),
  transactionId: varchar("transaction_id", { length: 200 }),
  pagBankTransactionId: varchar("pagbank_transaction_id", { length: 200 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  
  // Recibo
  receiptUrl: text("receipt_url"), // URL do recibo em S3
  receiptNumber: varchar("receipt_number", { length: 100 }),
  
  // Datas
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

// Despesas operacionais
export const expenses = mysqlTable("expenses", {
  id: int("id").primaryKey().autoincrement(),
  
  // Tipo de despesa
  category: mysqlEnum("category", [
    "hosting", // DigitalOcean, etc
    "payment_gateway", // PagBank taxas
    "domain", // Registro.br
    "software", // Licenças de software
    "marketing", // Anúncios, marketing
    "taxes", // Impostos
    "other"
  ]).notNull(),
  
  // Detalhes
  description: text("description").notNull(),
  provider: varchar("provider", { length: 200 }), // Ex: "DigitalOcean", "PagBank"
  
  // Valores
  amount: int("amount").notNull(), // Valor em centavos
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Recorrência
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: mysqlEnum("recurring_frequency", ["monthly", "quarterly", "yearly", "one_time"]).default("one_time"),
  nextDueDate: timestamp("next_due_date"),
  
  // Pagamento automático
  autoPayEnabled: boolean("auto_pay_enabled").default(false),
  paymentMethod: varchar("payment_method", { length: 50 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending"),
  
  // Recibo/Comprovante
  receiptUrl: text("receipt_url"), // URL do recibo em S3
  invoiceUrl: text("invoice_url"), // URL da fatura
  receiptNumber: varchar("receipt_number", { length: 100 }),
  
  // Datas
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// Impostos calculados
export const taxes = mysqlTable("taxes", {
  id: int("id").primaryKey().autoincrement(),
  
  // Tipo de imposto
  taxType: mysqlEnum("tax_type", [
    "income_tax", // Imposto de Renda
    "iss", // ISS (Serviços)
    "pis", // PIS
    "cofins", // COFINS
    "csll", // CSLL
    "other"
  ]).notNull(),
  
  // Período de referência
  referenceMonth: int("reference_month").notNull(), // 1-12
  referenceYear: int("reference_year").notNull(),
  
  // Cálculo
  baseAmount: int("base_amount").notNull(), // Base de cálculo em centavos
  taxRate: float("tax_rate").notNull(), // Alíquota (ex: 0.15 para 15%)
  taxAmount: int("tax_amount").notNull(), // Valor do imposto em centavos
  
  // Status
  status: mysqlEnum("status", ["calculated", "paid", "overdue"]).default("calculated"),
  
  // Pagamento
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  paymentReceiptUrl: text("payment_receipt_url"),
  
  // Guia de pagamento
  paymentGuideUrl: text("payment_guide_url"), // DARF, DAS, etc
  barcode: varchar("barcode", { length: 200 }), // Código de barras
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Tax = typeof taxes.$inferSelect;
export type InsertTax = typeof taxes.$inferInsert;

// Relatórios financeiros mensais
export const financialReports = mysqlTable("financial_reports", {
  id: int("id").primaryKey().autoincrement(),
  
  // Período
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  
  // Receitas
  totalRevenue: int("total_revenue").notNull().default(0),
  totalFees: int("total_fees").notNull().default(0),
  netRevenue: int("net_revenue").notNull().default(0),
  
  // Despesas
  totalExpenses: int("total_expenses").notNull().default(0),
  
  // Impostos
  totalTaxes: int("total_taxes").notNull().default(0),
  
  // Resultado
  grossProfit: int("gross_profit").notNull().default(0), // Receita - Despesas
  netProfit: int("net_profit").notNull().default(0), // Lucro após impostos
  
  // Métricas
  newSubscribers: int("new_subscribers").default(0),
  churnedSubscribers: int("churned_subscribers").default(0),
  activeSubscribers: int("active_subscribers").default(0),
  
  // Análise da IA
  aiAnalysis: text("ai_analysis"), // Análise gerada pela IA
  aiRecommendations: json("ai_recommendations").$type<string[]>(),
  
  // Status
  isFinalized: boolean("is_finalized").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;

// Recibos e comprovantes digitais
export const receipts = mysqlTable("receipts", {
  id: int("id").primaryKey().autoincrement(),
  
  // Tipo
  receiptType: mysqlEnum("receipt_type", [
    "payment_received", // Recibo de pagamento recebido
    "expense_payment", // Comprovante de despesa paga
    "tax_payment", // Comprovante de imposto pago
    "refund", // Comprovante de reembolso
    "other"
  ]).notNull(),
  
  // Relacionamentos
  revenueId: int("revenue_id").references(() => revenues.id),
  expenseId: int("expense_id").references(() => expenses.id),
  taxId: int("tax_id").references(() => taxes.id),
  
  // Informações do recibo
  receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Partes envolvidas
  payer: varchar("payer", { length: 255 }), // Quem pagou
  payee: varchar("payee", { length: 255 }), // Quem recebeu
  
  // Arquivos
  pdfUrl: text("pdf_url"), // URL do PDF em S3
  imageUrl: text("image_url"), // URL da imagem do comprovante
  
  // Metadados
  issuedAt: timestamp("issued_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

// Configurações de pagamentos automáticos
export const autoPaymentConfigs = mysqlTable("auto_payment_configs", {
  id: int("id").primaryKey().autoincrement(),
  
  // Despesa relacionada
  expenseId: int("expense_id").references(() => expenses.id),
  
  // Configuração
  provider: varchar("provider", { length: 200 }).notNull(), // Ex: "DigitalOcean"
  description: text("description").notNull(),
  
  // Valores
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Recorrência
  frequency: mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).notNull(),
  dayOfMonth: int("day_of_month"), // Dia do mês para pagamento (1-31)
  
  // Método de pagamento
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDetails: json("payment_details").$type<{
    cardLast4?: string;
    accountNumber?: string;
    [key: string]: any;
  }>(),
  
  // Status
  isActive: boolean("is_active").default(true),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  
  // Notificações
  notifyBeforeDays: int("notify_before_days").default(3), // Notificar X dias antes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type AutoPaymentConfig = typeof autoPaymentConfigs.$inferSelect;
export type InsertAutoPaymentConfig = typeof autoPaymentConfigs.$inferInsert;


// ============================================================
// CONTEXTUAL PHRASES (5000+ frases contextuais por idioma)
// ============================================================

export const contextualPhrases = mysqlTable("contextualPhrases", {
  id: int("id").autoincrement().primaryKey(),
  languageCode: varchar("languageCode", { length: 10 }).notNull(), // 'en', 'es', 'pt'
  
  // Phrase content
  phraseText: text("phraseText").notNull(), // Frase no idioma alvo
  translation: text("translation").notNull(), // Tradução para idioma nativo
  ipa: text("ipa"), // Pronúncia IPA
  
  // Context and usage
  context: text("context").notNull(), // Contexto de uso (ex: "Em um restaurante ao pedir comida")
  situationType: varchar("situationType", { length: 100 }).notNull(), // 'restaurant', 'airport', 'business', 'casual'
  formalityLevel: mysqlEnum("formalityLevel", ["very_formal", "formal", "neutral", "informal", "very_informal"]).notNull(),
  
  // Categorization
  category: varchar("category", { length: 100 }).notNull(), // 'greetings', 'food', 'travel', 'business', 'science'
  specialization: mysqlEnum("specialization", ["general", "business", "trading", "scientific"]).default("general"),
  
  // Difficulty and level
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull(),
  difficultyScore: float("difficultyScore").default(0.5), // 0.0 - 1.0
  
  // Audio
  audioUrl: text("audioUrl"), // URL do áudio nativo
  audioProvider: varchar("audioProvider", { length: 50 }), // 'narakeet', 'elevenlabs', 'native'
  
  // Usage tracking
  timesUsed: int("timesUsed").default(0),
  averageRetention: float("averageRetention").default(0), // Taxa de retenção pelos alunos
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContextualPhrase = typeof contextualPhrases.$inferSelect;
export type InsertContextualPhrase = typeof contextualPhrases.$inferInsert;

// ============================================================
// LESSON SPECIALIZATIONS (Especializações das lições)
// ============================================================

export const lessonSpecializations = mysqlTable("lessonSpecializations", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  
  specialization: mysqlEnum("specialization", ["business", "trading", "scientific"]).notNull(),
  
  // Specialized content
  industryTerms: json("industryTerms").$type<Array<{term: string, definition: string, example: string}>>(),
  realWorldScenarios: json("realWorldScenarios").$type<Array<{title: string, description: string}>>(),
  professionalExamples: text("professionalExamples"),
  
  // Resources
  externalResources: json("externalResources").$type<Array<{title: string, url: string, type: string}>>(),
  caseStudies: json("caseStudies").$type<Array<{title: string, content: string}>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonSpecialization = typeof lessonSpecializations.$inferSelect;
export type InsertLessonSpecialization = typeof lessonSpecializations.$inferInsert;

// ============================================================
// AI IMPROVEMENTS (Melhorias sugeridas pela IA)
// ============================================================

export const aiImprovements = mysqlTable("aiImprovements", {
  id: int("id").autoincrement().primaryKey(),
  
  // Target of improvement
  targetType: mysqlEnum("targetType", ["lesson", "exercise", "phrase", "grammar", "vocabulary"]).notNull(),
  targetId: int("targetId").notNull(), // ID da entidade alvo
  
  // Improvement details
  improvementType: varchar("improvementType", { length: 100 }).notNull(), // 'difficulty_adjustment', 'content_enhancement', 'error_correction'
  currentVersion: json("currentVersion").notNull(), // Versão atual do conteúdo
  proposedVersion: json("proposedVersion").notNull(), // Versão proposta pela IA
  
  // Reasoning
  reasoning: text("reasoning").notNull(), // Por que a IA sugeriu essa melhoria
  dataSupport: json("dataSupport").$type<{errorRate: number, studentCount: number, avgScore: number}>(),
  
  // Categorization
  level: mysqlEnum("level", ["basic", "intermediate", "advanced"]).notNull(),
  specialization: mysqlEnum("specialization", ["general", "business", "trading", "scientific"]),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Status and validation
  status: mysqlEnum("status", ["pending", "approved", "rejected", "deployed", "rolled_back"]).default("pending"),
  reviewedBy: int("reviewedBy"), // User ID do proprietário que revisou
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  
  // Deployment tracking
  deployedAt: timestamp("deployedAt"),
  deploymentStrategy: varchar("deploymentStrategy", { length: 50 }), // 'immediate', 'canary_5', 'canary_25', 'canary_50'
  affectedStudents: int("affectedStudents").default(0),
  
  // Performance metrics after deployment
  successRate: float("successRate"), // Taxa de sucesso após deploy
  studentFeedback: json("studentFeedback").$type<Array<{userId: number, rating: number, comment: string}>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIImprovement = typeof aiImprovements.$inferSelect;
export type InsertAIImprovement = typeof aiImprovements.$inferInsert;

// ============================================================
// CONTENT VERSIONS (Versionamento de conteúdo)
// ============================================================

export const contentVersions = mysqlTable("contentVersions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Entity identification
  entityType: varchar("entityType", { length: 50 }).notNull(), // 'lesson', 'exercise', 'phrase'
  entityId: int("entityId").notNull(),
  
  // Version data
  versionNumber: int("versionNumber").notNull(),
  content: json("content").notNull(), // Snapshot completo do conteúdo
  
  // Change tracking
  changeType: varchar("changeType", { length: 50 }).notNull(), // 'manual', 'ai_improvement', 'rollback'
  changedBy: int("changedBy"), // User ID ou 'ai'
  changeReason: text("changeReason"),
  
  // Backup metadata
  isBackup: boolean("isBackup").default(true),
  isActive: boolean("isActive").default(false), // Apenas uma versão ativa por entidade
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = typeof contentVersions.$inferInsert;

// ============================================================
// DEPLOYMENT LOGS (Logs de deploy)
// ============================================================

export const deploymentLogs = mysqlTable("deploymentLogs", {
  id: int("id").autoincrement().primaryKey(),
  
  improvementId: int("improvementId").notNull().references(() => aiImprovements.id, { onDelete: "cascade" }),
  
  // Deployment details
  strategy: varchar("strategy", { length: 50 }).notNull(), // 'canary_5', 'canary_25', 'canary_50', 'full'
  percentage: int("percentage").notNull(), // Porcentagem de alunos afetados
  studentsAffected: int("studentsAffected").notNull(),
  
  // Status
  status: mysqlEnum("status", ["in_progress", "completed", "failed", "rolled_back"]).notNull(),
  
  // Metrics
  successRate: float("successRate"),
  errorRate: float("errorRate"),
  avgPerformanceChange: float("avgPerformanceChange"), // Mudança na performance dos alunos
  
  // Logs
  logs: json("logs").$type<Array<{timestamp: string, message: string, level: string}>>(),
  
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type DeploymentLog = typeof deploymentLogs.$inferSelect;
export type InsertDeploymentLog = typeof deploymentLogs.$inferInsert;

// ============================================================
// CONTENT MODERATION & SAFETY SYSTEM
// ============================================================

/**
 * REGRAS DE MODERAÇÃO
 * Configuração de filtros por idade, país, religião
 */
export const contentModerationRules = mysqlTable("content_moderation_rules", {
  id: int("id").autoincrement().primaryKey(),
  
  // Escopo da regra
  ruleType: mysqlEnum("rule_type", ["age_based", "country_based", "religion_based", "custom"]).notNull(),
  targetAgeGroup: mysqlEnum("target_age_group", ["infantil", "adolescente", "adulto", "all"]).default("all"),
  targetCountry: varchar("target_country", { length: 10 }), // ISO 3166-1 alpha-2 (BR, US, SA, etc)
  targetReligion: mysqlEnum("target_religion", ["christian", "muslim", "jewish", "buddhist", "hindu", "secular", "all"]).default("all"),
  
  // Palavras/padrões bloqueados
  blockedWords: json("blocked_words").$type<string[]>(), // Lista de palavras proibidas
  blockedPatterns: json("blocked_patterns").$type<string[]>(), // Regex patterns
  
  // Tópicos sensíveis
  sensitiveTopics: json("sensitive_topics").$type<Array<{
    topic: string;
    severity: "low" | "medium" | "high" | "critical";
    action: "warn" | "block" | "escalate";
  }>>(),
  
  // Ação ao detectar violação
  violationAction: mysqlEnum("violation_action", ["warn", "block", "reformulate", "escalate"]).default("block"),
  
  // Configuração
  isActive: boolean("is_active").default(true),
  priority: int("priority").default(0), // Ordem de aplicação (maior = mais prioritário)
  
  createdBy: int("created_by").notNull(), // Admin que criou
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContentModerationRule = typeof contentModerationRules.$inferSelect;
export type InsertContentModerationRule = typeof contentModerationRules.$inferInsert;

/**
 * LOGS DE CONVERSAS
 * Registro completo de todas interações IA-aluno
 */
export const conversationLogs = mysqlTable("conversation_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Participantes
  userId: int("user_id").notNull(),
  conversationType: mysqlEnum("conversation_type", ["lesson_chat", "pronunciation_feedback", "grammar_help", "general_chat"]).notNull(),
  
  // Conteúdo
  userMessage: text("user_message"), // Mensagem do aluno
  aiResponse: text("ai_response"), // Resposta da IA
  
  // Contexto
  lessonId: int("lesson_id"), // Se conversa relacionada a lição específica
  exerciseId: int("exercise_id"), // Se conversa relacionada a exercício
  
  // Moderação
  moderationScore: float("moderation_score").default(0), // 0-100 (0 = seguro, 100 = perigoso)
  flaggedContent: json("flagged_content").$type<Array<{
    word: string;
    reason: string;
    severity: "low" | "medium" | "high" | "critical";
  }>>(),
  wasBlocked: boolean("was_blocked").default(false),
  wasReformulated: boolean("was_reformulated").default(false),
  originalAiResponse: text("original_ai_response"), // Resposta antes da reformulação
  
  // Metadata
  userAgeGroup: mysqlEnum("user_age_group", ["infantil", "adolescente", "adulto"]),
  userCountry: varchar("user_country", { length: 10 }),
  userReligion: varchar("user_religion", { length: 50 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ConversationLog = typeof conversationLogs.$inferSelect;
export type InsertConversationLog = typeof conversationLogs.$inferInsert;

/**
 * ALERTAS DE MODERAÇÃO
 * Violações detectadas que requerem atenção
 */
export const moderationAlerts = mysqlTable("moderation_alerts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Violação
  conversationLogId: int("conversation_log_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Detalhes
  violationType: mysqlEnum("violation_type", [
    "inappropriate_content",
    "violence",
    "profanity",
    "sexual_content",
    "hate_speech",
    "personal_info",
    "bullying",
    "other"
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  detectedContent: text("detected_content"), // Conteúdo que violou
  violatedRules: json("violated_rules").$type<number[]>(), // IDs das regras violadas
  
  // Status
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending"),
  reviewedBy: int("reviewed_by"), // Admin que revisou
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Ação tomada
  actionTaken: mysqlEnum("action_taken", ["none", "warning_sent", "content_blocked", "user_suspended", "escalated"]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ModerationAlert = typeof moderationAlerts.$inferSelect;
export type InsertModerationAlert = typeof moderationAlerts.$inferInsert;

/**
 * CONTEÚDO BLOQUEADO
 * Blacklist/whitelist customizável
 */
export const blockedContent = mysqlTable("blocked_content", {
  id: int("id").autoincrement().primaryKey(),
  
  // Tipo
  listType: mysqlEnum("list_type", ["blacklist", "whitelist"]).notNull(),
  contentType: mysqlEnum("content_type", ["word", "phrase", "pattern", "topic"]).notNull(),
  
  // Conteúdo
  content: varchar("content", { length: 500 }).notNull(),
  isRegex: boolean("is_regex").default(false),
  
  // Escopo
  ageGroups: json("age_groups").$type<string[]>(), // ["infantil", "adolescente"] ou null = todos
  countries: json("countries").$type<string[]>(), // ["BR", "US"] ou null = todos
  religions: json("religions").$type<string[]>(), // ["muslim"] ou null = todos
  
  // Metadata
  reason: text("reason"), // Por que foi bloqueado
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  
  isActive: boolean("is_active").default(true),
  addedBy: int("added_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BlockedContent = typeof blockedContent.$inferSelect;
export type InsertBlockedContent = typeof blockedContent.$inferInsert;

/**
 * PERFIL DE SEGURANÇA DO USUÁRIO
 * Configurações de moderação por usuário
 */
export const userSafetyProfile = mysqlTable("user_safety_profile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  
  // Informações do usuário
  ageGroup: mysqlEnum("age_group", ["infantil", "adolescente", "adulto"]).notNull(),
  dateOfBirth: date("date_of_birth"), // Para validação de idade
  country: varchar("country", { length: 10 }), // ISO 3166-1
  religion: varchar("religion", { length: 50 }),
  
  // Consentimento parental (obrigatório para menores de 13)
  parentalConsentGiven: boolean("parental_consent_given").default(false),
  parentEmail: varchar("parent_email", { length: 255 }),
  parentConsentDate: timestamp("parent_consent_date"),
  
  // Configurações de moderação
  moderationLevel: mysqlEnum("moderation_level", ["strict", "moderate", "relaxed"]).default("moderate"),
  customBlockedWords: json("custom_blocked_words").$type<string[]>(), // Palavras adicionais bloqueadas pelos pais
  
  // Histórico de violações
  violationCount: int("violation_count").default(0),
  lastViolationDate: timestamp("last_violation_date"),
  
  // Restrições
  isRestricted: boolean("is_restricted").default(false), // Conta com restrições por violações
  restrictionReason: text("restriction_reason"),
  restrictionEndDate: timestamp("restriction_end_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserSafetyProfile = typeof userSafetyProfile.$inferSelect;
export type InsertUserSafetyProfile = typeof userSafetyProfile.$inferInsert;

// ============================================================
// VIDEO CLIPS (Clipes Educacionais de Precisão Extrema)
// ============================================================

export const videoClips = mysqlTable("video_clips", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações básicas
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Idiomas
  targetLanguage: varchar("target_language", { length: 10 }).notNull(), // Idioma sendo ensinado
  nativeLanguage: varchar("native_language", { length: 10 }).notNull(), // Idioma nativo do aluno
  
  // Nível CEFR
  difficulty: mysqlEnum("difficulty", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull(),
  
  // Duração
  duration: int("duration").notNull(), // segundos
  
  // URL do vídeo
  videoUrl: varchar("video_url", { length: 500 }), // URL do vídeo hospedado
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }), // URL da thumbnail
  
  // Dados JSON (armazenados como texto)
  scriptData: text("script_data"), // JSON: ClipScript
  subtitlesData: text("subtitles_data"), // JSON: BilingualSubtitle[]
  vocabularyData: text("vocabulary_data"), // JSON: VocabularyItem[]
  grammarData: text("grammar_data"), // JSON: GrammarPoint[]
  culturalNotes: text("cultural_notes"), // JSON: string[]
  
  // Qualidade e verificação
  qualityScore: int("quality_score").default(0), // 0-100
  verificationStatus: mysqlEnum("verification_status", ["pending", "verified", "approved"]).default("pending"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VideoClip = typeof videoClips.$inferSelect;
export type InsertVideoClip = typeof videoClips.$inferInsert;


// ============================================================
// CRM - CUSTOMER RELATIONSHIP MANAGEMENT
// ============================================================

// Contatos/Leads do CRM
export const crmContacts = mysqlTable("crm_contacts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados pessoais
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 100 }),
  
  // Origem
  source: mysqlEnum("source", [
    "website", "referral", "social_media", "google_ads",
    "facebook_ads", "instagram", "whatsapp", "email_campaign",
    "organic", "partner", "event", "other"
  ]).default("website"),
  
  // Segmentação
  segment: mysqlEnum("segment", [
    "individual", "student", "professional", "company",
    "educational_institution", "ngo", "government"
  ]).default("individual"),
  
  // Status
  status: mysqlEnum("status", [
    "new", "contacted", "qualified", "unqualified", "customer", "churned"
  ]).default("new"),
  
  // Idioma de interesse
  targetLanguage: varchar("target_language", { length: 50 }),
  nativeLanguage: varchar("native_language", { length: 50 }),
  
  // Usuário vinculado (se já é cliente)
  userId: int("user_id"),
  
  // Notas
  notes: text("notes"),
  tags: json("tags").$type<string[]>(),
  
  // Localização
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type CrmContact = typeof crmContacts.$inferSelect;
export type InsertCrmContact = typeof crmContacts.$inferInsert;

// Negócios/Oportunidades (Pipeline de Vendas)
export const crmDeals = mysqlTable("crm_deals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamento
  contactId: int("contact_id").notNull(),
  assignedTo: int("assigned_to"), // userId do vendedor
  
  // Dados do negócio
  title: varchar("title", { length: 255 }).notNull(),
  value: int("value").default(0), // Em centavos (BRL)
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Plano de interesse
  planType: mysqlEnum("plan_type", [
    "monthly", "annual", "lifetime", "team", "institutional"
  ]).default("monthly"),
  
  // Estágio do funil
  stage: mysqlEnum("stage", [
    "lead",        // Novo lead
    "qualified",   // Lead qualificado
    "proposal",    // Proposta enviada
    "negotiation", // Em negociação
    "won",         // Ganho
    "lost"         // Perdido
  ]).default("lead"),
  
  // Probabilidade de fechamento (0-100%)
  probability: int("probability").default(0),
  
  // Datas
  expectedCloseDate: date("expected_close_date"),
  closedAt: timestamp("closed_at"),
  
  // Motivo de perda (se perdido)
  lostReason: varchar("lost_reason", { length: 255 }),
  
  // Notas
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type CrmDeal = typeof crmDeals.$inferSelect;
export type InsertCrmDeal = typeof crmDeals.$inferInsert;

// Atividades do CRM (ligações, emails, reuniões)
export const crmActivities = mysqlTable("crm_activities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamento
  contactId: int("contact_id"),
  dealId: int("deal_id"),
  userId: int("user_id"), // Quem realizou
  
  // Tipo de atividade
  type: mysqlEnum("type", [
    "call", "email", "meeting", "whatsapp", "demo",
    "proposal_sent", "follow_up", "note", "task"
  ]).notNull(),
  
  // Dados
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  
  // Datas
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  
  // Resultado
  outcome: text("outcome"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type CrmActivity = typeof crmActivities.$inferSelect;
export type InsertCrmActivity = typeof crmActivities.$inferInsert;

// Metas de Vendas
export const salesTargets = mysqlTable("sales_targets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Período
  period: mysqlEnum("period", ["daily", "weekly", "monthly", "quarterly", "annual"]).notNull(),
  year: int("year").notNull(),
  month: int("month"), // 1-12 (para metas mensais)
  quarter: int("quarter"), // 1-4 (para metas trimestrais)
  
  // Metas
  revenueTarget: int("revenue_target").notNull(), // Em centavos
  leadsTarget: int("leads_target").default(0),
  dealsTarget: int("deals_target").default(0),
  conversionsTarget: int("conversions_target").default(0),
  
  // Responsável
  assignedTo: int("assigned_to"), // userId (null = toda equipe)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type SalesTarget = typeof salesTargets.$inferSelect;
export type InsertSalesTarget = typeof salesTargets.$inferInsert;

// ── Ranking Global ────────────────────────────────────────────────────────────
export const globalRanking = mysqlTable("global_ranking", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 100 }).notNull(),
  totalXp: int("totalXp").notNull().default(0),
  weeklyXp: int("weeklyXp").notNull().default(0),
  monthlyXp: int("monthlyXp").notNull().default(0),
  currentStreak: int("currentStreak").notNull().default(0),
  longestStreak: int("longestStreak").notNull().default(0),
  conversationsCompleted: int("conversationsCompleted").notNull().default(0),
  wordsLearned: int("wordsLearned").notNull().default(0),
  perfectScores: int("perfectScores").notNull().default(0),
  level: int("level").notNull().default(1),
  badge: varchar("badge", { length: 50 }).default("beginner"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
export type GlobalRanking = typeof globalRanking.$inferSelect;

// ============================================================
// BACKUP SNAPSHOTS (dados de recuperação duráveis)
// ============================================================
export const backupSnapshots = mysqlTable("backup_snapshots", {
  id: varchar("id", { length: 100 }).primaryKey(),
  backupType: mysqlEnum("backup_type", ["full", "config", "lessons", "users"]).notNull().default("full"),
  storageKey: varchar("storage_key", { length: 512 }).notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  encryptionVersion: varchar("encryption_version", { length: 20 }).notNull().default("aes-256-gcm-v1"),
  tablesBackedUp: json("tables_backed_up").$type<string[]>().notNull(),
  totalRecords: int("total_records").notNull().default(0),
  fileSizeBytes: int("file_size_bytes").notNull().default(0),
  status: mysqlEnum("status", ["completed", "failed", "restoring"]).notNull().default("completed"),
  scheduleBucket: varchar("schedule_bucket", { length: 32 }).unique(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  completedAt: bigint("completed_at", { mode: "number" }),
});

export type BackupSnapshot = typeof backupSnapshots.$inferSelect;

export const backupScheduleConfig = mysqlTable("backup_schedule_config", {
  id: varchar("id", { length: 32 }).primaryKey(),
  heartbeatTaskUid: varchar("heartbeat_task_uid", { length: 65 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 64 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export type BackupScheduleConfig = typeof backupScheduleConfig.$inferSelect;

// ── Desafio Diário ────────────────────────────────────────────────────────────
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  challengeDate: varchar("challengeDate", { length: 10 }).notNull(),
  scenario: varchar("scenario", { length: 100 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  conversationCompleted: boolean("conversationCompleted").default(false),
  wordGameCompleted: boolean("wordGameCompleted").default(false),
  pronunciationScore: int("pronunciationScore").default(0),
  xpEarned: int("xpEarned").default(0),
  bonusEarned: boolean("bonusEarned").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

// ── Histórico de Pronúncia ────────────────────────────────────────────────────
export const pronunciationHistory = mysqlTable("pronunciation_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  word: varchar("word", { length: 200 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  scenario: varchar("scenario", { length: 100 }),
  score: int("score").notNull(),
  userTranscript: text("userTranscript"),
  expectedText: text("expectedText"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type PronunciationHistory = typeof pronunciationHistory.$inferSelect;

// ── Progresso SRS (Word Game) ─────────────────────────────────────────────────
export const srsProgress = mysqlTable("srs_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  word: varchar("word", { length: 200 }).notNull(),
  translation: varchar("translation", { length: 200 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  category: varchar("category", { length: 50 }),
  easeFactor: float("easeFactor").notNull().default(2.5),
  interval: int("interval").notNull().default(1),
  repetitions: int("repetitions").notNull().default(0),
  nextReview: timestamp("nextReview").defaultNow(),
  totalCorrect: int("totalCorrect").notNull().default(0),
  totalWrong: int("totalWrong").notNull().default(0),
  lastSeen: timestamp("lastSeen").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type SrsProgress = typeof srsProgress.$inferSelect;

// ── Conquistas (Achievements) ─────────────────────────────────────────────────

// ── Sessões VR/Conversação ────────────────────────────────────────────────────
export const vrSessions = mysqlTable("vr_sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  scenario: varchar("scenario", { length: 100 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  mode: varchar("mode", { length: 20 }).default("screen"),
  totalTurns: int("totalTurns").notNull().default(0),
  avgPronunciationScore: int("avgPronunciationScore").default(0),
  avgGrammarScore: int("avgGrammarScore").default(0),
  xpEarned: int("xpEarned").default(0),
  completed: boolean("completed").default(false),
  durationSeconds: int("durationSeconds").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type VrSession = typeof vrSessions.$inferSelect;

// ── Modo Batalha ──────────────────────────────────────────────────────────────
export const battleRooms = mysqlTable("battle_rooms", {
  id: int("id").primaryKey().autoincrement(),
  roomCode: varchar("room_code", { length: 8 }).notNull().unique(),
  hostId: int("host_id").notNull(),
  guestId: int("guest_id"),
  targetLanguage: varchar("target_language", { length: 20 }).notNull(),
  nativeLanguage: varchar("native_language", { length: 20 }).notNull().default("pt-BR"),
  category: varchar("category", { length: 50 }).notNull(),
  cefrLevel: mysqlEnum("cefr_level", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull().default("A1"),
  quizData: json("quiz_data").$type<Array<{ question: string; options: string[]; correct: number; word: string }>>(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  hostScore: int("host_score"),
  guestScore: int("guest_score"),
  hostWords: int("host_words"),
  guestWords: int("guest_words"),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
});
export type BattleRoom = typeof battleRooms.$inferSelect;

// ── Certificados ──────────────────────────────────────────────────────────────
export const certificates = mysqlTable("certificates", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  userName: varchar("user_name", { length: 100 }).notNull(),
  targetLanguage: varchar("target_language", { length: 20 }).notNull(),
  languageName: varchar("language_name", { length: 50 }).notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
});
export type Certificate = typeof certificates.$inferSelect;

// ── Expansão Diária de Vocabulário Pareto ─────────────────────────────────────
export const vocabExpansions = mysqlTable("vocab_expansions", {
  id: int("id").primaryKey().autoincrement(),
  wordId: varchar("word_id", { length: 20 }).notNull().unique(),
  ptBR: varchar("pt_br", { length: 100 }).notNull(),
  enUS: varchar("en_us", { length: 100 }).notNull(),
  enGB: varchar("en_gb", { length: 100 }),
  pronunciation: varchar("pronunciation", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(),
  frequency: int("frequency").default(5),
  example: text("example"),
  examplePt: text("example_pt"),
  scene: varchar("scene", { length: 50 }).default("general"),
  batchDate: varchar("batch_date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type VocabExpansion = typeof vocabExpansions.$inferSelect;


// ── Aceite de Termos de Uso e Conduta ─────────────────────────────────────────
export const termsAcceptances = mysqlTable("terms_acceptances", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  termsVersion: varchar("terms_version", { length: 20 }).notNull().default("1.0"),
  acceptedAt: timestamp("accepted_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  // Confirmações específicas
  confirmedMoralConduct: boolean("confirmed_moral_conduct").notNull().default(false),
  confirmedNoDiscrimination: boolean("confirmed_no_discrimination").notNull().default(false),
  confirmedNoAbuse: boolean("confirmed_no_abuse").notNull().default(false),
  confirmedLegalCompliance: boolean("confirmed_legal_compliance").notNull().default(false),
  confirmedAgeVerification: boolean("confirmed_age_verification").notNull().default(false),
  // Selfie como prova jurídica
  selfieUrl: text("selfie_url"),           // URL da foto salva no storage
  selfieTakenAt: timestamp("selfie_taken_at"), // Data/hora da foto (prova)
  // Verificação de identidade
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
});
export type TermsAcceptance = typeof termsAcceptances.$inferSelect;
export type InsertTermsAcceptance = typeof termsAcceptances.$inferInsert;

// ── Autorização Parental (menores de 18 anos) ─────────────────────────────────
export const parentalConsents = mysqlTable("parental_consents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  // Dados do responsável
  guardianName: varchar("guardian_name", { length: 200 }).notNull(),
  guardianDocument: varchar("guardian_document", { length: 50 }), // CPF/ID
  guardianEmail: varchar("guardian_email", { length: 200 }),
  relationship: varchar("relationship", { length: 50 }).notNull(), // pai, mae, responsavel
  // Confirmações
  confirmedTerms: boolean("confirmed_terms").notNull().default(false),
  confirmedMoralConduct: boolean("confirmed_moral_conduct").notNull().default(false),
  confirmedParentalControl: boolean("confirmed_parental_control").notNull().default(false),
  confirmedLegalCompliance: boolean("confirmed_legal_compliance").notNull().default(false),
  // Metadados
  consentVersion: varchar("consent_version", { length: 20 }).notNull().default("1.0"),
  consentAt: timestamp("consent_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isMinor: boolean("is_minor").notNull().default(true),
  userAge: int("user_age"),
});
export type ParentalConsent = typeof parentalConsents.$inferSelect;
export type InsertParentalConsent = typeof parentalConsents.$inferInsert;

// ── Eventos de Segurança ──────────────────────────────────────────────────────
export const securityEvents = mysqlTable("security_events", {
  id: int("id").primaryKey().autoincrement(),
  // Tipo e severidade
  eventType: mysqlEnum("event_type", [
    "paywall_bypass",
    "rate_limit_exceeded",
    "scraping_detected",
    "bot_detected",
    "moral_violation",
    "legal_violation",
    "abuse_content",
    "discrimination",
    "unauthorized_access",
    "suspicious_pattern",
    "ddos_attempt",
    "sql_injection",
    "xss_attempt",
    "other"
  ]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  // Origem
  userId: int("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  endpoint: varchar("endpoint", { length: 500 }),
  // Detalhes
  description: text("description").notNull(),
  evidence: json("evidence").$type<Record<string, unknown>>(),
  // Ação tomada
  actionTaken: mysqlEnum("action_taken", [
    "blocked",
    "rate_limited",
    "account_banned",
    "ip_blocked",
    "content_removed",
    "reported_to_authorities",
    "admin_notified",
    "none"
  ]).default("none"),
  adminNotified: boolean("admin_notified").default(false),
  adminNotifiedAt: timestamp("admin_notified_at"),
  // Dicas de ação para o admin
  adminTips: text("admin_tips"),
  legalReference: varchar("legal_reference", { length: 500 }),
  // Status
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: int("resolved_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;

// ─── App Telemetry (client error logging) ────────────────────────────────────
export const appTelemetry = mysqlTable("app_telemetry", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  context: varchar("context", { length: 255 }),
  message: text("message"),
  stack: text("stack"),
  url: varchar("url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AppTelemetry = typeof appTelemetry.$inferSelect;

// ─── Phone Verifications (Comprovação legal por celular) ──────────────────────
// PROVA JURÍDICA: número de celular + IP + data/hora + código confirmado
// Registrado na Anatel com CPF do titular — identificação real garantida
export const phoneVerifications = mysqlTable("phone_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),           // Número com DDD+DDI
  countryCode: varchar("country_code", { length: 5 }).default("+55"),
  code: varchar("code", { length: 6 }).notNull(),              // Código 6 dígitos enviado
  verified: boolean("verified").default(false),                // Confirmado?
  verifiedAt: timestamp("verified_at"),                        // Data/hora da confirmação (prova)
  ipAddress: varchar("ip_address", { length: 45 }),            // IP do dispositivo (prova)
  userAgent: text("user_agent"),                               // Navegador/dispositivo (prova)
  attempts: int("attempts").default(0),                        // Tentativas erradas
  expiresAt: timestamp("expires_at").notNull(),                // Expira em 10 min
  createdAt: timestamp("created_at").defaultNow(),             // Data/hora do envio (prova)
  isGuardianPhone: boolean("is_guardian_phone").default(false),// Celular do responsável?
  guardianName: varchar("guardian_name", { length: 200 }),     // Nome do responsável
});
export type PhoneVerification = typeof phoneVerifications.$inferSelect;
export type InsertPhoneVerification = typeof phoneVerifications.$inferInsert;

// ─── Email Verifications (Comprovação legal por e-mail / PC) ─────────────────
// PROVA JURÍDICA: e-mail + IP + data/hora + código confirmado
export const emailVerifications = mysqlTable("email_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),          // E-mail informado
  code: varchar("code", { length: 6 }).notNull(),              // Código 6 dígitos
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),                        // Data/hora confirmação (prova)
  ipAddress: varchar("ip_address", { length: 45 }),            // IP do dispositivo (prova)
  userAgent: text("user_agent"),                               // Navegador/dispositivo (prova)
  attempts: int("attempts").default(0),
  expiresAt: timestamp("expires_at").notNull(),                // Expira em 15 min
  createdAt: timestamp("created_at").defaultNow(),
  isGuardianEmail: boolean("is_guardian_email").default(false),// E-mail do responsável?
  guardianName: varchar("guardian_name", { length: 200 }),
});
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

// ============================================================
// PARENTAL CONTROL SYSTEM (Painel de Controle Parental)
// ============================================================

export const childProfiles = mysqlTable("child_profiles", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull().references(() => users.id, { onDelete: "cascade" }),
  linkedUserId: int("linkedUserId").unique().references(() => users.id, { onDelete: "set null" }),
  linkCodeHash: varchar("linkCodeHash", { length: 64 }),
  linkCodeExpiresAt: timestamp("linkCodeExpiresAt"),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).default("👧"),
  level: mysqlEnum("level", ["infantil", "adolescente", "adulto"]).default("infantil"),
  birthDate: date("birthDate"),
  parentalConsentGiven: boolean("parentalConsentGiven").default(false).notNull(),
  parentalConsentAt: timestamp("parentalConsentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = typeof childProfiles.$inferInsert;

export const parentalSettings = mysqlTable("parental_settings", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  pinCode: varchar("pinCode", { length: 255 }).notNull(),
  timeLimitMinutes: int("timeLimitMinutes").default(60),
  aiConversationsEnabled: boolean("aiConversationsEnabled").default(false).notNull(),
  allowedDays: json("allowedDays").$type<boolean[]>(), // [seg, ter, qua, qui, sex, sab, dom]
  levelsAllowed: json("levelsAllowed").$type<string[]>(), // ["beginner", "intermediate", "advanced"]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParentalSettings = typeof parentalSettings.$inferSelect;
export type InsertParentalSettings = typeof parentalSettings.$inferInsert;

export const usageSessions = mysqlTable("usage_sessions", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  sessionStart: timestamp("sessionStart").defaultNow().notNull(),
  sessionEnd: timestamp("sessionEnd"),
  minutesUsed: int("minutesUsed").default(0),
  lessonsCompleted: int("lessonsCompleted").default(0),
  accuracyScore: float("accuracyScore").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageSession = typeof usageSessions.$inferSelect;
export type InsertUsageSession = typeof usageSessions.$inferInsert;

export const parentalAlerts = mysqlTable("parental_alerts", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  alertType: varchar("alertType", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  detail: text("detail"),
  icon: varchar("icon", { length: 10 }).default("⚠️"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParentalAlert = typeof parentalAlerts.$inferSelect;
export type InsertParentalAlert = typeof parentalAlerts.$inferInsert;

export const parentalContentDecisions = mysqlTable("parental_content_decisions", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull().references(() => childProfiles.id, { onDelete: "cascade" }),
  alertId: int("alertId").notNull().references(() => parentalAlerts.id, { onDelete: "cascade" }),
  parentId: int("parentId").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  decision: mysqlEnum("decision", ["allow_temporarily", "keep_blocked"]).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParentalContentDecision = typeof parentalContentDecisions.$inferSelect;
export type InsertParentalContentDecision = typeof parentalContentDecisions.$inferInsert;

// ===== App Updates =====
export const appUpdates = mysqlTable("app_updates", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  severity: varchar("severity", { length: 20 }).default("info"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AppUpdate = typeof appUpdates.$inferSelect;
export type InsertAppUpdate = typeof appUpdates.$inferInsert;

// ===== App Updates Read (per-user read tracking) =====
export const appUpdatesRead = mysqlTable("app_updates_read", {
  id: int("id").autoincrement().primaryKey(),
  updateId: int("updateId").notNull().references(() => appUpdates.id, { onDelete: "cascade" }),
  userId: int("userId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});
export type AppUpdateRead = typeof appUpdatesRead.$inferSelect;
export type InsertAppUpdateRead = typeof appUpdatesRead.$inferInsert;
