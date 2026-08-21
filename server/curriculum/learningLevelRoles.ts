import { PEDAGOGICAL_LEVEL_PASSAGE, type PedagogicalLevel } from "./pedagogicalLevelPassage";

export type LearningLevelMetric = "lesson_band" | "gamification_xp" | "pedagogical_passage";

export interface LearningLevelRole {
  metric: LearningLevelMetric;
  purpose: string;
  canUnlockCurriculum: boolean;
}

export const LEARNING_LEVEL_ROLES: Record<LearningLevelMetric, LearningLevelRole> = {
  lesson_band: {
    metric: "lesson_band",
    purpose: "Adaptar a faixa CEFR e a dificuldade de atividades a partir de lições concluídas.",
    canUnlockCurriculum: false,
  },
  gamification_xp: {
    metric: "gamification_xp",
    purpose: "Exibir progresso motivacional e conquistas sem representar domínio pedagógico.",
    canUnlockCurriculum: false,
  },
  pedagogical_passage: {
    metric: "pedagogical_passage",
    purpose: "Determinar passagem curricular somente com domínio e evidências exigidas pelo nível.",
    canUnlockCurriculum: true,
  },
};

export function canUseLevelForCurriculumUnlock(metric: LearningLevelMetric): boolean {
  return LEARNING_LEVEL_ROLES[metric].canUnlockCurriculum;
}

export function describePedagogicalLevel(level: PedagogicalLevel): LearningLevelRole {
  return {
    ...LEARNING_LEVEL_ROLES.pedagogical_passage,
    purpose: `Passagem pedagógica protegida para o nível ${level}.`,
  };
}

export interface PedagogicalReadiness {
  currentLevel: Exclude<PedagogicalLevel, "technological">;
  nextLevel: PedagogicalLevel | null;
  observedLessonBand: Exclude<PedagogicalLevel, "technological">;
  completedLessons: number;
  averageMastery: number | null;
  masteryStatus: "awaiting_assessed_responses" | "derived_from_srs";
  meetsMasteryThreshold: boolean;
  evidenceStatus: "not_collected";
  canUnlockCurriculum: false;
}

export function derivePedagogicalReadiness(input: Partial<{
  completedLessons: number | null;
  totalPoints: number | null;
  srsCorrect: number | null;
  srsTotal: number | null;
}>): PedagogicalReadiness {
  const completedLessons = Math.max(0, input.completedLessons ?? 0);
  const observedLessonBand: Exclude<PedagogicalLevel, "technological"> = completedLessons <= 10
    ? "initial"
    : completedLessons <= 35
      ? "intermediate"
      : "advanced";

  // Domínio derivado do SRS: somente respostas registradas pelo servidor podem
  // contribuir para a medição de domínio. XP e lições concluídas não alteram
  // o nível pedagógico nem liberam currículo.
  const srsCorrect = Math.max(0, input.srsCorrect ?? 0);
  const srsTotal = Math.max(0, input.srsTotal ?? 0);
  const averageMastery: number | null = srsTotal >= 5
    ? Math.round((srsCorrect / srsTotal) * 100) / 100
    : null;
  const masteryStatus: "awaiting_assessed_responses" | "derived_from_srs" = srsTotal >= 5
    ? "derived_from_srs"
    : "awaiting_assessed_responses";

  const currentLevel: Exclude<PedagogicalLevel, "technological"> = "initial";
  const nextLevel: PedagogicalLevel | null = "intermediate";

  return {
    currentLevel,
    nextLevel,
    observedLessonBand,
    completedLessons,
    averageMastery,
    masteryStatus,
    meetsMasteryThreshold: false, // passagem curricular ainda requer evidências além do domínio SRS
    evidenceStatus: "not_collected",
    canUnlockCurriculum: false,
  };
}
