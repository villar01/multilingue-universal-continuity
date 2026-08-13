import { inArray } from "drizzle-orm";
import { achievements } from "../drizzle/schema";
import { getDb } from "./db";

export const GAMIFICATION_CATALOG = [
  { name: "Primeira Lição", description: "Complete sua primeira lição.", icon: "📘", category: "lessons", requirementType: "lessons", requirementValue: 1, pointsReward: 50 },
  { name: "Estudante Dedicado", description: "Complete 10 lições.", icon: "⭐", category: "lessons", requirementType: "lessons", requirementValue: 10, pointsReward: 150 },
  { name: "Mestre das Lições", description: "Complete 50 lições.", icon: "🏆", category: "lessons", requirementType: "lessons", requirementValue: 50, pointsReward: 500 },
  { name: "Primeiro Exercício", description: "Conclua um exercício corretamente.", icon: "🎯", category: "exercises", requirementType: "exercises", requirementValue: 1, pointsReward: 25 },
  { name: "Prática Consistente", description: "Conclua 25 exercícios corretamente.", icon: "🧩", category: "exercises", requirementType: "exercises", requirementValue: 25, pointsReward: 200 },
  { name: "Semana de Estudo", description: "Mantenha uma sequência de 7 dias.", icon: "🔥", category: "streak", requirementType: "streak", requirementValue: 7, pointsReward: 300 },
  { name: "Mês de Dedicação", description: "Mantenha uma sequência de 30 dias.", icon: "🌟", category: "streak", requirementType: "streak", requirementValue: 30, pointsReward: 1000 },
  { name: "Vocabulário Inicial", description: "Registre 50 palavras aprendidas.", icon: "🗂️", category: "words", requirementType: "words", requirementValue: 50, pointsReward: 100 },
  { name: "Vocabulário em Expansão", description: "Registre 250 palavras aprendidas.", icon: "🌍", category: "words", requirementType: "words", requirementValue: 250, pointsReward: 500 },
  { name: "Pronúncia Clara", description: "Alcance média de 85% em pronúncia.", icon: "🎙️", category: "pronunciation", requirementType: "pronunciation", requirementValue: 85, pointsReward: 200 },
  { name: "Mil Pontos", description: "Acumule 1.000 XP registrados.", icon: "⚡", category: "points", requirementType: "points", requirementValue: 1000, pointsReward: 250 },
] as const;

export async function ensureGamificationCatalog() {
  const database = await getDb();
  if (!database) return [];
  const names = GAMIFICATION_CATALOG.map((achievement) => achievement.name);
  const existing = await database.select({ name: achievements.name }).from(achievements).where(inArray(achievements.name, names));
  const existingNames = new Set(existing.map((achievement) => achievement.name));
  const missing = GAMIFICATION_CATALOG.filter((achievement) => !existingNames.has(achievement.name));
  if (missing.length > 0) await database.insert(achievements).values(missing);
  return missing;
}
