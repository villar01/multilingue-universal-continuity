/**
 * Script para popular conquistas no banco de dados
 * Executar: NODE_ENV=development tsx server/seed-achievements.ts
 */

import { getDb } from "./db";
import { achievements } from "../drizzle/schema";

const ACHIEVEMENTS_DATA = [
  {
    name: "Primeiro Passo",
    description: "Complete sua primeira lição",
    icon: "🎯",
    category: "lessons",
    requirementType: "lessons_completed",
    requirementValue: 1,
    pointsReward: 10,
    badgeUrl: null,
  },
  {
    name: "Estudante Dedicado",
    description: "Complete 10 lições",
    icon: "📚",
    category: "lessons",
    requirementType: "lessons_completed",
    requirementValue: 10,
    pointsReward: 50,
    badgeUrl: null,
  },
  {
    name: "Mestre do Conhecimento",
    description: "Complete 50 lições",
    icon: "🎓",
    category: "lessons",
    requirementType: "lessons_completed",
    requirementValue: 50,
    pointsReward: 200,
    badgeUrl: null,
  },
  {
    name: "Especialista",
    description: "Complete 100 lições",
    icon: "👑",
    category: "lessons",
    requirementType: "lessons_completed",
    requirementValue: 100,
    pointsReward: 500,
    badgeUrl: null,
  },
  {
    name: "Sequência de 3 Dias",
    description: "Estude por 3 dias consecutivos",
    icon: "🔥",
    category: "streak",
    requirementType: "streak_days",
    requirementValue: 3,
    pointsReward: 30,
    badgeUrl: null,
  },
  {
    name: "Sequência de 7 Dias",
    description: "Estude por 7 dias consecutivos",
    icon: "⚡",
    category: "streak",
    requirementType: "streak_days",
    requirementValue: 7,
    pointsReward: 100,
    badgeUrl: null,
  },
  {
    name: "Sequência de 30 Dias",
    description: "Estude por 30 dias consecutivos",
    icon: "💎",
    category: "streak",
    requirementType: "streak_days",
    requirementValue: 30,
    pointsReward: 500,
    badgeUrl: null,
  },
  {
    name: "Iniciante Motivado",
    description: "Acumule 100 XP",
    icon: "⭐",
    category: "points",
    requirementType: "total_xp",
    requirementValue: 100,
    pointsReward: 20,
    badgeUrl: null,
  },
  {
    name: "Colecionador de XP",
    description: "Acumule 500 XP",
    icon: "🌟",
    category: "points",
    requirementType: "total_xp",
    requirementValue: 500,
    pointsReward: 100,
    badgeUrl: null,
  },
  {
    name: "Mestre dos Pontos",
    description: "Acumule 1000 XP",
    icon: "✨",
    category: "points",
    requirementType: "total_xp",
    requirementValue: 1000,
    pointsReward: 200,
    badgeUrl: null,
  },
  {
    name: "Maratonista",
    description: "Estude por 60 minutos no total",
    icon: "⏱️",
    category: "time",
    requirementType: "study_time",
    requirementValue: 60,
    pointsReward: 50,
    badgeUrl: null,
  },
  {
    name: "Estudante Persistente",
    description: "Estude por 300 minutos no total",
    icon: "🏃",
    category: "time",
    requirementType: "study_time",
    requirementValue: 300,
    pointsReward: 150,
    badgeUrl: null,
  },
  {
    name: "Perfeccionista",
    description: "Complete uma lição com 100% de acerto",
    icon: "💯",
    category: "pronunciation",
    requirementType: "perfect_score",
    requirementValue: 1,
    pointsReward: 100,
    badgeUrl: null,
  },
];

async function seedAchievements() {
  console.log("🎯 Iniciando seed de conquistas...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Erro: Banco de dados não disponível");
    process.exit(1);
  }

  try {
    // Verificar se já existem conquistas
    const existing = await db.select().from(achievements);
    
    if (existing.length > 0) {
      console.log(`⚠️  Já existem ${existing.length} conquistas no banco.`);
      console.log("   Deseja continuar? (Isso pode criar duplicatas)");
      // Para este script, vamos apenas adicionar se não existir
      console.log("   Pulando seed de conquistas.");
      return;
    }

    // Inserir conquistas
    for (const achievement of ACHIEVEMENTS_DATA) {
      await db.insert(achievements).values(achievement as any);
      console.log(`✅ Conquista criada: ${achievement.name}`);
    }

    console.log(`\n🎉 Seed concluído! ${ACHIEVEMENTS_DATA.length} conquistas criadas.`);
    
  } catch (error) {
    console.error("❌ Erro ao popular conquistas:", error);
    process.exit(1);
  }
}

// Executar seed
seedAchievements()
  .then(() => {
    console.log("\n✅ Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
