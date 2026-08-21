export type SceneDifficulty = "beginner" | "intermediate" | "advanced";

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

export function resolveSceneInteractionProgression(
  difficulty: SceneDifficulty,
): SceneInteractionProgression {
  return PROGRESSION_BY_DIFFICULTY[difficulty];
}
