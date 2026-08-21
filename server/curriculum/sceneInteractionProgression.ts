export type SceneDifficulty = "beginner" | "intermediate" | "advanced";
export type PedagogicalLevel = "initial" | "intermediate" | "advanced" | "technological";

export type InteractionStage =
  | "concept"
  | "guided_practice"
  | "student_response"
  | "feedback"
  | "transfer";

export type SceneInteractionProgression = {
  difficulty: SceneDifficulty;
  stages: readonly InteractionStage[];
  responseMode: "choice_or_repeat" | "guided_sentence" | "open_scenario";
  correctionDepth: "direct" | "structured" | "contextual";
  requiresCompatibleTeacherMedia: true;
};

export type PedagogicalLevelContract = {
  level: PedagogicalLevel;
  responseExpectation: "recognize" | "compose" | "negotiate" | "solve_authentic_multistep_task";
  passageEvidence: readonly string[];
  requiresApprovedUnit: boolean;
};

const COMMON_STAGES = [
  "concept",
  "guided_practice",
  "student_response",
  "feedback",
  "transfer",
] as const satisfies readonly InteractionStage[];

const PROGRESSION_BY_DIFFICULTY: Record<SceneDifficulty, SceneInteractionProgression> = {
  beginner: {
    difficulty: "beginner",
    stages: COMMON_STAGES,
    responseMode: "choice_or_repeat",
    correctionDepth: "direct",
    requiresCompatibleTeacherMedia: true,
  },
  intermediate: {
    difficulty: "intermediate",
    stages: COMMON_STAGES,
    responseMode: "guided_sentence",
    correctionDepth: "structured",
    requiresCompatibleTeacherMedia: true,
  },
  advanced: {
    difficulty: "advanced",
    stages: COMMON_STAGES,
    responseMode: "open_scenario",
    correctionDepth: "contextual",
    requiresCompatibleTeacherMedia: true,
  },
};

const PEDAGOGICAL_LEVEL_BY_DIFFICULTY: Record<SceneDifficulty, PedagogicalLevel> = {
  beginner: "initial",
  intermediate: "intermediate",
  advanced: "advanced",
};

const PEDAGOGICAL_LEVEL_CONTRACTS: Record<PedagogicalLevel, PedagogicalLevelContract> = {
  initial: {
    level: "initial",
    responseExpectation: "recognize",
    passageEvidence: ["reconhece conceito", "repete ou escolhe resposta guiada"],
    requiresApprovedUnit: false,
  },
  intermediate: {
    level: "intermediate",
    responseExpectation: "compose",
    passageEvidence: ["monta frase guiada", "aplica correção estruturada"],
    requiresApprovedUnit: false,
  },
  advanced: {
    level: "advanced",
    responseExpectation: "negotiate",
    passageEvidence: ["responde em cenário aberto", "ajusta registro e contexto"],
    requiresApprovedUnit: false,
  },
  technological: {
    level: "technological",
    responseExpectation: "solve_authentic_multistep_task",
    passageEvidence: ["resolve tarefa técnica autêntica", "justifica escolhas em contexto profissional"],
    requiresApprovedUnit: true,
  },
};

export function resolveSceneInteractionProgression(
  difficulty: SceneDifficulty,
): SceneInteractionProgression {
  return PROGRESSION_BY_DIFFICULTY[difficulty];
}

export function resolvePedagogicalLevel(difficulty: SceneDifficulty): PedagogicalLevel {
  return PEDAGOGICAL_LEVEL_BY_DIFFICULTY[difficulty];
}

export function resolvePedagogicalLevelContract(
  level: PedagogicalLevel,
): PedagogicalLevelContract {
  return PEDAGOGICAL_LEVEL_CONTRACTS[level];
}
