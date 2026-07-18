import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  languages,
  courses,
  lessons,
  exercises,
  userProgress,
  completedLessons,
  behavioralAnalysis,
  learningHistory,
  errorPatterns,
  dynamicContent,
  pronunciationAnalysis,
  offlineSyncQueue,
  achievements,
  userAchievements,
  challenges,
  subscriptions,
  invoices,
  aiAdminConversations,
  aiAdminMessages,
  type Language,
  type Course,
  type Lesson,
  type Exercise,
  type UserProgress,
  type CompletedLesson,
  type InsertCompletedLesson,
  type BehavioralAnalysis,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER MANAGEMENT
// ============================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "nativeLanguage", "learningGoal"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// LANGUAGES
// ============================================================

export async function getAllLanguages(): Promise<Language[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(languages).where(eq(languages.isActive, true));
}

export async function getLanguageById(languageId: number): Promise<Language | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(languages).where(eq(languages.id, languageId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLanguageByCode(code: string): Promise<Language | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// COURSES
// ============================================================

export async function getCoursesByLanguage(languageId: number): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(courses)
    .where(eq(courses.languageId, languageId));
}

export async function getCourseById(courseId: number): Promise<Course | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// LESSONS
// ============================================================

export async function getAllLessons(): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons)
    .orderBy(lessons.orderIndex)
    .limit(100);
}

export async function getLessonsByCourseLevel(courseLevel: string): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];
  // Usar SQL raw para evitar problema de tipo com enum dinâmico
  const result = await db.execute(
    `SELECT * FROM lessons WHERE courseLevel = '${courseLevel}' ORDER BY orderIndex LIMIT 100`
  );
  return (result as any)[0] as Lesson[];
}

export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.orderIndex);
}

export async function getLessonById(lessonId: number): Promise<Lesson | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLessonAudio(lessonId: number, audioUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(lessons)
    .set({ audioUrl })
    .where(eq(lessons.id, lessonId));
}

// ============================================================
// EXERCISES
// ============================================================

export async function getExercisesByLesson(lessonId: number): Promise<Exercise[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exercises)
    .where(eq(exercises.lessonId, lessonId))
    .orderBy(exercises.orderIndex);
}

export async function getExerciseById(exerciseId: number): Promise<Exercise | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exercises).where(eq(exercises.id, exerciseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// USER PROGRESS
// ============================================================

export async function getUserProgress(userId: number, courseId: number): Promise<UserProgress | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.courseId, courseId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserAllProgress(userId: number): Promise<UserProgress[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(userProgress)
    .where(eq(userProgress.userId, userId));
}

export async function updateUserProgress(
  userId: number,
  courseId: number,
  updates: Partial<UserProgress>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(userProgress)
    .set(updates)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.courseId, courseId)
    ));
}

// ============================================================
// BEHAVIORAL ANALYSIS
// ============================================================

