import type { CEFRLevel } from "@/lib/lesson-levels";

export type StudyEntryKind = "vocabulary" | "grammar" | "situation";

export interface StudyEntry {
  id: string;
  kind: StudyEntryKind;
  cefr: CEFRLevel;
  title: string;
  subtitle: string;
  targetText: string;
  nativeExplanation: string;
  figurativePronunciation?: string;
  example: string;
  exampleTranslation: string;
  paretoWord: string;
  paretoTranslation: string;
  relatedScene: string;
  searchTerms: string[];
}

export const STUDY_BASE_A1_ENTRIES: StudyEntry[] = [
  {
    id: "a1-introduce-yourself",
    kind: "situation",
    cefr: "A1",
    title: "Apresentar-se com clareza",
    subtitle: "Dizer o nome e iniciar uma conversa curta",
    targetText: "My name is Ana. Nice to meet you.",
    nativeExplanation: "Use esta estrutura para dizer seu nome e abrir uma conversa de forma cordial. Depois, espere a outra pessoa se apresentar.",
    figurativePronunciation: "mai nêim iz Ána. náiss tu mít iú.",
    example: "Hello, my name is Ana. Nice to meet you.",
    exampleTranslation: "Olá, meu nome é Ana. Prazer em conhecer você.",
    paretoWord: "Hello",
    paretoTranslation: "Olá",
    relatedScene: "Praia Tropical",
    searchTerms: ["nome", "apresentação", "olá", "hello", "nice to meet you", "cumprimento"],
  },
  {
    id: "a1-ask-for-help",
    kind: "situation",
    cefr: "A1",
    title: "Pedir ajuda em uma situação real",
    subtitle: "Fazer um pedido curto e educado",
    targetText: "Can you help me, please?",
    nativeExplanation: "A frase começa com uma pergunta educada. Use-a quando precisar de orientação, informação ou apoio em uma cena do aplicativo.",
    figurativePronunciation: "kén iú rélp mi, plíiz?",
    example: "Excuse me, can you help me, please?",
    exampleTranslation: "Com licença, você pode me ajudar, por favor?",
    paretoWord: "Help",
    paretoTranslation: "Ajuda",
    relatedScene: "Nova York",
    searchTerms: ["ajuda", "pedido", "por favor", "can", "help", "excuse me"],
  },
  {
    id: "a1-where-is",
    kind: "grammar",
    cefr: "A1",
    title: "Perguntar onde algo está",
    subtitle: "Usar where is para localizar pessoas, objetos e lugares",
    targetText: "Where is the pool?",
    nativeExplanation: "Use where is antes de um objeto ou lugar singular quando quiser saber a localização. A resposta costuma começar com It is ou The pool is.",
    figurativePronunciation: "uér iz dê púl?",
    example: "Where is the pool? It is near the hotel.",
    exampleTranslation: "Onde fica a piscina? Ela fica perto do hotel.",
    paretoWord: "Where",
    paretoTranslation: "Onde",
    relatedScene: "Praia Tropical",
    searchTerms: ["onde", "where", "localização", "piscina", "pool", "lugar"],
  },
  {
    id: "a1-this-is",
    kind: "grammar",
    cefr: "A1",
    title: "Apontar e identificar um objeto",
    subtitle: "Usar this is para mostrar algo próximo",
    targetText: "This is a book.",
    nativeExplanation: "This é usado para algo que está perto de você. Junte com is e o nome do objeto para identificar o que você vê em uma cena.",
    figurativePronunciation: "dís iz a búk.",
    example: "This is a book on the table.",
    exampleTranslation: "Este é um livro sobre a mesa.",
    paretoWord: "Book",
    paretoTranslation: "Livro",
    relatedScene: "Cozinha",
    searchTerms: ["isto", "este", "this", "is", "objeto", "livro", "book"],
  },
  {
    id: "a1-family-mom",
    kind: "vocabulary",
    cefr: "A1",
    title: "Falar sobre família: mom",
    subtitle: "Reconhecer uma palavra cotidiana para mãe",
    targetText: "My mom is at home.",
    nativeExplanation: "Mom é uma forma comum e afetiva de dizer mãe em inglês americano. Em contextos mais formais, mother também é possível.",
    figurativePronunciation: "mai mám iz ét rroum.",
    example: "My mom is at home today.",
    exampleTranslation: "Minha mãe está em casa hoje.",
    paretoWord: "Mom",
    paretoTranslation: "Mãe",
    relatedScene: "Cozinha",
    searchTerms: ["mãe", "mom", "mother", "família", "casa", "home"],
  },
  {
    id: "a1-routine-now",
    kind: "vocabulary",
    cefr: "A1",
    title: "Falar do momento atual: now",
    subtitle: "Usar now para uma ação ou necessidade imediata",
    targetText: "I need water now.",
    nativeExplanation: "Now significa agora. Ele deixa claro que a situação é imediata e pode aparecer no início ou no fim de uma frase curta.",
    figurativePronunciation: "ai níd uóter náu.",
    example: "I need water now, please.",
    exampleTranslation: "Preciso de água agora, por favor.",
    paretoWord: "Now",
    paretoTranslation: "Agora",
    relatedScene: "Praia Tropical",
    searchTerms: ["agora", "now", "preciso", "need", "água", "water", "rotina"],
  },
];

