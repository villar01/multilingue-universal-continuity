import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";

export const gamificationUIRouter = router({
  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return [
        { rank: 1, userName: "João Silva", totalXP: 15000, lessonsCompleted: 120, currentStreak: 45, badge: "👑" },
        { rank: 2, userName: "Maria Santos", totalXP: 12500, lessonsCompleted: 95, currentStreak: 32, badge: "🏆" },
        { rank: 3, userName: "Carlos Oliveira", totalXP: 10200, lessonsCompleted: 78, currentStreak: 28, badge: "🥉" },
      ].slice(0, input.limit);
    }),

  userRank: protectedProcedure
    .query(async ({ ctx }) => {
      return { rank: Math.floor(Math.random() * 1000) + 1, userId: ctx.user.id };
    }),

  weeklyChallenges: protectedProcedure
    .query(async () => {
      return [
        { id: "1", title: "Aprendiz Diligente", description: "Complete 10 lições", objective: 10, reward: 500, progress: 7, completed: false },
        { id: "2", title: "Consistência é Chave", description: "Mantenha 7 dias", objective: 7, reward: 750, progress: 5, completed: false },
        { id: "3", title: "Poliglota em Ação", description: "Aprenda 3 idiomas", objective: 3, reward: 600, progress: 2, completed: false },
        { id: "4", title: "Mestre da Pronúncia", description: "5 exercícios", objective: 5, reward: 400, progress: 3, completed: false },
      ];
    }),

  completeChallenge: protectedProcedure
    .input(z.object({ challengeId: z.string() }))
    .mutation(async ({ input }) => {
      return { success: true, xpReward: 500, message: "Desafio completo!" };
    }),

  referralCode: protectedProcedure
    .query(async ({ ctx }) => {
      const code = `ML${ctx.user.id.toString().slice(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      return { code, referralsCount: 5, totalXPEarned: 1500 };
    }),

  applyReferral: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      return { success: true, xpReward: 100, message: "Código aplicado!" };
    }),

  notifications: protectedProcedure
    .query(async () => {
      return [
        { id: "1", type: "achievement", title: "🏅 Conquista", message: "10 lições! +500 XP", icon: "🎉", timestamp: new Date(), read: false },
        { id: "2", type: "milestone", title: "🎯 Milestone", message: "5 referências! +500 XP", icon: "⭐", timestamp: new Date(Date.now() - 3600000), read: false },
      ];
    }),

  dismissNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});
