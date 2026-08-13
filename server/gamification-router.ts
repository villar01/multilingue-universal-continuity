import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { achievements, userAchievements, userStats, users } from "../drizzle/schema";
import * as db from "./db";
import { ensureGamificationCatalog } from "./gamification-catalog";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

type UserStatsRecord = typeof userStats.$inferSelect;

async function requireDatabase() {
  const database = await db.getDb();
  if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });
  return database;
}

async function getOrCreateUserStats(userId: number): Promise<UserStatsRecord> {
  const database = await requireDatabase();
  const [existing] = await database.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  if (existing) return existing;

  await database.insert(userStats).values({ userId, lastActivityDate: new Date() }).onDuplicateKeyUpdate({
    set: { updatedAt: new Date() },
  });
  const [created] = await database.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível inicializar as estatísticas" });
  return created;
}

function dateKey(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function nextStreak(current: UserStatsRecord, today: string) {
  const previous = dateKey(current.lastActivityDate);
  if (!previous) return 1;
  if (previous === today) return current.streakDays;
  const elapsedDays = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86_400_000);
  return elapsedDays === 1 ? current.streakDays + 1 : 1;
}

function achievementSatisfied(achievement: typeof achievements.$inferSelect, stats: UserStatsRecord) {
  switch (achievement.requirementType) {
    case "lessons": return stats.lessonsCompleted >= achievement.requirementValue;
    case "exercises": return stats.exercisesCompleted >= achievement.requirementValue;
    case "streak": return stats.streakDays >= achievement.requirementValue;
    case "words": return stats.wordsLearned >= achievement.requirementValue;
    case "pronunciation": return stats.pronunciationAvgScore >= achievement.requirementValue;
    case "points": return stats.totalXp >= achievement.requirementValue;
    default: return false;
  }
}

async function checkAndUnlockAchievements(userId: number) {
  const database = await requireDatabase();
  await ensureGamificationCatalog();
  const stats = await getOrCreateUserStats(userId);
  const catalogue = await database.select().from(achievements);
  const unlocked = await database.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId));
  const unlockedIds = new Set(unlocked.map((item) => item.achievementId));
  const newlyUnlocked = catalogue.filter((achievement) => !unlockedIds.has(achievement.id) && achievementSatisfied(achievement, stats));

  if (newlyUnlocked.length === 0) return [];

  await database.insert(userAchievements).values(newlyUnlocked.map((achievement) => ({ userId, achievementId: achievement.id }))).onDuplicateKeyUpdate({
    set: { unlockedAt: new Date() },
  });
  const reward = newlyUnlocked.reduce((sum, achievement) => sum + (achievement.pointsReward || 0), 0);
  if (reward > 0) {
    const totalXp = stats.totalXp + reward;
    await database.update(userStats).set({ totalXp, currentLevel: Math.floor(totalXp / 100) + 1 }).where(eq(userStats.userId, userId));
  }
  return newlyUnlocked;
}

async function awardXp(userId: number, xp: number) {
  const database = await requireDatabase();
  const current = await getOrCreateUserStats(userId);
  const today = new Date().toISOString().slice(0, 10);
  const totalXp = current.totalXp + xp;
  const streakDays = nextStreak(current, today);
  const currentLevel = Math.floor(totalXp / 100) + 1;
  await database.update(userStats).set({ totalXp, currentLevel, streakDays, lastActivityDate: new Date(`${today}T00:00:00.000Z`) }).where(eq(userStats.userId, userId));
  await checkAndUnlockAchievements(userId);
  return { totalXP: totalXp, level: currentLevel, streakDays, xpGained: xp, leveledUp: currentLevel > current.currentLevel };
}

export const gamificationRouter = router({
  getStats: protectedProcedure.query(({ ctx }) => getOrCreateUserStats(ctx.user.id)),

  addXP: protectedProcedure
    .input(z.object({ xp: z.number().min(1), type: z.enum(["exercise", "lesson", "achievement"]) }))
    .mutation(({ ctx, input }) => awardXp(ctx.user.id, input.xp)),

  completeLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx }) => {
      const database = await requireDatabase();
      const stats = await getOrCreateUserStats(ctx.user.id);
      await database.update(userStats).set({ lessonsCompleted: stats.lessonsCompleted + 1 }).where(eq(userStats.userId, ctx.user.id));
      return awardXp(ctx.user.id, 50);
    }),

  completeExercise: protectedProcedure
    .input(z.object({ exerciseId: z.number(), correct: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.correct) return { totalXP: 0, level: 0, streakDays: 0, xpGained: 0, leveledUp: false };
      const database = await requireDatabase();
      const stats = await getOrCreateUserStats(ctx.user.id);
      await database.update(userStats).set({ exercisesCompleted: stats.exercisesCompleted + 1 }).where(eq(userStats.userId, ctx.user.id));
      return awardXp(ctx.user.id, 10);
    }),

  learnWord: protectedProcedure
    .input(z.object({ word: z.string().min(1).max(200) }))
    .mutation(async ({ ctx }) => {
      const database = await requireDatabase();
      const stats = await getOrCreateUserStats(ctx.user.id);
      await database.update(userStats).set({ wordsLearned: stats.wordsLearned + 1 }).where(eq(userStats.userId, ctx.user.id));
      await checkAndUnlockAchievements(ctx.user.id);
      return { success: true };
    }),

  updatePronunciationScore: protectedProcedure
    .input(z.object({ score: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDatabase();
      const stats = await getOrCreateUserStats(ctx.user.id);
      const completed = Math.max(stats.exercisesCompleted, 1);
      const pronunciationAvgScore = ((stats.pronunciationAvgScore * completed) + input.score) / (completed + 1);
      await database.update(userStats).set({ pronunciationAvgScore }).where(eq(userStats.userId, ctx.user.id));
      await checkAndUnlockAchievements(ctx.user.id);
      return { averageScore: pronunciationAvgScore };
    }),

  listAchievements: publicProcedure.query(async () => {
    const database = await requireDatabase();
    await ensureGamificationCatalog();
    return database.select().from(achievements).orderBy(achievements.requirementValue);
  }),

  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    const database = await requireDatabase();
    return database.select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      category: achievements.category,
      requirementType: achievements.requirementType,
      requirementValue: achievements.requirementValue,
      pointsReward: achievements.pointsReward,
      unlockedAt: userAchievements.unlockedAt,
    }).from(userAchievements).innerJoin(achievements, eq(achievements.id, userAchievements.achievementId)).where(eq(userAchievements.userId, ctx.user.id)).orderBy(desc(userAchievements.unlockedAt));
  }),

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      const database = await requireDatabase();
      return database.select({ id: users.id, name: users.name, totalXp: userStats.totalXp, currentLevel: userStats.currentLevel, streakDays: userStats.streakDays }).from(userStats).innerJoin(users, eq(users.id, userStats.userId)).orderBy(desc(userStats.totalXp)).limit(input.limit);
    }),
});
