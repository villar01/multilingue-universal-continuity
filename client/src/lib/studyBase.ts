import type { CEFRLevel } from "@/lib/lesson-levels";

export type StudyEntryKind = "vocabulary" | "grammar" | "situation";

export interface StudyEntry {
  id: string;
  unit: string;
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
    unit: "Unidade 1 · Cumprimentos e identidade",
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
    unit: "Unidade 2 · Necessidades imediatas",
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
    unit: "Unidade 3 · Lugares e localização",
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
    unit: "Unidade 1 · Cumprimentos e identidade",
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
    unit: "Unidade 4 · Pessoas e rotina",
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
    unit: "Unidade 2 · Necessidades imediatas",
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
  {
    id: "a1-order-water",
    unit: "Unidade 2 · Necessidades imediatas",
    kind: "situation",
    cefr: "A1",
    title: "Pedir água com educação",
    subtitle: "Fazer um pedido essencial em restaurante, aeroporto ou viagem",
    targetText: "I would like water, please.",
    nativeExplanation: "Use I would like para pedir algo com educação. Depois acrescente o item desejado e finalize com please quando quiser soar cordial.",
    figurativePronunciation: "ai uúd láik uóter, plíiz.",
    example: "I would like cold water, please.",
    exampleTranslation: "Eu gostaria de água gelada, por favor.",
    paretoWord: "Water",
    paretoTranslation: "Água",
    relatedScene: "Restaurante Brasileiro",
    searchTerms: ["água", "water", "pedido", "restaurante", "please", "would like"],
  },
  {
    id: "a1-ask-price",
    unit: "Unidade 2 · Necessidades imediatas",
    kind: "grammar",
    cefr: "A1",
    title: "Perguntar o preço",
    subtitle: "Usar how much para descobrir valor de um item",
    targetText: "How much is this ticket?",
    nativeExplanation: "Use how much antes de is quando perguntar o preço de um item singular. This ticket pode ser trocado por qualquer objeto que esteja perto de você.",
    figurativePronunciation: "ráu mâtch iz dís tíkit?",
    example: "How much is this book?",
    exampleTranslation: "Quanto custa este livro?",
    paretoWord: "How much",
    paretoTranslation: "Quanto custa",
    relatedScene: "Aeroporto Internacional",
    searchTerms: ["preço", "quanto", "how much", "ticket", "ingresso", "comprar"],
  },
  {
    id: "a1-near-location",
    unit: "Unidade 3 · Lugares e localização",
    kind: "grammar",
    cefr: "A1",
    title: "Dizer que algo fica perto",
    subtitle: "Usar near para descrever localização simples",
    targetText: "The hotel is near the beach.",
    nativeExplanation: "Near significa perto de. Use the antes de um lugar específico e troque hotel e beach para falar de outros lugares da cena.",
    figurativePronunciation: "dêi rrotél iz nír dê bíitch.",
    example: "The restaurant is near the hotel.",
    exampleTranslation: "O restaurante fica perto do hotel.",
    paretoWord: "Near",
    paretoTranslation: "Perto de",
    relatedScene: "Praia Tropical",
    searchTerms: ["perto", "near", "hotel", "praia", "beach", "localização"],
  },
  {
    id: "a1-repeat-please",
    unit: "Unidade 1 · Cumprimentos e identidade",
    kind: "situation",
    cefr: "A1",
    title: "Pedir repetição para continuar aprendendo",
    subtitle: "Não ficar parado quando uma palavra ainda não foi entendida",
    targetText: "Please repeat that.",
    nativeExplanation: "Use esta frase curta quando não entender uma fala. Ela mantém a conversa ativa e permite ouvir novamente sem vergonha.",
    figurativePronunciation: "plíiz ripít dét.",
    example: "Please repeat that slowly.",
    exampleTranslation: "Por favor, repita isso devagar.",
    paretoWord: "Repeat",
    paretoTranslation: "Repetir",
    relatedScene: "Sala de Aula",
    searchTerms: ["repita", "repeat", "devagar", "não entendi", "aula", "professor"],
  },
  {
    id: "a1-morning-routine",
    unit: "Unidade 4 · Pessoas e rotina",
    kind: "vocabulary",
    cefr: "A1",
    title: "Falar da rotina da manhã",
    subtitle: "Usar morning para organizar uma ação cotidiana",
    targetText: "I study English in the morning.",
    nativeExplanation: "Morning significa manhã. Use in the morning depois da ação para dizer quando algo acontece regularmente.",
    figurativePronunciation: "ai stâdi ínglish in dê mórnin.",
    example: "My mom works in the morning.",
    exampleTranslation: "Minha mãe trabalha de manhã.",
    paretoWord: "Morning",
    paretoTranslation: "Manhã",
    relatedScene: "Cozinha Moderna",
    searchTerms: ["manhã", "morning", "rotina", "estudar", "study", "trabalho"],
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

export function getStudyUnits(level: CEFRLevel = "A1"): string[] {
  return [...new Set(STUDY_BASE_A1_ENTRIES.filter((entry) => entry.cefr === level).map((entry) => entry.unit))];
}

export function filterStudyEntriesByUnit(entries: StudyEntry[], unit: string | "all"): StudyEntry[] {
  return unit === "all" ? entries : entries.filter((entry) => entry.unit === unit);
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

export function getSentenceStarter(entry: StudyEntry): string {
  const starters: Record<string, string> = {
    "a1-introduce-yourself": "My name is ___.",
    "a1-ask-for-help": "Can you help me with ___, please?",
    "a1-where-is": "Where is the ___?",
    "a1-this-is": "This is a ___.",
    "a1-family-mom": "My mom is ___.",
    "a1-routine-now": "I need ___ now.",
    "a1-order-water": "I would like ___, please.",
    "a1-ask-price": "How much is this ___?",
    "a1-near-location": "The ___ is near the ___.",
    "a1-repeat-please": "Please repeat ___.",
    "a1-morning-routine": "I ___ in the morning.",
  };
  return starters[entry.id] || entry.targetText;
}

export function reviewStudySentence(entry: StudyEntry, sentence: string): string {
  const normalized = NORMALIZE(sentence);
  if (!normalized) return "Escreva uma frase curta para receber orientação.";
  if (UNSAFE_PATTERN.test(normalized)) {
    return "Vamos manter a prática respeitosa e ligada à lição. Tente uma frase simples com a palavra Pareto.";
  }
  if (normalized.split(/\s+/).length < 3) {
    return "Acrescente mais palavras para formar uma frase completa. Use o modelo como apoio.";
  }
  const paretoWord = NORMALIZE(entry.paretoWord);
  if (!normalized.includes(paretoWord)) {
    return `Boa tentativa. Agora inclua a palavra Pareto “${entry.paretoWord}” para ligar sua frase ao conteúdo estudado.`;
  }
  if (normalized === NORMALIZE(entry.targetText) || normalized === NORMALIZE(entry.example)) {
    return "Você reproduziu o modelo corretamente. Agora troque uma informação e crie uma frase nova com a mesma estrutura.";
  }
  return `Boa criação. Sua frase reutiliza “${entry.paretoWord}”. Ouça-a, revise uma palavra se desejar e crie mais uma variação.`;
}
