import type { LanguageBlock, LanguageBlockKind } from "@/lib/curriculum-types";

export type { LanguageBlock, LanguageBlockKind } from "@/lib/curriculum-types";

export function reviewLanguageBlock(block: LanguageBlock, sentence: string): string {
  const normalized = sentence.trim().toLocaleLowerCase("en-US");
  if (!normalized) return "Escreva uma frase curta para praticar este bloco de linguagem.";
  if (normalized === block.english.toLocaleLowerCase("en-US").replace(/[.!?]$/, "")) {
    return "Você repetiu o bloco corretamente. Agora acrescente uma informação para usá-lo em uma situação sua.";
  }
  const core = block.english.toLocaleLowerCase("en-US").replace(/[.!?]$/, "");
  if (!normalized.includes(core)) return `Mantenha “${block.english}” na sua frase para fixar a expressão completa.`;
  return "Boa criação. Você usou o bloco completo em uma situação nova. Ouça a frase e escreva mais uma variação.";
}

export type TargetLanguageBlockStatus = "pilot" | "preparing";

export interface TargetLanguageBlockAvailability {
  id: "english" | "spanish" | "french" | "italian" | "german";
  targetLanguageBases: readonly string[];
  label: string;
  status: TargetLanguageBlockStatus;
  availableLevels: readonly string[];
  nativeGuidance: "any-available-native-language";
}

/**
 * Delivery states are separate from the 143-language selector. They make the
 * maturity of each initial curriculum block explicit without changing which
 * native language a learner can use for guidance.
 */
export const INITIAL_TARGET_LANGUAGE_BLOCKS: readonly TargetLanguageBlockAvailability[] = [
  { id: "english", targetLanguageBases: ["en"], label: "Inglês", status: "pilot", availableLevels: ["A1"], nativeGuidance: "any-available-native-language" },
  { id: "spanish", targetLanguageBases: ["es"], label: "Espanhol", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language" },
  { id: "french", targetLanguageBases: ["fr"], label: "Francês", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language" },
  { id: "italian", targetLanguageBases: ["it"], label: "Italiano", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language" },
  { id: "german", targetLanguageBases: ["de"], label: "Alemão", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language" },
] as const;

export function getTargetLanguageBlockForLocale(locale: string): TargetLanguageBlockAvailability | undefined {
  const base = locale.split("-")[0]?.toLowerCase();
  return INITIAL_TARGET_LANGUAGE_BLOCKS.find((block) => block.targetLanguageBases.includes(base));
}

export function getTargetLanguageBlockAvailabilityLabel(block?: TargetLanguageBlockAvailability): string | null {
  if (!block) return null;
  return block.status === "pilot"
    ? `Piloto validado · ${block.availableLevels.join(", ")}`
    : "Bloco em preparação";
}
