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

const PT_BR_AIRPORT_FAMILY_LAUNCH_MATERIAL: Record<string, Omit<LocalizedSceneMaterialResult, "status">> = {
  es: {
    turns: [
      { targetText: "La familia va de vacaciones. ¿Adónde van?", nativeHelp: "A família vai de férias. Para onde eles vão?" },
      { targetText: "Van a Londres.", nativeHelp: "Eles vão para Londres." },
      { targetText: "Disculpe, ¿dónde está la puerta B12?", nativeHelp: "Com licença, onde fica o portão B12?" },
    ],
    objects: [
      { targetText: "pasaporte", nativeHelp: "passaporte" },
      { targetText: "maleta", nativeHelp: "mala" },
      { targetText: "tarjeta de embarque", nativeHelp: "cartão de embarque" },
      { targetText: "puerta", nativeHelp: "portão" },
    ],
  },
  fr: {
    turns: [
      { targetText: "La famille part en vacances. Où va-t-elle ?", nativeHelp: "A família vai de férias. Para onde eles vão?" },
      { targetText: "Elle va à Londres.", nativeHelp: "Eles vão para Londres." },
      { targetText: "Excusez-moi, où se trouve la porte B12 ?", nativeHelp: "Com licença, onde fica o portão B12?" },
    ],
    objects: [
      { targetText: "passeport", nativeHelp: "passaporte" },
      { targetText: "valise", nativeHelp: "mala" },
      { targetText: "carte d’embarquement", nativeHelp: "cartão de embarque" },
      { targetText: "porte", nativeHelp: "portão" },
    ],
  },
  it: {
    turns: [
      { targetText: "La famiglia va in vacanza. Dove va?", nativeHelp: "A família vai de férias. Para onde eles vão?" },
      { targetText: "Va a Londra.", nativeHelp: "Eles vão para Londres." },
      { targetText: "Mi scusi, dov’è il gate B12?", nativeHelp: "Com licença, onde fica o portão B12?" },
    ],
    objects: [
      { targetText: "passaporto", nativeHelp: "passaporte" },
      { targetText: "valigia", nativeHelp: "mala" },
      { targetText: "carta d’imbarco", nativeHelp: "cartão de embarque" },
      { targetText: "gate", nativeHelp: "portão" },
    ],
  },
  de: {
    turns: [
      { targetText: "Die Familie fährt in den Urlaub. Wohin fährt sie?", nativeHelp: "A família vai de férias. Para onde eles vão?" },
      { targetText: "Sie fährt nach London.", nativeHelp: "Eles vão para Londres." },
      { targetText: "Entschuldigung, wo ist Gate B12?", nativeHelp: "Com licença, onde fica o portão B12?" },
    ],
    objects: [
      { targetText: "Reisepass", nativeHelp: "passaporte" },
      { targetText: "Koffer", nativeHelp: "mala" },
      { targetText: "Bordkarte", nativeHelp: "cartão de embarque" },
      { targetText: "Gate", nativeHelp: "portão" },
    ],
  },
};

const PT_BR_CAFE_LAUNCH_MATERIAL: Record<string, Omit<LocalizedSceneMaterialResult, "status">> = {
  es: {
    turns: [
      { targetText: "¡Hola! Bienvenido al café. ¿Qué quieres pedir?", nativeHelp: "Olá! Bem-vindo ao café. O que você quer pedir?" },
      { targetText: "Un café y un cruasán, por favor.", nativeHelp: "Um café e um croissant, por favor." },
      { targetText: "El café está caliente y el cruasán está fresco.", nativeHelp: "O café está quente e o croissant está fresco." },
    ],
    objects: [
      { targetText: "café", nativeHelp: "café" },
      { targetText: "cruasán", nativeHelp: "croissant" },
      { targetText: "camarero", nativeHelp: "garçom" },
      { targetText: "terraza", nativeHelp: "terraço" },
    ],
  },
  fr: {
    turns: [
      { targetText: "Bonjour ! Bienvenue au café. Que voulez-vous commander ?", nativeHelp: "Olá! Bem-vindo ao café. O que você quer pedir?" },
      { targetText: "Un café et un croissant, s’il vous plaît.", nativeHelp: "Um café e um croissant, por favor." },
      { targetText: "Le café est chaud et le croissant est frais.", nativeHelp: "O café está quente e o croissant está fresco." },
    ],
    objects: [
      { targetText: "café", nativeHelp: "café" },
      { targetText: "croissant", nativeHelp: "croissant" },
      { targetText: "serveur", nativeHelp: "garçom" },
      { targetText: "terrasse", nativeHelp: "terraço" },
    ],
  },
  it: {
    turns: [
      { targetText: "Ciao! Benvenuto al bar. Che cosa desideri ordinare?", nativeHelp: "Olá! Bem-vindo ao café. O que você quer pedir?" },
      { targetText: "Un caffè e un cornetto, per favore.", nativeHelp: "Um café e um croissant, por favor." },
      { targetText: "Il caffè è caldo e il cornetto è fresco.", nativeHelp: "O café está quente e o croissant está fresco." },
    ],
    objects: [
      { targetText: "caffè", nativeHelp: "café" },
      { targetText: "cornetto", nativeHelp: "croissant" },
      { targetText: "cameriere", nativeHelp: "garçom" },
      { targetText: "terrazza", nativeHelp: "terraço" },
    ],
  },
  de: {
    turns: [
      { targetText: "Hallo! Willkommen im Café. Was möchten Sie bestellen?", nativeHelp: "Olá! Bem-vindo ao café. O que você quer pedir?" },
      { targetText: "Einen Kaffee und ein Croissant, bitte.", nativeHelp: "Um café e um croissant, por favor." },
      { targetText: "Der Kaffee ist heiß und das Croissant ist frisch.", nativeHelp: "O café está quente e o croissant está fresco." },
    ],
    objects: [
      { targetText: "Kaffee", nativeHelp: "café" },
      { targetText: "Croissant", nativeHelp: "croissant" },
      { targetText: "Kellner", nativeHelp: "garçom" },
      { targetText: "Terrasse", nativeHelp: "terraço" },
    ],
  },
};

