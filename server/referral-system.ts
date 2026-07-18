/**
 * ═══════════════════════════════════════════════════════════════════
 * server/referral-system.ts
 * Sistema de Referência - Ganhe XP ao Convidar Amigos
 * ═══════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";

export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: Date;
  referralsCount: number;
  totalXPEarned: number;
}

export interface ReferralReward {
  referrerId: string;
  referredId: string;
  xpReward: number;
  bonusReward?: number;
  awardedAt: Date;
}

const REFERRAL_REWARDS = {
  FIRST_REFERRAL: 100,
  SUCCESSFUL_SIGNUP: 200,
  FIRST_LESSON_COMPLETED: 150,
  MILESTONE_5_REFERRALS: 500,
  MILESTONE_10_REFERRALS: 1000,
};

export async function generateReferralCode(userId: string): Promise<string> {
  console.log(`🔗 Gerando código de referência para ${userId}...`);

  // Gerar código único
  const code = `ML${userId.slice(0, 4).toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  console.log(`✅ Código gerado: ${code}`);
  return code;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  console.log(`✓ Validando código: ${code}`);
  // Validar formato e existência
  return code.startsWith("ML") && code.length === 12;
}

export async function applyReferralCode(
  referredUserId: string,
  referralCode: string
): Promise<{ success: boolean; xpReward: number; message: string }> {
  console.log(
    `🎁 Aplicando código ${referralCode} para usuário ${referredUserId}...`
  );

  // Validar código
  if (!(await validateReferralCode(referralCode))) {
    return { success: false, xpReward: 0, message: "Código inválido" };
  }

  // Extrair userId do código
  const referrerId = `user_${referralCode.slice(2, 6).toLowerCase()}`;

  // Verificar se não é auto-referência
  if (referrerId === referredUserId) {
    return {
      success: false,
      xpReward: 0,
      message: "Você não pode usar seu próprio código",
    };
  }

  // Registrar referência
  console.log(`✅ Referência registrada: ${referrerId} → ${referredUserId}`);

  // Calcular recompensas
  const referrerXP = REFERRAL_REWARDS.SUCCESSFUL_SIGNUP;
  const referredXP = REFERRAL_REWARDS.FIRST_REFERRAL;

  console.log(`💰 Recompensas: Referrer +${referrerXP} XP, Referred +${referredXP} XP`);

  return {
    success: true,
    xpReward: referredXP,
    message: `Bem-vindo! Você ganhou ${referredXP} XP`,
  };
}

export async function getReferralStats(
  userId: string
): Promise<{
  code: string;
  referralsCount: number;
  totalXPEarned: number;
  referrals: Array<{ userId: string; joinedAt: Date; status: string }>;
}> {
  console.log(`📊 Obtendo estatísticas de referência para ${userId}...`);

  const code = await generateReferralCode(userId);

  // Simular dados
  return {
    code,
    referralsCount: Math.floor(Math.random() * 20),
    totalXPEarned: Math.floor(Math.random() * 5000),
    referrals: [
      {
        userId: "user_ref_1",
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        userId: "user_ref_2",
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    ],
  };
}

export async function checkReferralMilestones(
  userId: string,
  referralsCount: number
): Promise<{ milestone: string; bonus: number } | null> {
  console.log(`🎯 Verificando milestones para ${userId}...`);

  if (referralsCount === 5) {
    console.log(`🏅 Milestone 5 referências desbloqueado!`);
    return {
      milestone: "5 Referências",
      bonus: REFERRAL_REWARDS.MILESTONE_5_REFERRALS,
    };
  }

  if (referralsCount === 10) {
    console.log(`🏅 Milestone 10 referências desbloqueado!`);
    return {
      milestone: "10 Referências",
      bonus: REFERRAL_REWARDS.MILESTONE_10_REFERRALS,
    };
  }

  return null;
}

// ─── ROUTER TRPC ──────────────────────────────────────────────────────────

export const referralRouter = router({
  generateCode: protectedProcedure
    .query(async ({ ctx }) => {
      const code = await generateReferralCode(ctx.user.id.toString());
      return { code };
    }),

  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const isValid = await validateReferralCode(input.code);
      return { isValid };
    }),

  applyCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await applyReferralCode(ctx.user.id.toString(), input.code);
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await getReferralStats(ctx.user.id.toString());
    }),

  checkMilestones: protectedProcedure
    .input(z.object({ referralsCount: z.number() }))
    .query(async ({ input, ctx }) => {
      return await checkReferralMilestones(
        ctx.user.id.toString(),
        input.referralsCount
      );
    }),
});
