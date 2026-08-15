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
