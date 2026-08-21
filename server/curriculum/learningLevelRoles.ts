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
  completedLessons: number;
  averageMastery: number;
  meetsMasteryThreshold: boolean;
  evidenceStatus: "pending_verification";
  canUnlockCurriculum: false;
}

export function derivePedagogicalReadiness(input: Partial<{
  completedLessons: number | null;
  totalPoints: number | null;
}>): PedagogicalReadiness {
  const completedLessons = Math.max(0, input.completedLessons ?? 0);
  const totalPoints = Math.max(0, input.totalPoints ?? 0);
  const averageMastery = completedLessons > 0
    ? Math.min(1, totalPoints / completedLessons / 100)
    : 0;

  const currentLevel: Exclude<PedagogicalLevel, "technological"> = completedLessons <= 10
    ? "initial"
    : completedLessons <= 35
      ? "intermediate"
      : "advanced";
  const nextLevel: PedagogicalLevel | null = currentLevel === "initial"
    ? "intermediate"
    : currentLevel === "intermediate"
      ? "advanced"
      : "technological";
  const nextContract = nextLevel ? PEDAGOGICAL_LEVEL_PASSAGE[nextLevel] : null;

  return {
    currentLevel,
    nextLevel,
    completedLessons,
    averageMastery: Number(averageMastery.toFixed(3)),
    meetsMasteryThreshold: nextContract ? averageMastery >= nextContract.minimumMastery : false,
    evidenceStatus: "pending_verification",
    canUnlockCurriculum: false,
  };
}
