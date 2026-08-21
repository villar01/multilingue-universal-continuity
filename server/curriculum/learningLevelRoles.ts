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
  averageMastery: null;
  masteryStatus: "awaiting_assessed_responses";
  meetsMasteryThreshold: boolean;
  evidenceStatus: "not_collected";
  canUnlockCurriculum: false;
}

export function derivePedagogicalReadiness(input: Partial<{
  completedLessons: number | null;
  totalPoints: number | null;
}>): PedagogicalReadiness {
  const completedLessons = Math.max(0, input.completedLessons ?? 0);
  const observedLessonBand: Exclude<PedagogicalLevel, "technological"> = completedLessons <= 10
    ? "initial"
    : completedLessons <= 35
      ? "intermediate"
      : "advanced";

  // O esquema atual preserva lições concluídas e pontos de motivação, mas ainda
  // não persiste respostas avaliadas por evidência. Portanto, nenhum desses
  // campos pode declarar domínio ou passagem curricular.
  const currentLevel: Exclude<PedagogicalLevel, "technological"> = "initial";
  const nextLevel: PedagogicalLevel | null = "intermediate";

  return {
    currentLevel,
    nextLevel,
    observedLessonBand,
    completedLessons,
    averageMastery: null,
    masteryStatus: "awaiting_assessed_responses",
    meetsMasteryThreshold: false,
    evidenceStatus: "not_collected",
    canUnlockCurriculum: false,
  };
}
