import type { LanguageBlock, LanguageBlockKind } from "@/lib/curriculum-types";
import {
  INITIAL_COMMERCIAL_TARGET_BLOCKS,
  getInitialCommercialTargetBlock,
  type InitialCommercialTargetBlock,
  type InitialCommercialTargetBlockStatus,
} from "@shared/commercialLanguageBlocks";

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

export type TargetLanguageBlockStatus = InitialCommercialTargetBlockStatus;
export type TargetLanguageBlockAvailability = InitialCommercialTargetBlock;

/**
 * Delivery states are separate from the 143-language selector. They make the
 * maturity of each initial curriculum block explicit without changing which
 * native language a learner can use for guidance.
 */
export const INITIAL_TARGET_LANGUAGE_BLOCKS: readonly TargetLanguageBlockAvailability[] = INITIAL_COMMERCIAL_TARGET_BLOCKS;

export function getTargetLanguageBlockForLocale(locale: string): TargetLanguageBlockAvailability | undefined {
  return getInitialCommercialTargetBlock(locale);
}

export function getTargetLanguageBlockAvailabilityLabel(block?: TargetLanguageBlockAvailability): string | null {
  if (!block) return null;
  return block.status === "pilot"
    ? `Piloto validado · ${block.availableLevels.join(", ")}`
    : "Bloco em preparação";
}
