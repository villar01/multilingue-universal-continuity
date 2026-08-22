import type { CEFRLevel } from "@/lib/lesson-levels";

export interface ParetoPracticeTerm {
  word: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
}

export interface ParetoPracticeCheck {
  correct: boolean;
  message: string;
}

export interface ParetoLevelRequirement {
  minSentenceWords: number;
  maxSentenceWords: number;
  guidance: string;
}

export type ParetoPracticeStep = "observe" | "recall" | "write" | "assemble" | "create";

export const PARETO_LEVEL_REQUIREMENTS: Record<CEFRLevel, ParetoLevelRequirement> = {
  A1: { minSentenceWords: 3, maxSentenceWords: 6, guidance: "Crie uma frase curta e concreta sobre o objeto." },
  A2: { minSentenceWords: 5, maxSentenceWords: 10, guidance: "Crie uma frase simples sobre uma situação cotidiana." },
  B1: { minSentenceWords: 8, maxSentenceWords: 18, guidance: "Crie uma frase com contexto e uma informação pessoal ou descritiva." },
  B2: { minSentenceWords: 12, maxSentenceWords: 25, guidance: "Crie uma frase mais detalhada, usando conexão, comparação ou justificativa." },
  C1: { minSentenceWords: 18, maxSentenceWords: 35, guidance: "Crie uma frase precisa, com registro e coesão adequados ao contexto." },
  C2: { minSentenceWords: 24, maxSentenceWords: 50, guidance: "Crie uma frase com nuance, precisão e vocabulário apropriado ao tema." },
};

export const PARETO_PRACTICE_STEPS: ReadonlyArray<ParetoPracticeStep> = ["observe", "recall", "write", "assemble", "create"];

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function getParetoLevelRequirement(level: CEFRLevel): ParetoLevelRequirement {
  return PARETO_LEVEL_REQUIREMENTS[level];
}

/** Confirma a recuperação ativa do termo aprendido sem exigir maiúsculas. */
export function checkParetoRecall(answer: string, term: ParetoPracticeTerm): ParetoPracticeCheck {
  if (normalize(answer) === normalize(term.word)) {
    return { correct: true, message: "Ótimo. Você recuperou a palavra de memória." };
  }
  return { correct: false, message: "Veja a palavra mais uma vez e tente escrevê-la sem olhar." };
}

/** Mantém uma frase-modelo curta para a montagem guiada antes da criação independente. */
export function getParetoAssemblyModel(term: ParetoPracticeTerm): string {
  return term.example?.trim() || term.word;
}

/** Confirma a ordem da frase-modelo sem exigir capitalização ou espaços idênticos. */
export function checkParetoAssembly(answer: string, term: ParetoPracticeTerm): ParetoPracticeCheck {
  const model = getParetoAssemblyModel(term);
  if (normalize(answer) === normalize(model)) {
    return { correct: true, message: "Muito bem. Você organizou a frase antes de criar uma nova." };
  }
  return { correct: false, message: "Reorganize as palavras para formar a frase-modelo." };
}

/** A frase deve reutilizar a palavra, obedecer ao nível CEFR e ir além da simples repetição. */
export function checkParetoSentence(sentence: string, term: ParetoPracticeTerm, requirement: ParetoLevelRequirement = PARETO_LEVEL_REQUIREMENTS.A1): ParetoPracticeCheck {
  const words = normalize(sentence).split(" ").filter(Boolean);
  if (!normalize(sentence).includes(normalize(term.word))) {
    return { correct: false, message: `Use “${term.word}” em sua nova frase.` };
  }
  if (words.length < requirement.minSentenceWords) {
    return { correct: false, message: `Crie uma frase com pelo menos ${requirement.minSentenceWords} palavras neste nível.` };
  }
  if (words.length > requirement.maxSentenceWords) {
    return { correct: false, message: `Mantenha a prática com até ${requirement.maxSentenceWords} palavras neste nível.` };
  }
  return { correct: true, message: "Excelente. Você usou a palavra em uma nova frase." };
}

export function nextParetoStep(current: ParetoPracticeStep): ParetoPracticeStep | null {
  const index = PARETO_PRACTICE_STEPS.indexOf(current);
  return PARETO_PRACTICE_STEPS[index + 1] ?? null;
}
