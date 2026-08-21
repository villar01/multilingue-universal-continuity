import type { PedagogicalLevel } from "./pedagogicalLevelPassage";

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
