import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const gamificationRouter = router({
  // Obter estatísticas do usuário
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Buscar ou criar estatísticas
    let stats = await (await db.getDb())!.execute(`SELECT * FROM user_stats WHERE user_id = ${userId}`);

    if ((stats as any).length === 0 || !(stats as any).length) {
      // Criar estatísticas iniciais
      await (await db.getDb())!.execute(`INSERT INTO user_stats (user_id, total_xp, current_level, streak_days, last_activity_date, lessons_completed, exercises_completed, words_learned, pronunciation_avg_score)
         VALUES (${userId}, 0, 1, 0, CURDATE(), 0, 0, 0, 0)`);

      stats = await (await db.getDb())!.execute(`SELECT * FROM user_stats WHERE user_id = ${userId}`);
    }

    return stats[0];
  }),

  // Adicionar XP e atualizar nível
  addXP: protectedProcedure
    .input(z.object({ xp: z.number().min(1), type: z.enum(['exercise', 'lesson', 'achievement']) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Buscar estatísticas atuais
      const stats = await (await db.getDb())!.execute(`SELECT * FROM user_stats WHERE user_id = ${userId}`);

      if ((stats as any).length === 0 || !(stats as any).length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Estatísticas do usuário não encontradas',
        });
      }

      const currentStats = stats[0] as any;
      const newTotalXP = currentStats.total_xp + input.xp;

      // Calcular novo nível (100 XP por nível)
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      // Atualizar streak se for um novo dia
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = currentStats.last_activity_date;
      let newStreakDays = currentStats.streak_days;

      if (lastActivityDate) {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Dia consecutivo
          newStreakDays += 1;
        } else if (diffDays > 1) {
          // Quebrou a sequência
          newStreakDays = 1;
        }
        // Se diffDays === 0, já estudou hoje, mantém streak
      } else {
        newStreakDays = 1;
      }

      // Atualizar estatísticas
      await (await db.getDb())!.execute(`UPDATE user_stats 
         SET total_xp = ${newTotalXP}, current_level = ${newLevel}, streak_days = ${newStreakDays}, last_activity_date = ${today}
         WHERE user_id = ${userId}`);

      // Verificar conquistas desbloqueadas
      await checkAndUnlockAchievements(userId);

      return {
        totalXP: newTotalXP,
        level: newLevel,
        streakDays: newStreakDays,
        xpGained: input.xp,
        leveledUp: newLevel > currentStats.current_level,
      };
    }),

  // Registrar conclusão de lição
  completeLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Incrementar contador de lições
      await (await db.getDb())!.execute(`UPDATE user_stats SET lessons_completed = lessons_completed + 1 WHERE user_id = ${userId}`);

      // Adicionar XP
      const result = await (ctx as any).trpc?.gamification.addXP({ xp: 50, type: 'lesson' });

      // Verificar conquistas
      await checkAndUnlockAchievements(userId);

      return result;
    }),

  // Registrar conclusão de exercício
  completeExercise: protectedProcedure
    .input(z.object({ exerciseId: z.number(), correct: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (input.correct) {
        // Incrementar contador de exercícios
        await (await db.getDb())!.execute(`UPDATE user_stats SET exercises_completed = exercises_completed + 1 WHERE user_id = ${userId}`);

        // Adicionar XP
        const result = await (ctx as any).trpc?.gamification.addXP({ xp: 10, type: 'exercise' });

        // Verificar conquistas
        await checkAndUnlockAchievements(userId);

        return result;
      }

      return { totalXP: 0, level: 0, streakDays: 0, xpGained: 0, leveledUp: false };
    }),

  // Registrar palavra aprendida
  learnWord: protectedProcedure
    .input(z.object({ word: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Incrementar contador de palavras
      await (await db.getDb())!.execute(`UPDATE user_stats SET words_learned = words_learned + 1 WHERE user_id = ${userId}`);

      // Verificar conquistas
      await checkAndUnlockAchievements(userId);

      return { success: true };
    }),

  // Atualizar pontuação de pronúncia
  updatePronunciationScore: protectedProcedure
    .input(z.object({ score: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Buscar pontuação atual
      const stats = await (await db.getDb())!.execute(`SELECT pronunciation_avg_score, exercises_completed FROM user_stats WHERE user_id = ${userId}`);

      if (stats.length > 0) {
        const currentStats = stats[0] as any;
        const currentAvg = currentStats.pronunciation_avg_score || 0;
        const totalExercises = currentStats.exercises_completed || 1;

        // Calcular nova média
        const newAvg = ((currentAvg * totalExercises) + input.score) / (totalExercises + 1);

        await (await db.getDb())!.execute(`UPDATE user_stats SET pronunciation_avg_score = ${newAvg} WHERE user_id = ${userId}`);

        // Verificar conquistas
        await checkAndUnlockAchievements(userId);

        return { averageScore: newAvg };
      }

      return { averageScore: 0 };
    }),

  // Listar todas as conquistas
  listAchievements: publicProcedure.query(async () => {
    const achievements = await (await db.getDb())!.execute(
      `SELECT * FROM achievements ORDER BY requirement_value ASC`
    );

    return achievements;
  }),

  // Listar conquistas do usuário
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userAchievements = await (await db.getDb())!.execute(`SELECT a.*, ua.unlocked_at 
       FROM achievements a
       INNER JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ${userId}
       ORDER BY ua.unlocked_at DESC`);

    return userAchievements;
  }),

  // Obter ranking de usuários
  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      const leaderboard = await (await db.getDb())!.execute(`SELECT u.id, u.name, us.total_xp, us.current_level, us.streak_days
         FROM user_stats us
         INNER JOIN users u ON us.user_id = u.id
         ORDER BY us.total_xp DESC
         LIMIT ${input.limit}`);

      return leaderboard;
    }),
});

