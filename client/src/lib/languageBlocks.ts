import type { CEFRLevel } from "@/lib/lesson-levels";

export type LanguageBlockKind = "essential_phrase" | "everyday_expression" | "natural_reply" | "contextual_slang";

export type LanguageBlock = {
  id: string;
  cefr: CEFRLevel;
  kind: LanguageBlockKind;
  english: string;
  portuguese: string;
  figurativePronunciation: string;
  example: string;
  examplePortuguese: string;
  writingPrompt: string;
  safetyNote?: string;
};

/**
 * Blocos autorais organizados por dificuldade. A1 permanece objetivo e curto;
 * expressões informais só entram depois que o aluno já pratica frases básicas.
 */
export const LANGUAGE_BLOCKS: LanguageBlock[] = [
  {
    id: "a1-can-you-help-me",
    cefr: "A1",
    kind: "essential_phrase",
    english: "Can you help me?",
    portuguese: "Você pode me ajudar?",
    figurativePronunciation: "kén iú rélp mi?",
    example: "Can you help me with this, please?",
    examplePortuguese: "Você pode me ajudar com isto, por favor?",
    writingPrompt: "Escreva um pedido curto usando Can you help me?",
  },
  {
    id: "a1-i-dont-understand",
    cefr: "A1",
    kind: "essential_phrase",
    english: "I don't understand.",
    portuguese: "Eu não entendo.",
    figurativePronunciation: "ai dôunt andersténd.",
    example: "I don't understand this word.",
    examplePortuguese: "Eu não entendo esta palavra.",
    writingPrompt: "Escreva uma frase dizendo o que você não entende.",
  },
  {
    id: "a2-could-you-repeat-that",
    cefr: "A2",
    kind: "everyday_expression",
    english: "Could you repeat that?",
    portuguese: "Você poderia repetir isso?",
    figurativePronunciation: "cúd iú ripít dét?",
    example: "Could you repeat that more slowly?",
    examplePortuguese: "Você poderia repetir isso mais devagar?",
    writingPrompt: "Escreva um pedido educado para ouvir algo novamente.",
  },
  {
    id: "a2-im-looking-for",
    cefr: "A2",
    kind: "everyday_expression",
    english: "I'm looking for...",
    portuguese: "Estou procurando por...",
    figurativePronunciation: "aim lúkin fór...",
    example: "I'm looking for the bus station.",
    examplePortuguese: "Estou procurando a estação de ônibus.",
    writingPrompt: "Complete a expressão com um lugar ou objeto útil.",
  },
  {
    id: "b1-that-sounds-good",
    cefr: "B1",
    kind: "natural_reply",
    english: "That sounds good.",
    portuguese: "Parece bom.",
    figurativePronunciation: "dét sáunds gúd.",
    example: "Meeting after class? That sounds good.",
    examplePortuguese: "Encontrar depois da aula? Parece bom.",
    writingPrompt: "Escreva uma resposta natural aceitando uma ideia.",
  },
  {
    id: "b1-im-on-my-way",
    cefr: "B1",
    kind: "natural_reply",
    english: "I'm on my way.",
    portuguese: "Estou a caminho.",
    figurativePronunciation: "aim ón mai uêi.",
    example: "Don't worry, I'm on my way now.",
    examplePortuguese: "Não se preocupe, estou a caminho agora.",
    writingPrompt: "Escreva uma mensagem curta dizendo para onde você vai.",
  },
  {
    id: "b2-no-big-deal",
    cefr: "B2",
    kind: "contextual_slang",
    english: "No big deal.",
    portuguese: "Sem problema; não é nada demais.",
    figurativePronunciation: "nôu bíg díil.",
    example: "You forgot once? No big deal.",
    examplePortuguese: "Você esqueceu uma vez? Sem problema.",
    writingPrompt: "Escreva uma resposta tranquila para um pequeno erro.",
    safetyNote: "Use em contexto informal e respeitoso; não use para minimizar um problema sério.",
  },
  {
    id: "b2-hang-out",
    cefr: "B2",
    kind: "contextual_slang",
    english: "Hang out",
    portuguese: "Passar tempo junto; sair sem compromisso formal.",
    figurativePronunciation: "réng áut.",
    example: "We hang out at the park after class.",
    examplePortuguese: "Nós passamos um tempo no parque depois da aula.",
    writingPrompt: "Escreva um convite informal e respeitoso para passar tempo junto.",
    safetyNote: "Use somente em interação apropriada à idade e com pessoas conhecidas.",
  },
  {
    id: "c1-to-be-honest",
    cefr: "C1",
    kind: "contextual_slang",
    english: "To be honest, ...",
    portuguese: "Para ser sincero(a), ...",
    figurativePronunciation: "tu bí ónist...",
    example: "To be honest, I need more practice.",
    examplePortuguese: "Para ser sincero, preciso de mais prática.",
    writingPrompt: "Escreva uma opinião cuidadosa iniciando com To be honest.",
  },
];

export function getLanguageBlocks(level: CEFRLevel): LanguageBlock[] {
  return LANGUAGE_BLOCKS.filter((block) => block.cefr === level);
}

export function getLanguageBlocksUpTo(level: CEFRLevel): LanguageBlock[] {
  const rank: Record<CEFRLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return LANGUAGE_BLOCKS.filter((block) => rank[block.cefr] <= rank[level]);
}
