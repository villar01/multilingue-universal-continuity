import {
  resolvePedagogicalLevel,
  resolveSceneInteractionProgression,
  type SceneDifficulty,
  type InteractionStage,
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

const STAGE_GUIDANCE_BY_DIFFICULTY: Record<SceneDifficulty, Record<InteractionStage, string>> = {
  beginner: {
    concept: "Observe a palavra ou estrutura e ouça o modelo do professor.",
    guided_practice: "Repita ou escolha a forma indicada com apoio do exemplo.",
    student_response: "Dê uma resposta curta usando a estrutura praticada.",
    feedback: "Compare sua resposta com a correção direta e tente novamente se necessário.",
    transfer: "Use a mesma estrutura em um objeto ou situação visível da cena.",
  },
  intermediate: {
    concept: "Identifique a estrutura e o contexto que orientam a escolha da frase.",
    guided_practice: "Monte uma frase guiada com as palavras-chave apresentadas.",
    student_response: "Responda com uma frase completa e acrescente um detalhe relevante.",
    feedback: "Aplique a correção estruturada, ajustando forma e contexto da resposta.",
    transfer: "Reformule a ideia para uma situação semelhante da cena.",
  },
  advanced: {
    concept: "Observe a intenção, o registro e as pistas de contexto antes de responder.",
    guided_practice: "Planeje uma resposta com apoio dos elementos relevantes, sem copiar o modelo.",
    student_response: "Responda em cenário aberto, justificando ou negociando sua escolha quando necessário.",
    feedback: "Ajuste precisão, registro e contexto a partir da correção contextual.",
    transfer: "Transfira a ideia para uma situação nova e explique por que sua formulação funciona.",
  },
};

export function getScenePedagogicalDelivery(sceneId: string) {
  const difficulty = SCENE_DIFFICULTY_BY_ID[sceneId];
  if (!difficulty) return null;

  const interaction = resolveSceneInteractionProgression(difficulty);
  return {
    difficulty,
    pedagogicalLevel: resolvePedagogicalLevel(difficulty),
    stages: interaction.stages.map((stage) => ({
      id: stage,
      label: STAGE_LABELS[stage],
      guidance: STAGE_GUIDANCE_BY_DIFFICULTY[difficulty][stage],
    })),
    responseMode: interaction.responseMode,
    correctionDepth: interaction.correctionDepth,
    requiresCompatibleTeacherMedia: interaction.requiresCompatibleTeacherMedia,
    focus: FOCUS_BY_DIFFICULTY[difficulty],
  };
}