const PT_BR_RESTAURANT_LAUNCH_MATERIAL: Record<string, Omit<LocalizedSceneMaterialResult, "status">> = {
  es: {
    turns: [
      { targetText: "¡Bienvenido al restaurante! ¿Puedo ver el menú?", nativeHelp: "Bem-vindo ao restaurante! Posso ver o cardápio?" },
      { targetText: "Quiero pasta con salsa de tomate, por favor.", nativeHelp: "Quero massa com molho de tomate, por favor." },
      { targetText: "La mesa está limpia y la vela ilumina el restaurante.", nativeHelp: "A mesa está limpa e a vela ilumina o restaurante." },
    ],
    objects: [
      { targetText: "pasta", nativeHelp: "massa" },
      { targetText: "vino", nativeHelp: "vinho" },
      { targetText: "mesa", nativeHelp: "mesa" },
      { targetText: "vela", nativeHelp: "vela" },
    ],
  },
  fr: {
    turns: [
      { targetText: "Bienvenue au restaurant ! Puis-je voir le menu ?", nativeHelp: "Bem-vindo ao restaurante! Posso ver o cardápio?" },
      { targetText: "Je voudrais des pâtes avec de la sauce tomate, s’il vous plaît.", nativeHelp: "Quero massa com molho de tomate, por favor." },
      { targetText: "La table est propre et la bougie éclaire le restaurant.", nativeHelp: "A mesa está limpa e a vela ilumina o restaurante." },
    ],
    objects: [
      { targetText: "pâtes", nativeHelp: "massa" },
      { targetText: "vin", nativeHelp: "vinho" },
      { targetText: "table", nativeHelp: "mesa" },
      { targetText: "bougie", nativeHelp: "vela" },
    ],
  },
  it: {
    turns: [
      { targetText: "Benvenuto al ristorante! Posso vedere il menu?", nativeHelp: "Bem-vindo ao restaurante! Posso ver o cardápio?" },
      { targetText: "Vorrei la pasta con salsa di pomodoro, per favore.", nativeHelp: "Quero massa com molho de tomate, por favor." },
      { targetText: "Il tavolo è pulito e la candela illumina il ristorante.", nativeHelp: "A mesa está limpa e a vela ilumina o restaurante." },
    ],
    objects: [
      { targetText: "pasta", nativeHelp: "massa" },
      { targetText: "vino", nativeHelp: "vinho" },
      { targetText: "tavolo", nativeHelp: "mesa" },
      { targetText: "candela", nativeHelp: "vela" },
    ],
  },
  de: {
    turns: [
      { targetText: "Willkommen im Restaurant! Kann ich die Speisekarte sehen?", nativeHelp: "Bem-vindo ao restaurante! Posso ver o cardápio?" },
      { targetText: "Ich möchte Pasta mit Tomatensoße, bitte.", nativeHelp: "Quero massa com molho de tomate, por favor." },
      { targetText: "Der Tisch ist sauber und die Kerze beleuchtet das Restaurant.", nativeHelp: "A mesa está limpa e a vela ilumina o restaurante." },
    ],
    objects: [
      { targetText: "Pasta", nativeHelp: "massa" },
      { targetText: "Wein", nativeHelp: "vinho" },
      { targetText: "Tisch", nativeHelp: "mesa" },
      { targetText: "Kerze", nativeHelp: "vela" },
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
    airport_family: PT_BR_AIRPORT_FAMILY_LAUNCH_MATERIAL,
    cafe: PT_BR_CAFE_LAUNCH_MATERIAL,
    restaurant: PT_BR_RESTAURANT_LAUNCH_MATERIAL,
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