// Função auxiliar para verificar e desbloquear conquistas
async function checkAndUnlockAchievements(userId: number) {
  // Buscar estatísticas do usuário
  const stats = await (await db.getDb())!.execute(`SELECT * FROM user_stats WHERE user_id = ${userId}`);

  if ((stats as any).length === 0 || !(stats as any).length) return;

  const userStats = stats[0] as any;

  // Buscar todas as conquistas
  const achievements = await (await db.getDb())!.execute(
    `SELECT * FROM achievements`
  );

  // Buscar conquistas já desbloqueadas
  const unlockedAchievements = await (await db.getDb())!.execute(`SELECT achievement_id FROM user_achievements WHERE user_id = ${userId}`);

  const unlockedIds = unlockedAchievements.map((ua: any) => ua.achievement_id);

  // Verificar cada conquista
  for (const achievement of achievements as any[]) {
    if (unlockedIds.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.requirement_type) {
      case 'lessons':
        shouldUnlock = userStats.lessons_completed >= achievement.requirement_value;
        break;
      case 'exercises':
        shouldUnlock = userStats.exercises_completed >= achievement.requirement_value;
        break;
      case 'streak':
        shouldUnlock = userStats.streak_days >= achievement.requirement_value;
        break;
      case 'words':
        shouldUnlock = userStats.words_learned >= achievement.requirement_value;
        break;
      case 'pronunciation':
        shouldUnlock = userStats.pronunciation_avg_score >= achievement.requirement_value;
        break;
    }

    if (shouldUnlock) {
      // Desbloquear conquista
      await (await db.getDb())!.execute(`INSERT INTO user_achievements (user_id, achievement_id) VALUES (${userId}, ${achievement.id})`);

      // Adicionar XP de recompensa
      await (await db.getDb())!.execute(`UPDATE user_stats SET total_xp = total_xp + ${achievement.xp_reward} WHERE user_id = ${userId}`);
    }
  }
}
