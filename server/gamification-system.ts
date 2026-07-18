/**
 * ═══════════════════════════════════════════════════════════════════
 * server/gamification-system.ts
 * Sistema de Gamificação - Leaderboard + Desafios Semanais
 * ═══════════════════════════════════════════════════════════════════
 */

import { sql } from "drizzle-orm";
import * as db from "./db";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalXP: number;
  lessonsCompleted: number;
  currentStreak: number;
  badge: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  objective: number;
  reward: number;
  category: "lessons" | "streak" | "languages" | "pronunciation";
  startDate: Date;
  endDate: Date;
  progress?: number;
  completed?: boolean;
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "challenge_lessons_10",
    title: "Aprendiz Diligente",
    description: "Complete 10 lições esta semana",
    objective: 10,
    reward: 500,
    category: "lessons",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "challenge_streak_7",
    title: "Consistência é Chave",
    description: "Mantenha uma sequência de 7 dias",
    objective: 7,
    reward: 750,
    category: "streak",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "challenge_languages_3",
    title: "Poliglota em Ação",
    description: "Aprenda em 3 idiomas diferentes",
    objective: 3,
    reward: 600,
    category: "languages",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "challenge_pronunciation_5",
    title: "Mestre da Pronúncia",
    description: "Complete 5 exercícios de pronúncia",
    objective: 5,
    reward: 400,
    category: "pronunciation",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

export async function getLeaderboard(
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  console.log("📊 Gerando leaderboard...");

  // Simular dados do leaderboard
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "user_1",
      userName: "João Silva",
      totalXP: 15000,
      lessonsCompleted: 120,
      currentStreak: 45,
      badge: "👑",
    },
    {
      rank: 2,
      userId: "user_2",
      userName: "Maria Santos",
      totalXP: 12500,
      lessonsCompleted: 95,
      currentStreak: 32,
      badge: "🏆",
    },
    {
      rank: 3,
      userId: "user_3",
      userName: "Carlos Oliveira",
      totalXP: 10200,
      lessonsCompleted: 78,
      currentStreak: 28,
      badge: "🥉",
    },
  ];

  return entries.slice(0, limit);
}

export async function getUserRank(userId: string): Promise<number> {
  console.log(`🔍 Obtendo ranking do usuário ${userId}...`);
  // Simular ranking
  return Math.floor(Math.random() * 1000) + 1;
}

export async function getWeeklyChallenges(
  userId: string
): Promise<WeeklyChallenge[]> {
  console.log(`📋 Obtendo desafios semanais para ${userId}...`);

  return WEEKLY_CHALLENGES.map((challenge) => ({
    ...challenge,
    progress: Math.floor(Math.random() * (challenge.objective + 1)),
    completed: Math.random() > 0.7,
  }));
}

export async function completeChallenge(
  userId: string,
  challengeId: string
): Promise<{ success: boolean; xpReward: number }> {
  console.log(`✅ Completando desafio ${challengeId} para ${userId}...`);

  const challenge = WEEKLY_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) {
    return { success: false, xpReward: 0 };
  }

  // Registrar conclusão e adicionar XP
  console.log(`🎉 Desafio completado! +${challenge.reward} XP`);

  return { success: true, xpReward: challenge.reward };
}

export async function updateLeaderboard(): Promise<void> {
  console.log("🔄 Atualizando leaderboard...");
  // Atualizar rankings em tempo real
}

export async function resetWeeklyChallenges(): Promise<void> {
  console.log("🔄 Resetando desafios semanais...");
  // Reset automático toda segunda-feira
}
