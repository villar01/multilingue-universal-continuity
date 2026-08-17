import { generateAI } from "../aiProvider";
import { isInitialCommercialTargetLanguage } from "../../shared/commercialLanguageBlocks";
import { getSecureSceneSeed } from "./secureSceneSeeds";

export type LocalizedSceneDialogueTurn = {
  targetText: string;
  nativeHelp: string;
};

export type LocalizedSceneVocabularyObject = {
  targetText: string;
  nativeHelp: string;
};

export type LocalizedSceneMaterialResult = {
  status: "ready" | "planned_language_block" | "localization_unavailable" | "invalid_localization";
  turns: LocalizedSceneDialogueTurn[];
  objects: LocalizedSceneVocabularyObject[];
};

function languageBase(languageCode: string): string {
  return languageCode.trim().toLowerCase().split("-")[0] || "";
}

/**
 * Reviewed launch material remains server-only. It gives PT-BR learners a
 * deterministic beach scene in four commercial target languages while the
 * protected local generator continues to cover other authorized pairs/scenes.
 */
const PT_BR_BEACH_LAUNCH_MATERIAL: Record<string, Omit<LocalizedSceneMaterialResult, "status">> = {
  es: {
    turns: [
      { targetText: "¡Hola! Bienvenido a esta hermosa playa tropical.", nativeHelp: "Olá! Bem-vindo a esta linda praia tropical." },
      { targetText: "El océano es azul y la arena está cálida.", nativeHelp: "O oceano é azul e a areia está quente." },
      { targetText: "Mira la palmera cerca de la playa.", nativeHelp: "Olhe a palmeira perto da praia." },
    ],
    objects: [
      { targetText: "palmera", nativeHelp: "palmeira" },
      { targetText: "océano", nativeHelp: "oceano" },
      { targetText: "arena", nativeHelp: "areia" },
      { targetText: "ola", nativeHelp: "onda" },
    ],
  },
  fr: {
    turns: [
      { targetText: "Bonjour ! Bienvenue sur cette belle plage tropicale.", nativeHelp: "Olá! Bem-vindo a esta linda praia tropical." },
      { targetText: "L’océan est bleu et le sable est chaud.", nativeHelp: "O oceano é azul e a areia está quente." },
      { targetText: "Regarde le palmier près de la plage.", nativeHelp: "Olhe a palmeira perto da praia." },
    ],
    objects: [
      { targetText: "palmier", nativeHelp: "palmeira" },
      { targetText: "océan", nativeHelp: "oceano" },
      { targetText: "sable", nativeHelp: "areia" },
      { targetText: "vague", nativeHelp: "onda" },
    ],
  },
  it: {
    turns: [
      { targetText: "Ciao! Benvenuto in questa splendida spiaggia tropicale.", nativeHelp: "Olá! Bem-vindo a esta linda praia tropical." },
      { targetText: "L’oceano è blu e la sabbia è calda.", nativeHelp: "O oceano é azul e a areia está quente." },
      { targetText: "Guarda la palma vicino alla spiaggia.", nativeHelp: "Olhe a palmeira perto da praia." },
    ],
    objects: [
      { targetText: "palma", nativeHelp: "palmeira" },
      { targetText: "oceano", nativeHelp: "oceano" },
      { targetText: "sabbia", nativeHelp: "areia" },
      { targetText: "onda", nativeHelp: "onda" },
    ],
  },
  de: {
    turns: [
      { targetText: "Hallo! Willkommen an diesem wunderschönen tropischen Strand.", nativeHelp: "Olá! Bem-vindo a esta linda praia tropical." },
      { targetText: "Der Ozean ist blau und der Sand ist warm.", nativeHelp: "O oceano é azul e a areia está quente." },
      { targetText: "Schau dir die Palme am Strand an.", nativeHelp: "Olhe a palmeira perto da praia." },
    ],
    objects: [
      { targetText: "Palme", nativeHelp: "palmeira" },
      { targetText: "Ozean", nativeHelp: "oceano" },
      { targetText: "Sand", nativeHelp: "areia" },
      { targetText: "Welle", nativeHelp: "onda" },
    ],
  },
};