export async function getUserBehavioralAnalysis(userId: number): Promise<BehavioralAnalysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(behavioralAnalysis)
    .where(eq(behavioralAnalysis.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateBehavioralAnalysis(
  userId: number,
  updates: Partial<BehavioralAnalysis>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserBehavioralAnalysis(userId);

  if (existing) {
    await db.update(behavioralAnalysis)
      .set(updates)
      .where(eq(behavioralAnalysis.userId, userId));
  } else {
    await db.insert(behavioralAnalysis).values({
      userId,
      ...updates,
    } as any);
  }
}

// ============================================================
// LEARNING HISTORY
// ============================================================

export async function recordLearningHistory(data: {
  userId: number;
  exerciseId: number;
  isCorrect: boolean;
  userAnswer: string;
  timeSpentSeconds: number;
  errorType?: string;
  errorDetails?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get attempt number
  const previousAttempts = await db.select().from(learningHistory)
    .where(and(
      eq(learningHistory.userId, data.userId),
      eq(learningHistory.exerciseId, data.exerciseId)
    ));

  await db.insert(learningHistory).values({
    ...data,
    attemptNumber: previousAttempts.length + 1,
  } as any);
}

export async function getUserLearningHistory(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(learningHistory)
    .where(eq(learningHistory.userId, userId))
    .orderBy(desc(learningHistory.createdAt))
    .limit(limit);
}

// ============================================================
// ERROR PATTERNS
// ============================================================

export async function getUserErrorPatterns(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(errorPatterns)
    .where(eq(errorPatterns.userId, userId))
    .orderBy(desc(errorPatterns.frequency));
}

export async function recordErrorPattern(data: {
  userId: number;
  errorType: string;
  errorCategory?: string;
  severity?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if pattern exists
  const existing = await db.select().from(errorPatterns)
    .where(and(
      eq(errorPatterns.userId, data.userId),
      eq(errorPatterns.errorType, data.errorType)
    ))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    // Increment frequency
    const pattern = existing[0];
    await db.update(errorPatterns)
      .set({
        frequency: (pattern.frequency || 0) + 1,
        lastOccurrence: new Date(),
      })
      .where(eq(errorPatterns.id, pattern.id));
  } else {
    // Create new pattern
    await db.insert(errorPatterns).values(data as any);
  }
}

// ============================================================
// DYNAMIC CONTENT
// ============================================================

export async function saveDynamicContent(data: {
  userId: number;
  languageId: number;
  contentType: "exercise" | "dialogue" | "story" | "explanation";
  generatedContent: any;
  prompt?: string;
  difficultyLevel?: number;
  topics?: string[];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(dynamicContent).values(data as any);
  return Number((result as any).insertId);
}

export async function getDynamicContentById(contentId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(dynamicContent)
    .where(eq(dynamicContent.id, contentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// PRONUNCIATION ANALYSIS
// ============================================================

export async function savePronunciationAnalysis(data: {
  userId: number;
  exerciseId?: number;
  audioUrl: string;
  targetText: string;
  transcribedText: string;
  accuracyScore: number;
  phonemeErrors?: any;
  intonationScore?: number;
  rhythmScore?: number;
  feedback?: string;
  suggestedImprovements?: string[];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pronunciationAnalysis).values(data as any);
  return Number((result as any).insertId);
}

export async function getUserPronunciationHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pronunciationAnalysis)
    .where(eq(pronunciationAnalysis.userId, userId))
    .orderBy(desc(pronunciationAnalysis.createdAt))
    .limit(limit);
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(achievements);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      achievement: achievements,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));

  return result;
}

export async function unlockAchievement(userId: number, achievementId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if already unlocked
  const existing = await db.select().from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userAchievements).values({
      userId,
      achievementId,
    } as any);
  }
}

// ============================================================
// CHALLENGES
// ============================================================

export async function getUserActiveChallenges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(challenges)
    .where(and(
      eq(challenges.userId, userId),
      eq(challenges.status, "active")
    ));
}

export async function updateChallengeProgress(
  challengeId: number,
  currentValue: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(challenges)
    .set({ currentValue })
    .where(eq(challenges.id, challengeId));
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, "active")
    ))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: {
  userId: number;
  type: "monthly" | "annual" | "lifetime";
  amount: number;
  expiresAt?: Date;
  transactionId?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(data as any);
  return Number((result as any).insertId);
}

// ============================================================
// COMPLETED LESSONS & PROGRESS TRACKING
// ============================================================

/**
 * Marca uma lição como completada e atualiza todo o progresso do usuário
 */
export async function completeLesson(data: {
  userId: number;
  lessonId: number;
  courseId: number;
  score: number;
  timeSpentSeconds: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Calcular XP baseado no score (0-100 pontos)
  const xpEarned = Math.round(data.score);

  // 1. Registrar lição completada
  await db.insert(completedLessons).values({
    userId: data.userId,
    lessonId: data.lessonId,
    score: data.score,
    xpEarned,
    timeSpentSeconds: data.timeSpentSeconds,
    attemptsCount: 1,
  } as InsertCompletedLesson);

  // 2. Atualizar ou criar progresso do curso
  const existingProgress = await getUserProgress(data.userId, data.courseId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let newStreak = 1;
  if (existingProgress) {
    // Calcular streak
    const lastStudy = existingProgress.lastStudyDate;
    if (lastStudy) {
      const lastStudyDate = new Date(lastStudy);
      lastStudyDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Mesmo dia, mantém streak
        newStreak = existingProgress.currentStreak || 1;
      } else if (diffDays === 1) {
        // Dia consecutivo, incrementa
        newStreak = (existingProgress.currentStreak || 0) + 1;
      } else {
        // Quebrou o streak
        newStreak = 1;
      }
    }

    // Atualizar progresso existente
    await db.update(userProgress)
      .set({
        completedLessons: (existingProgress.completedLessons || 0) + 1,
        totalPoints: (existingProgress.totalPoints || 0) + xpEarned,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existingProgress.longestStreak || 0),
        lastStudyDate: new Date(),
        totalStudyMinutes: (existingProgress.totalStudyMinutes || 0) + Math.round(data.timeSpentSeconds / 60),
        currentLessonId: data.lessonId,
        progressPercentage: ((existingProgress.completedLessons || 0) + 1) / (existingProgress.totalLessons || 200) * 100,
      })
      .where(and(
        eq(userProgress.userId, data.userId),
        eq(userProgress.courseId, data.courseId)
      ));
  } else {
    // Criar novo progresso
    await db.insert(userProgress).values({
      userId: data.userId,
      courseId: data.courseId,
      currentLessonId: data.lessonId,
      completedLessons: 1,
      totalLessons: 200,
      progressPercentage: 0.5,
      totalPoints: xpEarned,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: new Date(),
      totalStudyMinutes: Math.round(data.timeSpentSeconds / 60),
    } as any);
  }

  // 3. Verificar e desbloquear conquistas
  await checkAndUnlockAchievements(data.userId);
}

