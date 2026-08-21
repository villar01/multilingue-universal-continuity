import {
  resolvePedagogicalLevel,
  resolveSceneInteractionProgression,
  type SceneDifficulty,
} from "./sceneInteractionProgression";

const SCENE_DIFFICULTY_BY_ID: Record<string, SceneDifficulty> = Object.fromEntries([
  ...["paris", "beach", "kitchen", "restaurant", "supermarket", "school", "park", "cinema", "library", "cafe", "family_home"].map((id) => [id, "beginner"]),
  ...["forest", "newyork", "airport", "hotel", "hospital", "mountain", "farm", "gym", "office", "metro", "port", "spa", "airport_family"].map((id) => [id, "intermediate"]),
  ...["tokyo", "desert", "museum", "medieval", "garden"].map((id) => [id, "advanced"]),
]) as Record<string, SceneDifficulty>;

const STAGE_LABELS = {
  concept: "Conceito",
  guided_practice: "Prática guiada",
  student_response: "Sua resposta",
  feedback: "Correção",
  transfer: "Aplicação",
} as const;

const FOCUS_BY_DIFFICULTY: Record<SceneDifficulty, string> = {
  beginner: "Reconheça o conceito, repita a estrutura e escolha uma resposta curta antes de criar sua própria frase.",
  intermediate: "Monte uma frase guiada, responda com mais contexto e aplique a correção em uma situação próxima.",
  advanced: "Responda em cenário aberto, ajuste registro e contexto e transfira a ideia para uma nova situação.",
};

export function getScenePedagogicalDelivery(sceneId: string) {
  const difficulty = SCENE_DIFFICULTY_BY_ID[sceneId];
  if (!difficulty) return null;

  const interaction = resolveSceneInteractionProgression(difficulty);
  return {
    difficulty,
    pedagogicalLevel: resolvePedagogicalLevel(difficulty),
    stages: interaction.stages.map((stage) => ({ id: stage, label: STAGE_LABELS[stage] })),
    responseMode: interaction.responseMode,
    correctionDepth: interaction.correctionDepth,
    requiresCompatibleTeacherMedia: interaction.requiresCompatibleTeacherMedia,
    focus: FOCUS_BY_DIFFICULTY[difficulty],
  };
}