const PT_BR_FAMILY_HOME_LAUNCH_MATERIAL: Record<string, Omit<LocalizedSceneMaterialResult, "status">> = {
  es: {
    turns: [
      { targetText: "¿Quién está en tu familia?", nativeHelp: "Quem está na sua família?" },
      { targetText: "Tengo una mamá, un papá y una hermana.", nativeHelp: "Tenho uma mãe, um pai e uma irmã." },
      { targetText: "Veo un sofá, una televisión y una mesa.", nativeHelp: "Vejo um sofá, uma televisão e uma mesa." },
    ],
    objects: [
      { targetText: "sofá", nativeHelp: "sofá" },
      { targetText: "televisión", nativeHelp: "televisão" },
      { targetText: "mesa", nativeHelp: "mesa" },
      { targetText: "cocina", nativeHelp: "cozinha" },
    ],
  },
  fr: {
    turns: [
      { targetText: "Qui y a-t-il dans ta famille ?", nativeHelp: "Quem está na sua família?" },
      { targetText: "J’ai une maman, un papa et une sœur.", nativeHelp: "Tenho uma mãe, um pai e uma irmã." },
      { targetText: "Je vois un canapé, une télévision et une table.", nativeHelp: "Vejo um sofá, uma televisão e uma mesa." },
    ],
    objects: [
      { targetText: "canapé", nativeHelp: "sofá" },
      { targetText: "télévision", nativeHelp: "televisão" },
      { targetText: "table", nativeHelp: "mesa" },
      { targetText: "cuisine", nativeHelp: "cozinha" },
    ],
  },
  it: {
    turns: [
      { targetText: "Chi c’è nella tua famiglia?", nativeHelp: "Quem está na sua família?" },
      { targetText: "Ho una mamma, un papà e una sorella.", nativeHelp: "Tenho uma mãe, um pai e uma irmã." },
      { targetText: "Vedo un divano, una televisione e un tavolo.", nativeHelp: "Vejo um sofá, uma televisão e uma mesa." },
    ],
    objects: [
      { targetText: "divano", nativeHelp: "sofá" },
      { targetText: "televisione", nativeHelp: "televisão" },
      { targetText: "tavolo", nativeHelp: "mesa" },
      { targetText: "cucina", nativeHelp: "cozinha" },
    ],
  },
  de: {
    turns: [
      { targetText: "Wer ist in deiner Familie?", nativeHelp: "Quem está na sua família?" },
      { targetText: "Ich habe eine Mutter, einen Vater und eine Schwester.", nativeHelp: "Tenho uma mãe, um pai e uma irmã." },
      { targetText: "Ich sehe ein Sofa, einen Fernseher und einen Tisch.", nativeHelp: "Vejo um sofá, uma televisão e uma mesa." },
    ],
    objects: [
      { targetText: "Sofa", nativeHelp: "sofá" },
      { targetText: "Fernseher", nativeHelp: "televisão" },
      { targetText: "Tisch", nativeHelp: "mesa" },
      { targetText: "Küche", nativeHelp: "cozinha" },
    ],
  },
};

function getReviewedLaunchSceneMaterial(input: {
  sceneId: string;
  targetLanguage: string;
  nativeLanguage: string;
}): Omit<LocalizedSceneMaterialResult, "status"> | null {
  if (languageBase(input.nativeLanguage) !== "pt") return null;
  const materialsByScene: Record<string, Record<string, Omit<LocalizedSceneMaterialResult, "status">>> = {
    beach: PT_BR_BEACH_LAUNCH_MATERIAL,
    family_home: PT_BR_FAMILY_HOME_LAUNCH_MATERIAL,
  };
  return materialsByScene[input.sceneId]?.[languageBase(input.targetLanguage)] || null;
}

function parseLocalizedEntries(content: unknown, min: number, max: number): LocalizedSceneDialogueTurn[] | null {
  if (!Array.isArray(content) || content.length < min || content.length > max) return null;
  const entries = content.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const candidate = entry as Record<string, unknown>;
    const targetText = typeof candidate.targetText === "string" ? candidate.targetText.trim() : "";
    const nativeHelp = typeof candidate.nativeHelp === "string" ? candidate.nativeHelp.trim() : "";
    return targetText && nativeHelp ? { targetText, nativeHelp } : null;
  });
  return entries.some((entry) => entry === null) ? null : entries as LocalizedSceneDialogueTurn[];
}

export function parseLocalizedSceneMaterial(content: string): Omit<LocalizedSceneMaterialResult, "status"> | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Record<string, unknown>;
    const turns = parseLocalizedEntries(candidate.turns, 2, 4);
    const objects = parseLocalizedEntries(candidate.objects, 3, 8);
    return turns && objects ? { turns, objects } : null;
  } catch {
    return null;
  }
}

/**
 * Produces a small, scene-specific dialogue only after the existing lesson access
 * check has passed in the curriculum router. The native language is never limited,
 * while target content is released only for the six commercial launch languages.
 */
export async function localizeSceneDialogue(input: {
  sceneId: string;
  targetLanguage: string;
  nativeLanguage: string;
  userId: number;
}): Promise<LocalizedSceneMaterialResult> {
  if (!isInitialCommercialTargetLanguage(input.targetLanguage)) {
    return { status: "planned_language_block", turns: [], objects: [] };
  }

  const reviewedLaunchMaterial = getReviewedLaunchSceneMaterial(input);
  if (reviewedLaunchMaterial) return { status: "ready", ...reviewedLaunchMaterial };

  const canonicalSeed = getSecureSceneSeed(input.sceneId);
  const canonicalContext = canonicalSeed
    ? `Use this canonical source material for semantic fidelity: ${JSON.stringify(canonicalSeed)}.`
    : "Use an age-appropriate original scene pack without borrowing content from another scene.";

  try {
    const response = await generateAI({
      messages: [
        {
          role: "system",
          content: "You create short, safe A1 language-learning scene materials. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Create a small A1 material pack for the learning scene "${input.sceneId}". The target language is ${input.targetLanguage}; the native learner support language is ${input.nativeLanguage}. Use only these two languages. ${canonicalContext} Return a JSON object with: "turns" (2 to 4 concise dialogue turns) and "objects" (3 to 8 visible everyday vocabulary objects). Every item must contain targetText and nativeHelp. Keep every item suitable for all ages.`,
        },
      ],
      temperature: 0,
      max_tokens: 1200,
      preferredProvider: "ollama",
      useCache: true,
      userId: input.userId,
    });
    const material = parseLocalizedSceneMaterial(response.content);
    return material ? { status: "ready", ...material } : { status: "invalid_localization", turns: [], objects: [] };
  } catch {
    return { status: "localization_unavailable", turns: [], objects: [] };
  }
}