/**
 * Busca todas as lições completadas por um usuário
 */
export async function getUserCompletedLessons(userId: number): Promise<CompletedLesson[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(completedLessons)
    .where(eq(completedLessons.userId, userId))
    .orderBy(desc(completedLessons.completedAt));
}

/**
 * Verifica se uma lição específica foi completada
 */
export async function isLessonCompleted(userId: number, lessonId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(completedLessons)
    .where(and(
      eq(completedLessons.userId, userId),
      eq(completedLessons.lessonId, lessonId)
    ))
    .limit(1);

  return result.length > 0;
}

/**
 * Busca estatísticas gerais do usuário
 */
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar todos os progressos do usuário
  const allProgress = await getUserAllProgress(userId);
  
  // Calcular totais
  const totalXp = allProgress.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
  const totalLessonsCompleted = allProgress.reduce((sum, p) => sum + (p.completedLessons || 0), 0);
  const totalTimeMinutes = allProgress.reduce((sum, p) => sum + (p.totalStudyMinutes || 0), 0);
  const currentStreak = Math.max(...allProgress.map(p => p.currentStreak || 0), 0);
  const longestStreak = Math.max(...allProgress.map(p => p.longestStreak || 0), 0);
  
  // Calcular nível baseado em XP (100 XP por nível)
  const level = Math.floor(totalXp / 100) + 1;
  const xpForNextLevel = (level * 100) - totalXp;

  return {
    totalXp,
    level,
    xpForNextLevel,
    totalLessonsCompleted,
    totalTimeMinutes,
    currentStreak,
    longestStreak,
    lastStudyDate: allProgress[0]?.lastStudyDate || null,
  };
}

/**
 * Verifica e desbloqueia conquistas baseado no progresso do usuário
 */
async function checkAndUnlockAchievements(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const stats = await getUserStats(userId);
  if (!stats) return;

  const allAchievements = await getAllAchievements();
  const userAchievementsList = await getUserAchievements(userId);
  const unlockedIds = new Set(userAchievementsList.map(ua => ua.achievement.id));

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.requirementType) {
      case 'lessons_completed':
        shouldUnlock = stats.totalLessonsCompleted >= (achievement.requirementValue || 0);
        break;
      case 'streak_days':
        shouldUnlock = stats.currentStreak >= (achievement.requirementValue || 0);
        break;
      case 'total_xp':
        shouldUnlock = stats.totalXp >= (achievement.requirementValue || 0);
        break;
      case 'study_time':
        shouldUnlock = stats.totalTimeMinutes >= (achievement.requirementValue || 0);
        break;
    }

    if (shouldUnlock) {
      await unlockAchievement(userId, achievement.id);
    }
  }
}

// ==========================================
// NOTIFICAÇÕES
// ==========================================

/**
 * Criar notificação para usuário
 */
