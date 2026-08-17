import { generateAI } from "../aiProvider";
import type { ParetoWord } from "./paretoContent";

export const INITIAL_COMMERCIAL_LANGUAGE_CODES = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "it-IT",
  "de-DE",
] as const;

export type InitialCommercialLanguageCode = (typeof INITIAL_COMMERCIAL_LANGUAGE_CODES)[number];

export type LocalizedParetoWord = {
  id: string;
  targetWord: string;
  nativeTranslation: string;
  pronunciation: string;
  category: ParetoWord["category"];
  frequency: number;
  targetExample: string;
  nativeExample: string;
  scene?: string;
};

export type ParetoLocalizationResult = {
  status: "ready" | "localization_unavailable" | "invalid_localization";
  items: LocalizedParetoWord[];
};

function languageBase(languageCode: string): string {
  return languageCode.trim().toLowerCase().split("-")[0] || "";
}

export function isInitialCommercialLanguageCode(languageCode: string): languageCode is InitialCommercialLanguageCode {
  return INITIAL_COMMERCIAL_LANGUAGE_CODES.includes(languageCode as InitialCommercialLanguageCode);
}

function directText(word: ParetoWord, languageCode: string): { word: string; example: string; pronunciation: string } | null {
  switch (languageBase(languageCode)) {
    case "en":
      return { word: word.enUS, example: word.example, pronunciation: word.pronunciation };
    case "pt":
      return { word: word.ptBR, example: word.examplePt, pronunciation: word.pronunciation };
    default:
      return null;
  }
}

export function resolveDirectParetoWords(
  words: ParetoWord[],
  targetLanguage: string,
  nativeLanguage: string,
): LocalizedParetoWord[] | null {
  const targetBase = languageBase(targetLanguage);
  const nativeBase = languageBase(nativeLanguage);
  const resolved = words.map((word) => {
    const target = directText(word, targetLanguage);
    const native = directText(word, nativeLanguage);
    if (!target || !native) return null;
    return {
      id: word.id,
      targetWord: target.word,
      nativeTranslation: native.word,
      pronunciation: target.pronunciation,
      category: word.category,
      frequency: word.frequency,
      targetExample: target.example,
      nativeExample: native.example,
      scene: word.scene,
    } satisfies LocalizedParetoWord;
  });

  if (resolved.some((word) => word === null) || !targetBase || !nativeBase) return null;
  return resolved as LocalizedParetoWord[];
}

type GeneratedParetoItem = Pick<LocalizedParetoWord, "id" | "targetWord" | "nativeTranslation" | "pronunciation" | "targetExample" | "nativeExample">;

function parseGeneratedItems(content: string, expectedWords: ParetoWord[]): LocalizedParetoWord[] | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== expectedWords.length) return null;
    const received = new Map<string, GeneratedParetoItem>();
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;
      if (["id", "targetWord", "nativeTranslation", "pronunciation", "targetExample", "nativeExample"].some((key) => typeof candidate[key] !== "string" || !(candidate[key] as string).trim())) return null;
      received.set(candidate.id as string, candidate as GeneratedParetoItem);
    }

    return expectedWords.map((word) => {
      const localized = received.get(word.id);
      if (!localized) throw new Error("missing localized word");
      return {
        ...localized,
        targetWord: localized.targetWord.trim(),
        nativeTranslation: localized.nativeTranslation.trim(),
        pronunciation: localized.pronunciation.trim(),
        targetExample: localized.targetExample.trim(),
        nativeExample: localized.nativeExample.trim(),
        category: word.category,
        frequency: word.frequency,
        scene: word.scene,
      };
    });
  } catch {
    return null;
  }
}

/**
 * Produces only the requested, authorized page of Pareto material. English and
 * Portuguese use reviewed canonical content. Other languages prioritize the
 * local provider and use the integrated server fallback only when the local
 * provider is unavailable; no other-language text is ever substituted.
 */
export async function localizeParetoWords(input: {
  words: ParetoWord[];
  /** Any supported target language; the initial commercial coverage is tracked separately. */
  targetLanguage: string;
  /** Any native support language; pairs are never limited to the initial six. */
  nativeLanguage: string;
  userId: number;
}): Promise<ParetoLocalizationResult> {
  const direct = resolveDirectParetoWords(input.words, input.targetLanguage, input.nativeLanguage);
  if (direct) return { status: "ready", items: direct };

  const source = input.words.map((word) => ({
    id: word.id,
    english: word.enUS,
    portuguese: word.ptBR,
    pronunciation: word.pronunciation,
    exampleEnglish: word.example,
    examplePortuguese: word.examplePt,
  }));

  try {
    const response = await generateAI({
      messages: [
        {
          role: "system",
          content: `You localize language-learning material. Translate each record faithfully for a learner whose target language is ${input.targetLanguage} and native support language is ${input.nativeLanguage}. Keep CEFR difficulty, preserve meaning, use regional spelling, and return only a JSON array. Each object must contain exactly id, targetWord, nativeTranslation, pronunciation, targetExample, nativeExample.`,
        },
        { role: "user", content: JSON.stringify(source) },
      ],
      temperature: 0,
      max_tokens: 5000,
      preferredProvider: "ollama",
      useCache: true,
      userId: input.userId,
    });
    const items = parseGeneratedItems(response.content, input.words);
    return items ? { status: "ready", items } : { status: "invalid_localization", items: [] };
  } catch {
    return { status: "localization_unavailable", items: [] };
  }
}
