import { getParetoProgramWords, type ParetoWord } from "./paretoContent";

export const PARETO_BOOK_CONTEXT_IDS = ["foundation", "family", "social-circle"] as const;
export type ParetoBookContextId = (typeof PARETO_BOOK_CONTEXT_IDS)[number];

export type ParetoBookContext = {
  id: ParetoBookContextId;
  title: string;
  bookStep: string;
  wordIds: string[];
  grammarFocus: string;
  recallPrompt: string;
  orderPrompt: string;
  orderAnswer: string;
};

export const PARETO_BOOK_CONTEXTS: Record<ParetoBookContextId, ParetoBookContext> = {
  foundation: {
    id: "foundation",
    title: "Primeiras ideias e necessidades",
    bookStep: "Palavras iniciais do Livro ABC",
    wordIds: ["g001", "g006", "g007", "g010", "t001", "t002"],
    grammarFocus: "Use uma ideia curta: sujeito + verbo + complemento. Em inglês, deixe o sujeito visível quando a frase precisar dele.",
    recallPrompt: "Sem olhar, escreva uma saudação, um pedido educado e uma necessidade simples.",
    orderPrompt: "Coloque em ordem: water / need / I",
    orderAnswer: "I need water.",
  },
  family: {
    id: "family",
    title: "Família",
    bookStep: "Contexto 1 do Livro ABC",
    wordIds: ["f001", "f002", "f003", "f004", "f005", "f006", "f012", "f013"],
    grammarFocus: "Use my antes de uma pessoa ou do grupo: my mother, my father, my family. O adjetivo vem antes do substantivo em inglês: a small family.",
    recallPrompt: "Escreva uma frase sobre sua família e outra sobre uma pessoa específica dela.",
    orderPrompt: "Coloque em ordem: family / my / small / is",
    orderAnswer: "My family is small.",
  },
  "social-circle": {
    id: "social-circle",
    title: "Círculo social",
    bookStep: "Contexto 2 do Livro ABC",
    wordIds: ["f014", "wk008", "nb001"],
    grammarFocus: "Diferencie o vínculo da pessoa: friend indica amizade; colleague indica trabalho; neighbor indica proximidade de moradia.",
    recallPrompt: "Escreva uma frase que compare uma pessoa do seu círculo social com uma pessoa do trabalho ou da vizinhança.",
    orderPrompt: "Coloque em ordem: friend / classmate / my / is / a",
    orderAnswer: "My classmate is a friend.",
  },
};

export function getParetoBookContext(id: string | undefined): ParetoBookContext | null {
  if (!id || !PARETO_BOOK_CONTEXT_IDS.includes(id as ParetoBookContextId)) return null;
  return PARETO_BOOK_CONTEXTS[id as ParetoBookContextId];
}

export function getParetoBookContextWords(id: string | undefined, programWords = getParetoProgramWords()): ParetoWord[] | null {
  const context = getParetoBookContext(id);
  if (!context) return null;
  return context.wordIds
    .map((wordId) => programWords.find((word) => word.id.endsWith(`-${wordId}`)))
    .filter((word): word is ParetoWord => Boolean(word));
}