export async function createNotification(data: {
  userId: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "achievement" | "new_lesson";
  relatedId?: number | null;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { notifications } = await import("../drizzle/schema");
  
  await dbInstance
    .insert(notifications)
    .values({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedId: data.relatedId || null,
      isRead: false,
      createdAt: new Date(),
    });

  // Buscar última notificação criada
  const [notification] = await dbInstance
    .select()
    .from(notifications)
    .where(eq(notifications.userId, data.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  return notification || null;
}

/**
 * Buscar notificações do usuário
 */
export async function getUserNotifications(userId: number, limit = 20) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { notifications } = await import("../drizzle/schema");
  
  const userNotifications = await dbInstance
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return userNotifications;
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(notificationId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { notifications } = await import("../drizzle/schema");
  
  await dbInstance
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  // Buscar notificação atualizada
  const [updated] = await dbInstance
    .select()
    .from(notifications)
    .where(eq(notifications.id, notificationId));

  return updated || null;
}

/**
 * Marcar todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return 0;

  const { notifications } = await import("../drizzle/schema");
  
  await dbInstance
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));

  // Retornar sucesso
  return 1;
}

/**
 * Contar notificações não lidas do usuário
 */
export async function getUnreadNotificationsCount(userId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return 0;

  const { notifications } = await import("../drizzle/schema");
  
  const result = await dbInstance
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));

  return result.length;
}

/**
 * Notificar todos os usuários sobre nova lição
 */
export async function notifyNewLesson(lessonId: number, lessonTitle: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return 0;

  const { users } = await import("../drizzle/schema");
  
  // Buscar todos os usuários ativos
  const allUsers = await dbInstance
    .select({ id: users.id })
    .from(users);

  let notifiedCount = 0;

  for (const u of allUsers) {
    await createNotification({
      userId: u.id,
      title: "Nova Lição Disponível! 🎉",
      message: `A lição "${lessonTitle}" acabou de ser adicionada. Comece agora!`,
      type: "new_lesson",
      relatedId: lessonId,
    });
    notifiedCount++;
  }

  return notifiedCount;
}


// ============================================================
// SISTEMA DE FEEDBACK BIDIRECIONAL COM IA (INVISÍVEL PARA USUÁRIOS)
// ============================================================

/**
 * Criar nova conversa entre admin e IA de melhorias
 */
export async function createAiAdminConversation(
  userId: number,
  data: {
    topic?: string;
    category?: "feature_request" | "bug_report" | "optimization" | "content_improvement" | "user_experience" | "ai_training" | "general";
    initialMessage: string;
  }
) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { aiAdminConversations, aiAdminMessages } = await import("../drizzle/schema");
  const { invokeLLM } = await import("./_core/llm");

  // Criar conversa
  const [conversation] = await dbInstance
    .insert(aiAdminConversations)
    .values({
      userId,
      topic: data.topic || "Conversa Geral",
      category: data.category || "general",
      status: "active",
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .$returningId();

  const conversationId = conversation.id;

  // Salvar mensagem inicial do admin
  await dbInstance.insert(aiAdminMessages).values({
    conversationId,
    role: "admin" as const,
    content: data.initialMessage,
    messageType: "feedback" as const,
  } as any);

  // Gerar resposta da IA
  const aiResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é uma IA especializada em análise e otimização de plataformas educacionais. Seu papel é ajudar o administrador da MultiLingue a melhorar continuamente o sistema de ensino de idiomas.

IMPORTANTE: Você é ANÔNIMA - nunca revele que é GPT-4, Claude ou qualquer modelo específico. Identifique-se apenas como "Sistema de Análise MultiLingue" ou "IA de Otimização".

Suas responsabilidades:
- Analisar feedbacks e sugestões do administrador
- Propor melhorias baseadas em dados e métricas
- Identificar padrões de uso e comportamento
- Sugerir otimizações de conteúdo e UX
- Ajudar a priorizar implementações
- Fornecer insights sobre engajamento de usuários

Seja objetiva, técnica e focada em resultados mensuráveis.`,
      },
      {
        role: "user",
        content: data.initialMessage,
      },
    ],
  });

  const aiContent = aiResponse.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

  // Salvar resposta da IA
  await dbInstance.insert(aiAdminMessages).values({
    conversationId,
    role: "ai" as const,
    content: aiContent,
    messageType: "analysis" as const,
  } as any);

  return {
    conversationId,
    initialMessage: data.initialMessage,
    aiResponse: aiContent,
  };
}

/**
 * Enviar mensagem em conversa existente
 */
export async function sendAiAdminMessage(
  conversationId: number,
  role: "admin" | "ai",
  content: string,
  messageType?: "feedback" | "suggestion" | "question" | "insight" | "analysis" | "recommendation"
) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { aiAdminMessages } = await import("../drizzle/schema");

  await dbInstance.insert(aiAdminMessages).values({
    conversationId,
    role,
    content,
    messageType: messageType || "feedback",
  } as any);

  // Buscar última mensagem criada
  const [message] = await dbInstance
    .select()
    .from(aiAdminMessages)
    .where(eq(aiAdminMessages.conversationId, conversationId))
    .orderBy(desc(aiAdminMessages.createdAt))
    .limit(1);

  return message || null;
}

/**
 * Obter resposta da IA baseada no histórico da conversa
 */
export async function getAiAdminResponse(conversationId: number, context?: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { aiAdminMessages } = await import("../drizzle/schema");
  const { invokeLLM } = await import("./_core/llm");

  // Buscar histórico de mensagens
  const messages = await dbInstance
    .select()
    .from(aiAdminMessages)
    .where(eq(aiAdminMessages.conversationId, conversationId))
    .orderBy(aiAdminMessages.createdAt);

  // Construir contexto para a IA
  const conversationHistory = messages.map(m => ({
    role: m.role === "admin" ? "user" as const : "assistant" as const,
    content: m.content,
  }));

  const systemPrompt = `Você é uma IA especializada em análise e otimização de plataformas educacionais. Seu papel é ajudar o administrador da MultiLingue a melhorar continuamente o sistema de ensino de idiomas.

IMPORTANTE: Você é ANÔNIMA - nunca revele que é GPT-4, Claude ou qualquer modelo específico. Identifique-se apenas como "Sistema de Análise MultiLingue" ou "IA de Otimização".

${context ? `\n\nContexto adicional: ${context}` : ""}

Seja objetiva, técnica e focada em resultados mensuráveis.`;

  const aiResponse = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ],
  });

  const aiContent = aiResponse.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

  // Salvar resposta da IA
  await dbInstance.insert(aiAdminMessages).values({
    conversationId,
    role: "ai" as const,
    content: aiContent,
    messageType: "analysis" as const,
  } as any);

  return {
    content: aiContent,
    conversationId,
  };
}

/**
 * Listar conversas do admin
 */
export async function listAiAdminConversations(
  userId: number,
  status?: "active" | "resolved" | "archived",
  limit = 20
) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { aiAdminConversations } = await import("../drizzle/schema");

  let query = dbInstance
    .select()
    .from(aiAdminConversations)
    .where(eq(aiAdminConversations.userId, userId))
    .orderBy(desc(aiAdminConversations.updatedAt))
    .limit(limit);

  if (status) {
    query = dbInstance
      .select()
      .from(aiAdminConversations)
      .where(
        and(
          eq(aiAdminConversations.userId, userId),
          eq(aiAdminConversations.status, status)
        )
      )
      .orderBy(desc(aiAdminConversations.updatedAt))
      .limit(limit);
  }

  return await query;
}

/**
 * Obter mensagens de uma conversa
 */
export async function getAiAdminMessages(conversationId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { aiAdminMessages } = await import("../drizzle/schema");

  return await dbInstance
    .select()
    .from(aiAdminMessages)
    .where(eq(aiAdminMessages.conversationId, conversationId))
    .orderBy(aiAdminMessages.createdAt);
}

/**
 * Marcar conversa como resolvida
 */
export async function resolveAiAdminConversation(conversationId: number, summary?: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { aiAdminConversations } = await import("../drizzle/schema");

  await dbInstance
    .update(aiAdminConversations)
    .set({
      status: "resolved",
      summary: summary || null,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(aiAdminConversations.id, conversationId));

  const [updated] = await dbInstance
    .select()
    .from(aiAdminConversations)
    .where(eq(aiAdminConversations.id, conversationId));

  return updated || null;
}

/**
 * Gerar insights automáticos baseados em métricas da plataforma
 */
export async function generateAiInsights() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { invokeLLM } = await import("./_core/llm");
  const { aiInsights } = await import("../drizzle/schema");

  // Coletar métricas da plataforma
  const totalUsers = await dbInstance.select().from(users);
  const totalLessons = await dbInstance.select().from(lessons);
  const completedLessonsData = await dbInstance.select().from(completedLessons);

  const metrics = {
    totalUsers: totalUsers.length,
    totalLessons: totalLessons.length,
    totalCompletions: completedLessonsData.length,
    averageCompletionRate: totalLessons.length > 0 ? (completedLessonsData.length / totalLessons.length) * 100 : 0,
  };

  // Pedir para IA analisar
  const aiResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é uma IA de análise de dados educacionais. Analise as métricas fornecidas e gere insights acionáveis.

IMPORTANTE: Você é ANÔNIMA - identifique-se apenas como "Sistema de Análise MultiLingue".

Retorne um JSON com este formato:
{
  "insights": [
    {
      "type": "user_behavior" | "content_gap" | "performance_issue" | "engagement_pattern" | "learning_effectiveness" | "system_optimization",
      "title": "Título curto",
      "description": "Descrição detalhada",
      "severity": "info" | "warning" | "critical",
      "recommendations": [
        {"action": "Ação específica", "priority": "low" | "medium" | "high", "estimatedImpact": "Descrição do impacto"}
      ]
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Analise estas métricas da plataforma MultiLingue:\n\n${JSON.stringify(metrics, null, 2)}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "insights_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "string" },
                        estimatedImpact: { type: "string" },
                      },
                      required: ["action", "priority", "estimatedImpact"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["type", "title", "description", "severity", "recommendations"],
                additionalProperties: false,
              },
            },
          },
          required: ["insights"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = aiResponse.choices[0]?.message?.content;
  const contentString = typeof messageContent === 'string' ? messageContent : '{"insights":[]}';
  const result = JSON.parse(contentString);

  // Salvar insights no banco
  const savedInsights = [];
  for (const insight of result.insights) {
    const [saved] = await dbInstance
      .insert(aiInsights)
      .values({
        insightType: insight.type as any,
        title: insight.title,
        description: insight.description,
        severity: insight.severity as any,
        status: "new",
        recommendations: insight.recommendations,
        metrics,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .$returningId();

    savedInsights.push(saved);
  }

  return savedInsights;
}

/**
 * Listar insights
 */
export async function listAiInsights(
  status?: "new" | "reviewed" | "in_progress" | "resolved" | "dismissed",
  severity?: "info" | "warning" | "critical",
  limit = 20
) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { aiInsights } = await import("../drizzle/schema");

  let conditions = [];
  if (status) conditions.push(eq(aiInsights.status, status));
  if (severity) conditions.push(eq(aiInsights.severity, severity));

  const query = conditions.length > 0
    ? dbInstance.select().from(aiInsights).where(and(...conditions)).orderBy(desc(aiInsights.createdAt)).limit(limit)
    : dbInstance.select().from(aiInsights).orderBy(desc(aiInsights.createdAt)).limit(limit);

  return await query;
}

/**
 * Revisar insight
 */
export async function reviewAiInsight(
  insightId: number,
  reviewerId: number,
  status: "reviewed" | "in_progress" | "resolved" | "dismissed",
  adminNotes?: string
) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { aiInsights } = await import("../drizzle/schema");

  await dbInstance
    .update(aiInsights)
    .set({
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      adminNotes: adminNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(aiInsights.id, insightId));

  const [updated] = await dbInstance
    .select()
    .from(aiInsights)
    .where(eq(aiInsights.id, insightId));

  return updated || null;
}

/**
 * Registrar melhoria implementada
 */
export async function recordSystemImprovement(
  implementedBy: number,
  data: {
    title: string;
    description: string;
    source: "admin_feedback" | "ai_suggestion" | "user_request" | "automated_analysis";
    sourceId?: number;
    category: string;
    impactArea?: string[];
  }
) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { systemImprovements } = await import("../drizzle/schema");

  const [improvement] = await dbInstance
    .insert(systemImprovements)
    .values({
      title: data.title,
      description: data.description,
      source: data.source,
      sourceId: data.sourceId || null,
      category: data.category,
      impactArea: data.impactArea || [],
      status: "planned",
      implementedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .$returningId();

  return improvement;
}

/**
 * Listar melhorias
 */
export async function listSystemImprovements(
  status?: "planned" | "in_progress" | "completed" | "rolled_back",
  limit = 20
) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { systemImprovements } = await import("../drizzle/schema");

  const query = status
    ? dbInstance.select().from(systemImprovements).where(eq(systemImprovements.status, status)).orderBy(desc(systemImprovements.createdAt)).limit(limit)
    : dbInstance.select().from(systemImprovements).orderBy(desc(systemImprovements.createdAt)).limit(limit);

  return await query;
}


// ============================================================
// GESTÃO FINANCEIRA E FISCAL
// ============================================================

/**
 * Registrar receita (pagamento recebido)
 */
export async function createRevenue(data: {
  source: "subscription" | "one_time_payment" | "refund" | "other";
  userId?: number;
  subscriptionId?: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  paymentMethod?: string;
  transactionId?: string;
  pagBankTransactionId?: string;
  status?: "pending" | "completed" | "failed" | "refunded";
  paidAt?: Date;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { revenues } = await import("../drizzle/schema");

  const [revenue] = await dbInstance
    .insert(revenues)
    .values({
      ...data,
      status: data.status || "completed",
      paidAt: data.paidAt || new Date(),
    })
    .$returningId();

  return revenue;
}

/**
 * Listar receitas
 */
export async function listRevenues(filters?: {
  status?: "pending" | "completed" | "failed" | "refunded";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { revenues } = await import("../drizzle/schema");

  let query = dbInstance.select().from(revenues);

  if (filters?.status) {
    query = query.where(eq(revenues.status, filters.status)) as any;
  }

  query = query.orderBy(desc(revenues.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  return await query;
}

/**
 * Criar despesa
 */
export async function createExpense(data: {
  category: "hosting" | "payment_gateway" | "domain" | "software" | "marketing" | "taxes" | "other";
  description: string;
  provider?: string;
  amount: number;
  isRecurring?: boolean;
  recurringFrequency?: "monthly" | "quarterly" | "yearly" | "one_time";
  nextDueDate?: Date;
  autoPayEnabled?: boolean;
  paymentMethod?: string;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  dueDate?: Date;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { expenses } = await import("../drizzle/schema");

  const [expense] = await dbInstance
    .insert(expenses)
    .values({
      ...data,
      status: data.status || "pending",
    })
    .$returningId();

  return expense;
}

/**
 * Listar despesas
 */
export async function listExpenses(filters?: {
  status?: "pending" | "paid" | "overdue" | "cancelled";
  category?: string;
  isRecurring?: boolean;
  limit?: number;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { expenses } = await import("../drizzle/schema");

  let query = dbInstance.select().from(expenses);

  if (filters?.status) {
    query = query.where(eq(expenses.status, filters.status)) as any;
  }

  query = query.orderBy(desc(expenses.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  return await query;
}

/**
 * Atualizar status de despesa
 */
export async function updateExpenseStatus(
  expenseId: number,
  status: "pending" | "paid" | "overdue" | "cancelled",
  receiptUrl?: string
) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { expenses } = await import("../drizzle/schema");

  await dbInstance
    .update(expenses)
    .set({
      status,
      paidAt: status === "paid" ? new Date() : undefined,
      receiptUrl: receiptUrl || undefined,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId));

  return { success: true };
}

/**
 * Listar configurações de pagamentos automáticos
 */
export async function listAutoPaymentConfigs(isActive?: boolean) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { autoPaymentConfigs } = await import("../drizzle/schema");

  let query = dbInstance.select().from(autoPaymentConfigs);

  if (isActive !== undefined) {
    query = query.where(eq(autoPaymentConfigs.isActive, isActive)) as any;
  }

  query = query.orderBy(autoPaymentConfigs.nextPaymentDate) as any;

  return await query;
}

/**
 * Processar pagamento automático
 */
export async function processAutoPayment(configId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { autoPaymentConfigs, expenses } = await import("../drizzle/schema");

  // Buscar configuração
  const [config] = await dbInstance
    .select()
    .from(autoPaymentConfigs)
    .where(eq(autoPaymentConfigs.id, configId))
    .limit(1);

  if (!config || !config.isActive) {
    return { success: false, message: "Configuração não encontrada ou inativa" };
  }

  // Criar despesa se houver expenseId vinculado
  if (config.expenseId) {
    await dbInstance
      .update(expenses)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, config.expenseId));
  }

  // Calcular próxima data de pagamento
  const nextDate = new Date(config.nextPaymentDate!);
  if (config.frequency === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (config.frequency === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (config.frequency === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  // Atualizar configuração
  await dbInstance
    .update(autoPaymentConfigs)
    .set({
      lastPaymentDate: new Date(),
      nextPaymentDate: nextDate,
      updatedAt: new Date(),
    })
    .where(eq(autoPaymentConfigs.id, configId));

  return { success: true, nextPaymentDate: nextDate };
}

/**
 * Calcular impostos do mês
 */
export async function calculateMonthlyTaxes(month: number, year: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { revenues, taxes } = await import("../drizzle/schema");

  // Buscar receitas do mês
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const monthRevenues = await dbInstance
    .select()
    .from(revenues)
    .where(
      and(
        eq(revenues.status, "completed"),
        gte(revenues.paidAt, startDate),
        lte(revenues.paidAt, endDate)
      )
    );

  const totalRevenue = monthRevenues.reduce((sum, rev) => sum + rev.netAmount, 0);

  // Calcular impostos (exemplo simplificado)
  const taxCalculations = [
    { type: "income_tax" as const, rate: 0.15, amount: Math.floor(totalRevenue * 0.15) },
    { type: "iss" as const, rate: 0.05, amount: Math.floor(totalRevenue * 0.05) },
  ];

  // Criar registros de impostos
  for (const tax of taxCalculations) {
    await dbInstance.insert(taxes).values({
      taxType: tax.type,
      referenceMonth: month,
      referenceYear: year,
      baseAmount: totalRevenue,
      taxRate: tax.rate,
      taxAmount: tax.amount,
      status: "calculated",
      dueDate: new Date(year, month, 20), // Vencimento dia 20 do mês seguinte
    });
  }

  return {
    totalRevenue,
    taxes: taxCalculations,
  };
}

/**
 * Gerar relatório financeiro mensal
 */
export async function generateMonthlyReport(month: number, year: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { revenues, expenses, taxes, financialReports, subscriptions } = await import("../drizzle/schema");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Receitas
  const monthRevenues = await dbInstance
    .select()
    .from(revenues)
    .where(
      and(
        eq(revenues.status, "completed"),
        gte(revenues.paidAt, startDate),
        lte(revenues.paidAt, endDate)
      )
    );

  const totalRevenue = monthRevenues.reduce((sum, rev) => sum + rev.grossAmount, 0);
  const totalFees = monthRevenues.reduce((sum, rev) => sum + rev.fees, 0);
  const netRevenue = monthRevenues.reduce((sum, rev) => sum + rev.netAmount, 0);

  // Despesas
  const monthExpenses = await dbInstance
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.status, "paid"),
        gte(expenses.paidAt, startDate),
        lte(expenses.paidAt, endDate)
      )
    );

  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Impostos
  const monthTaxes = await dbInstance
    .select()
    .from(taxes)
    .where(
      and(
        eq(taxes.referenceMonth, month),
        eq(taxes.referenceYear, year)
      )
    );

  const totalTaxes = monthTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);

  // Métricas de assinantes
  const activeSubscribers = await dbInstance
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  // Criar relatório
  const [report] = await dbInstance
    .insert(financialReports)
    .values({
      month,
      year,
      totalRevenue,
      totalFees,
      netRevenue,
      totalExpenses,
      totalTaxes,
      grossProfit: netRevenue - totalExpenses,
      netProfit: netRevenue - totalExpenses - totalTaxes,
      activeSubscribers: activeSubscribers.length,
      isFinalized: false,
    })
    .$returningId();

  return report;
}

/**
 * Listar relatórios financeiros
 */
export async function listFinancialReports(limit = 12) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { financialReports } = await import("../drizzle/schema");

  return await dbInstance
    .select()
    .from(financialReports)
    .orderBy(desc(financialReports.year), desc(financialReports.month))
    .limit(limit);
}

/**
 * Criar recibo digital
 */
export async function createReceipt(data: {
  receiptType: "payment_received" | "expense_payment" | "tax_payment" | "refund" | "other";
  revenueId?: number;
  expenseId?: number;
  taxId?: number;
  receiptNumber: string;
  description: string;
  amount: number;
  payer?: string;
  payee?: string;
  pdfUrl?: string;
  imageUrl?: string;
  issuedAt: Date;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { receipts } = await import("../drizzle/schema");

  const [receipt] = await dbInstance
    .insert(receipts)
    .values(data)
    .$returningId();

  return receipt;
}

/**
 * Buscar recibos
 */
export async function listReceipts(filters?: {
  receiptType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { receipts } = await import("../drizzle/schema");

  let query = dbInstance.select().from(receipts);

  query = query.orderBy(desc(receipts.issuedAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  return await query;
}


// ============================================================
// PROFESSORES VIRTUAIS
// ============================================================

/**
 * Buscar professor virtual por ID de idioma (retorna primeiro)
 */
export async function getVirtualTeacherByLanguage(languageId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { virtualTeachers } = await import("../drizzle/schema");

  const [teacher] = await dbInstance
    .select()
    .from(virtualTeachers)
    .where(eq(virtualTeachers.languageId, languageId))
    .limit(1);

  return teacher || null;
}

/**
 * Buscar TODOS os professores virtuais por ID de idioma
 */
export async function getVirtualTeachersByLanguage(languageId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { virtualTeachers } = await import("../drizzle/schema");

  return await dbInstance
    .select()
    .from(virtualTeachers)
    .where(eq(virtualTeachers.languageId, languageId))
    .orderBy(virtualTeachers.name);
}

/**
 * Listar todos os professores virtuais
 */
export async function listVirtualTeachers() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { virtualTeachers } = await import("../drizzle/schema");

  return await dbInstance
    .select()
    .from(virtualTeachers)
    .orderBy(virtualTeachers.name);
}


// ============================================================
// CLIPES EDUCACIONAIS
// ============================================================

/**
 * Listar todos os clipes educacionais
 */
export async function getAllVideoClips() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const { videoClips } = await import("../drizzle/schema");

  return await dbInstance
    .select()
    .from(videoClips)
    .orderBy(videoClips.createdAt);
}

/**
 * Buscar clipe por ID
 */
export async function getVideoClipById(clipId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { videoClips } = await import("../drizzle/schema");

  const [clip] = await dbInstance
    .select()
    .from(videoClips)
    .where(eq(videoClips.id, clipId))
    .limit(1);

  return clip || null;
}

/**
 * Inserir novo clipe
 */
export async function insertVideoClip(clipData: any) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const { videoClips } = await import("../drizzle/schema");

  const [result] = await dbInstance
    .insert(videoClips)
    .values(clipData);

  return result;
}

/**
 * Buscar todos os cursos
 */
export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses);
}

/**
 * Criar nova lição
 */
export async function createLesson(lessonData: {
  courseId: number;
  title: string;
  description?: string;
  content?: string;
  order?: number;
  duration?: number;
  xpReward?: number;
  languageCode?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(lessons).values({
    courseId: lessonData.courseId,
    title: lessonData.title,
    description: lessonData.description || null,
    content: lessonData.content || null,
    orderIndex: lessonData.order || 1,
    duration: lessonData.duration || 15,
    xpReward: lessonData.xpReward || 10,
    languageCode: lessonData.languageCode || 'en',
  } as any);
  return (result as any)?.insertId || null;
}

/**
 * Inserir exercício
 */
export async function insertExercise(exerciseData: {
  lessonId: number | null;
  type: string;
  question: string;
  correctAnswer: string;
  options?: string;
  orderIndex?: number;
  xpReward?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(exercises).values({
    lessonId: exerciseData.lessonId,
    type: exerciseData.type as any,
    question: exerciseData.question,
    correctAnswer: exerciseData.correctAnswer,
    options: exerciseData.options ? JSON.parse(exerciseData.options) : null,
    orderIndex: exerciseData.orderIndex || 1,
    xpReward: exerciseData.xpReward || 5,
  } as any);
  return (result as any)?.insertId || null;
}

export async function getVirtualTeacherById(teacherId: number) {
  const db = await getDb();
  if (!db) return null;
  const { virtualTeachers } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(virtualTeachers)
    .where(eq(virtualTeachers.id, teacherId))
    .limit(1);
  return result[0] || null;
}
