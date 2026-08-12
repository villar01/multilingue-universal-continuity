export type ParetoPracticeStep = "observe" | "recall" | "write" | "create";

export interface ParetoPracticeTerm {
  word: string;
  translation: string;
  example?: string;
}

export interface ParetoPracticeCheck {
  correct: boolean;
  message: string;
}

export const PARETO_PRACTICE_STEPS: ReadonlyArray<ParetoPracticeStep> = [
  "observe",
  "recall",
  "write",
  "create",
];

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

/** Confirma a recuperação ativa do termo aprendido sem exigir maiúsculas. */
export function checkParetoRecall(answer: string, term: ParetoPracticeTerm): ParetoPracticeCheck {
  if (normalize(answer) === normalize(term.word)) {
    return { correct: true, message: "Ótimo. Você recuperou a palavra de memória." };
  }
  return { correct: false, message: "Veja a palavra mais uma vez e tente escrevê-la sem olhar." };
}

/** A frase deve reutilizar a palavra e ter conteúdo além da simples repetição. */
export function checkParetoSentence(sentence: string, term: ParetoPracticeTerm): ParetoPracticeCheck {
  const words = normalize(sentence).split(" ").filter(Boolean);
  if (!normalize(sentence).includes(normalize(term.word))) {
    return { correct: false, message: `Use “${term.word}” em sua nova frase.` };
  }
  if (words.length < 3) {
    return { correct: false, message: "Crie uma frase curta com pelo menos três palavras." };
  }
  return { correct: true, message: "Excelente. Você usou a palavra em uma nova frase." };
}

export function nextParetoStep(current: ParetoPracticeStep): ParetoPracticeStep | null {
  const index = PARETO_PRACTICE_STEPS.indexOf(current);
  return PARETO_PRACTICE_STEPS[index + 1] ?? null;
}
