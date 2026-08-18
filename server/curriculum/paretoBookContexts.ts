import { getParetoProgramWords, type ParetoWord } from "./paretoContent";

export const PARETO_BOOK_CONTEXT_IDS = ["foundation", "family", "social-circle", "routine-time", "home", "transport"] as const;
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
  "routine-time": {
    id: "routine-time",
    title: "Rotina e tempo",
    bookStep: "Contexto 3 do Livro ABC",
    wordIds: ["t001", "t002", "t004", "t008", "t010"],
    grammarFocus: "Use o tempo no começo para dar destaque ou no final para fechar a ideia: Today, I study. / I study English every morning.",
    recallPrompt: "Escreva uma rotina de hoje e um plano para amanhã sem consultar as palavras.",
    orderPrompt: "Coloque em ordem: English / every / study / I / morning",
    orderAnswer: "I study English every morning.",
  },
  home: {
    id: "home",
    title: "Casa",
    bookStep: "Contexto 4 do Livro ABC",
    wordIds: ["hm001", "hm002", "hm003", "hm006", "hm008"],
    grammarFocus: "Use there is ou o sujeito da casa/objeto antes do verbo. Os adjetivos vêm antes do substantivo em inglês: a quiet room.",
    recallPrompt: "Descreva dois lugares ou objetos da sua casa com uma frase curta para cada um.",
    orderPrompt: "Coloque em ordem: kitchen / the / in / cook / I",
    orderAnswer: "I cook in the kitchen.",
  },
  transport: {
    id: "transport",
    title: "Deslocamento",
    bookStep: "Contexto 5 do Livro ABC",
    wordIds: ["tr001", "tr002", "tr003", "tr004", "ct012"],
    grammarFocus: "Para deslocamento, diga primeiro quem age, depois o verbo e o meio ou destino: I take the bus to the station.",
    recallPrompt: "Escreva como você chega a um lugar e qual meio de transporte usaria em outra situação.",
    orderPrompt: "Coloque em ordem: bus / the / station / to / take / I / the",
    orderAnswer: "I take the bus to the station.",
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