const NORMALIZE = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .trim();

export function searchStudyBase(
  query: string,
  kind: StudyEntryKind | "all" = "all",
  level: CEFRLevel = "A1",
): StudyEntry[] {
  const normalized = NORMALIZE(query);
  return STUDY_BASE_A1_ENTRIES.filter((entry) => {
    const matchesKind = kind === "all" || entry.kind === kind;
    const matchesLevel = entry.cefr === level;
    if (!normalized) return matchesKind && matchesLevel;
    const searchable = [
      entry.title,
      entry.subtitle,
      entry.targetText,
      entry.example,
      entry.exampleTranslation,
      entry.nativeExplanation,
      entry.paretoWord,
      entry.paretoTranslation,
      entry.relatedScene,
      ...entry.searchTerms,
    ].map(NORMALIZE);
    return matchesKind && matchesLevel && searchable.some((term) => term.includes(normalized));
  });
}

const UNSAFE_PATTERN = /\b(idiot|stupid|hate|kill|suicide|sex|nude|weapon|drug|drogas?|matar|morte|sexo|nudez|arma|ofensa)\b/i;

export function getStudyBaseTeacherReply(entry: StudyEntry, question: string): string {
  const normalized = NORMALIZE(question);
  if (UNSAFE_PATTERN.test(normalized)) {
    return "Vamos manter a prática respeitosa e ligada à lição. Posso ajudar você a ouvir, entender ou usar este conteúdo em uma frase curta.";
  }
  if (!normalized) {
    return `Vamos praticar ${entry.paretoWord}. Leia a frase, ouça a voz natural e tente criar uma resposta curta.`;
  }
  if (/(pronuncia|pronunciaçao|falar|dizer|speak|say)/.test(normalized)) {
    return `A pronúncia figurativa é “${entry.figurativePronunciation}”. Ouça o áudio e repita uma vez devagar antes de usar a frase.`;
  }
  if (/(significa|meaning|quer dizer|o que e|what is)/.test(normalized)) {
    return `${entry.paretoWord} significa “${entry.paretoTranslation}” neste nível. ${entry.nativeExplanation}`;
  }
  if (/(exemplo|frase|example|sentence)/.test(normalized)) {
    return `Exemplo: “${entry.example}”. Agora escreva uma nova frase curta usando ${entry.paretoWord}.`;
  }
  return `${entry.nativeExplanation} Tente responder com uma frase curta usando “${entry.paretoWord}”.`;
}
