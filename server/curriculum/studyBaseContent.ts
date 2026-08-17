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

export interface StudyComprehensionQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StructuredStudyUnit {
  id: string;
  unit: string;
  objective: string;
  readingTitle: string;
  reading: string;
  readingTranslation: string;
  grammarTitle: string;
  grammarExplanation: string;
  writingPrompt: string;
  questions: StudyComprehensionQuestion[];
}

export const STRUCTURED_A1_UNITS: StructuredStudyUnit[] = [
  {
    id: "a1-unit-identity",
    unit: "Unidade 1 · Cumprimentos e identidade",
    objective: "Cumprimentar, dizer o próprio nome, compreender uma apresentação curta e responder com uma frase pessoal.",
    readingTitle: "Texto guiado · Conhecendo James",
    reading: "Hello! My name is James. I am your English teacher. This is a tropical beach. The ocean is blue. What is your name? Nice to meet you.",
    readingTranslation: "Olá! Meu nome é James. Sou seu professor de inglês. Esta é uma praia tropical. O oceano é azul. Qual é o seu nome? Prazer em conhecer você.",
    grammarTitle: "Gramática útil · I am, My name is e This is",
    grammarExplanation: "Use My name is + nome para se apresentar. Use I am + profissão ou característica para dizer quem você é. Use This is + nome ou objeto para apresentar algo que está perto. Não memorize regras isoladas: use as três estruturas para falar de você e do que vê.",
    writingPrompt: "Escreva duas frases: cumprimente James e diga seu nome. Depois, acrescente uma frase com This is sobre algo que você vê.",
    questions: [
      { id: "a1-identity-james", prompt: "Who is James?", options: ["He is the English teacher.", "He is the student's brother.", "He is at a restaurant."], correctIndex: 0, explanation: "James says: “I am your English teacher.”" },
      { id: "a1-identity-place", prompt: "Where is the lesson?", options: ["At a tropical beach.", "At an airport.", "At a school."], correctIndex: 0, explanation: "The text says: “This is a tropical beach.”" },
    ],
  },
  {
    id: "a1-unit-needs",
    unit: "Unidade 2 · Necessidades imediatas",
    objective: "Pedir ajuda, água ou repetição com clareza e educação em uma situação cotidiana.",
    readingTitle: "Texto guiado · Um pedido de ajuda",
    reading: "At the airport, Ana needs help. She says, “Excuse me, can you help me, please?” The assistant says, “Of course. Do you need water too?” Ana answers, “Yes, please. I need water.”",
    readingTranslation: "No aeroporto, Ana precisa de ajuda. Ela diz: “Com licença, você pode me ajudar, por favor?” O atendente responde: “Claro. Você também precisa de água?” Ana responde: “Sim, por favor. Eu preciso de água.”",
    grammarTitle: "Gramática útil · need, can you e please",
    grammarExplanation: "Use I need + coisa para dizer uma necessidade. Use Can you + verbo para fazer um pedido educado. Acrescente please para tornar o pedido mais cordial, especialmente com pessoas que você não conhece.",
    writingPrompt: "Escreva três frases: uma com I need, uma pedindo ajuda com Can you help me e uma resposta educada usando please.",
    questions: [
      { id: "a1-needs-place", prompt: "Where does Ana need help?", options: ["At the airport.", "At the library.", "At the beach."], correctIndex: 0, explanation: "O texto começa com “At the airport, Ana needs help.”" },
      { id: "a1-needs-extra", prompt: "What else does Ana need?", options: ["Water.", "A book.", "A ticket."], correctIndex: 0, explanation: "Ana diz: “I need water.”" },
    ],
  },
  {
    id: "a1-unit-location",
    unit: "Unidade 3 · Lugares e localização",
    objective: "Perguntar onde lugares e objetos estão e compreender respostas curtas com in, on e near.",
    readingTitle: "Texto guiado · Encontrando a piscina",
    reading: "James is at the hotel. He asks, “Where is the pool?” The receptionist says, “The pool is near the beach. The map is on the table, next to the door.” James says, “Thank you. I can see it now.”",
    readingTranslation: "James está no hotel. Ele pergunta: “Onde fica a piscina?” A recepcionista responde: “A piscina fica perto da praia. O mapa está sobre a mesa, ao lado da porta.” James diz: “Obrigado. Agora consigo vê-la.”",
    grammarTitle: "Gramática útil · where is, in, on e near",
    grammarExplanation: "Use Where is + lugar ou objeto para perguntar a localização. Use in para algo dentro de um espaço, on para algo sobre uma superfície e near para dizer que dois lugares ficam próximos.",
    writingPrompt: "Escreva uma pergunta com Where is e duas respostas: uma usando on e outra usando near.",
    questions: [
      { id: "a1-location-pool", prompt: "Where is the pool?", options: ["Near the beach.", "On the table.", "In the airport."], correctIndex: 0, explanation: "A recepcionista diz: “The pool is near the beach.”" },
      { id: "a1-location-map", prompt: "Where is the map?", options: ["On the table.", "In the pool.", "Near the airport."], correctIndex: 0, explanation: "O texto informa que o mapa está sobre a mesa." },
    ],
  },
];

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

STRUCTURED_A1_UNITS.push(
  {
    id: "a1-unit-time",
    unit: "Unidade 5 · Números, tempo e agenda",
    objective: "Dizer números, horários e compromissos simples para organizar a própria rotina.",
    readingTitle: "Texto guiado · Uma aula às sete",
    reading: "My English class starts at seven. I have one notebook and two pens. The class is today, but I will practice again tomorrow.",
    readingTranslation: "Minha aula de inglês começa às sete. Eu tenho um caderno e duas canetas. A aula é hoje, mas vou praticar novamente amanhã.",
    grammarTitle: "Gramática útil · números, at e expressões de tempo",
    grammarExplanation: "Use at antes de uma hora específica: at seven. Use today e tomorrow para situar uma ação no presente ou no plano próximo.",
    writingPrompt: "Escreva três frases sobre sua agenda usando um número, uma hora e today ou tomorrow.",
    questions: [
      { id: "a1-time-class", prompt: "What time does the class start?", options: ["At seven.", "At two.", "Tomorrow."], correctIndex: 0, explanation: "O texto informa que a aula começa às sete." },
      { id: "a1-time-pens", prompt: "How many pens does the student have?", options: ["One.", "Two.", "Seven."], correctIndex: 1, explanation: "O texto diz: “two pens”." },
    ],
  },
  {
    id: "a1-unit-objects",
    unit: "Unidade 6 · Objetos, lugares e posse",
    objective: "Identificar objetos, perguntar a quem pertencem e explicar onde estão.",
    readingTitle: "Texto guiado · O livro e a chave",
    reading: "This is my book. The key is on the table. Is that your bag? No, it is Maria's bag. Her phone is in the room.",
    readingTranslation: "Este é meu livro. A chave está sobre a mesa. Aquela é sua bolsa? Não, é a bolsa de Maria. O telefone dela está no cômodo.",
    grammarTitle: "Gramática útil · my, your, her e posse com nome",
    grammarExplanation: "Use my, your e her antes de um objeto. Use nome + 's para indicar posse e in, on ou under para localizar.",
    writingPrompt: "Descreva três objetos perto de você. Diga de quem são e onde estão.",
    questions: [
      { id: "a1-objects-key", prompt: "Where is the key?", options: ["On the table.", "In the bag.", "Under the book."], correctIndex: 0, explanation: "A frase diz: “The key is on the table.”" },
      { id: "a1-objects-bag", prompt: "Whose bag is it?", options: ["Maria's.", "The teacher's.", "The student's."], correctIndex: 0, explanation: "A resposta no texto é “Maria's bag”." },
    ],
  },
  {
    id: "a1-unit-actions",
    unit: "Unidade 7 · Ações, hábitos e necessidades",
    objective: "Usar verbos frequentes para falar de hábitos, necessidades e planos simples.",
    readingTitle: "Texto guiado · Estudar e praticar",
    reading: "I study English in the morning. My friend works in the afternoon. We practice together because we want to speak with confidence.",
    readingTranslation: "Eu estudo inglês de manhã. Meu amigo trabalha à tarde. Nós praticamos juntos porque queremos falar com confiança.",
    grammarTitle: "Gramática útil · sujeito, verbo e because",
    grammarExplanation: "Em uma frase básica, diga quem faz a ação e depois o verbo. Use because para explicar um motivo.",
    writingPrompt: "Escreva uma frase sobre um hábito seu, uma sobre uma necessidade e uma usando because.",
    questions: [
      { id: "a1-actions-when", prompt: "When does the speaker study English?", options: ["In the morning.", "At night.", "On Sunday."], correctIndex: 0, explanation: "O texto usa “in the morning”." },
      { id: "a1-actions-why", prompt: "Why do they practice together?", options: ["They want to speak with confidence.", "They need a new bag.", "They are at a hotel."], correctIndex: 0, explanation: "A razão vem depois de because." },
    ],
  },
  {
    id: "a1-unit-services",
    unit: "Unidade 8 · Serviços, comida e escolhas",
    objective: "Pedir itens, escolher opções e resolver necessidades simples com educação.",
    readingTitle: "Texto guiado · Um pedido simples",
    reading: "At the café, I would like water and a sandwich, please. The server asks, “Still or sparkling water?” I choose still water. Thank you.",
    readingTranslation: "No café, eu gostaria de água e um sanduíche, por favor. O atendente pergunta: “Água sem gás ou com gás?” Eu escolho água sem gás. Obrigado.",
    grammarTitle: "Gramática útil · I would like e escolhas",
    grammarExplanation: "I would like é uma forma educada para pedir algo. Use and para juntar itens e I choose para decidir entre alternativas.",
    writingPrompt: "Escreva um pedido de duas coisas e uma resposta escolhendo uma opção oferecida pelo atendente.",
    questions: [
      { id: "a1-services-order", prompt: "What does the speaker order?", options: ["Water and a sandwich.", "Coffee and tea.", "A book and a key."], correctIndex: 0, explanation: "O pedido inicial contém water and a sandwich." },
      { id: "a1-services-choice", prompt: "Which water does the speaker choose?", options: ["Still water.", "Sparkling water.", "Hot water."], correctIndex: 0, explanation: "A escolha explícita é still water." },
    ],
  },
  {
    id: "a1-unit-description",
    unit: "Unidade 9 · Descrever, comparar e opinar",
    objective: "Descrever pessoas, objetos e lugares e justificar uma preferência simples.",
    readingTitle: "Texto guiado · Dois lugares para estudar",
    reading: "The library is quiet and the café is busy. I prefer the library because it is quieter. My friend prefers the café because it is near her office.",
    readingTranslation: "A biblioteca é silenciosa e o café é movimentado. Eu prefiro a biblioteca porque ela é mais silenciosa. Minha amiga prefere o café porque ele fica perto do escritório dela.",
    grammarTitle: "Gramática útil · adjetivo, comparativo e preferência",
    grammarExplanation: "Use adjetivos para descrever. Use prefer e because para transformar uma descrição em opinião justificada.",
    writingPrompt: "Compare dois lugares que você conhece. Diga qual prefere e explique o motivo com because.",
    questions: [
      { id: "a1-description-library", prompt: "Why does the speaker prefer the library?", options: ["It is quieter.", "It is more expensive.", "It has water."], correctIndex: 0, explanation: "A justificativa usa “because it is quieter”." },
      { id: "a1-description-friend", prompt: "Why does the friend prefer the café?", options: ["It is near her office.", "It is quiet.", "It has a book."], correctIndex: 0, explanation: "O texto relaciona o café ao escritório dela." },
    ],
  },
  {
    id: "a1-unit-conversation",
    unit: "Unidade 10 · Conversa, revisão e autonomia",
    objective: "Conectar cumprimentos, perguntas, respostas, pedidos de esclarecimento e próximos passos em uma conversa curta.",
    readingTitle: "Texto guiado · Uma conversa de estudo",
    reading: "Hello, I am Lucas. I am learning English. Can you help me with this word? Yes. Please say the word slowly. Thank you. I will practice it again tomorrow.",
    readingTranslation: "Olá, eu sou Lucas. Estou aprendendo inglês. Você pode me ajudar com esta palavra? Sim. Por favor, diga a palavra devagar. Obrigado. Vou praticá-la novamente amanhã.",
    grammarTitle: "Gramática útil · manter a conversa em movimento",
    grammarExplanation: "Uma conversa inicial precisa de abertura, pergunta, resposta, pedido de esclarecimento e encerramento. Reutilize palavras Pareto de unidades anteriores.",
    writingPrompt: "Escreva um diálogo de seis falas: apresente-se, faça uma pergunta, peça repetição, agradeça e diga quando praticará novamente.",
    questions: [
      { id: "a1-conversation-help", prompt: "What does Lucas ask for?", options: ["Help with a word.", "A sandwich.", "A new book."], correctIndex: 0, explanation: "Ele pergunta por ajuda com uma palavra." },
      { id: "a1-conversation-next", prompt: "When will Lucas practice again?", options: ["Tomorrow.", "Last week.", "At the café."], correctIndex: 0, explanation: "A frase final usa tomorrow." },
    ],
  },
);

STUDY_BASE_A1_ENTRIES.push(
  { id: "a1-tell-time", unit: "Unidade 5 · Números, tempo e agenda", kind: "grammar", cefr: "A1", title: "Dizer a hora de uma atividade", subtitle: "Usar at antes de uma hora específica", targetText: "The class starts at seven.", nativeExplanation: "Use at antes de uma hora específica para informar uma agenda.", figurativePronunciation: "dê क्लáss stárts ét séven.", example: "The meeting starts at eight.", exampleTranslation: "A reunião começa às oito.", paretoWord: "Time", paretoTranslation: "Hora; tempo", relatedScene: "Sala de Aula", searchTerms: ["hora", "tempo", "time", "agenda", "sete", "aula"] },
  { id: "a1-whose-is-this", unit: "Unidade 6 · Objetos, lugares e posse", kind: "grammar", cefr: "A1", title: "Perguntar a quem um objeto pertence", subtitle: "Usar whose e responder com posse simples", targetText: "Whose book is this?", nativeExplanation: "Use whose para perguntar de quem é um objeto. Responda com my, your, her, his ou nome + 's.", figurativePronunciation: "rrúz búk iz dís?", example: "Whose bag is this? It is Maria's bag.", exampleTranslation: "De quem é esta bolsa? É a bolsa da Maria.", paretoWord: "Whose", paretoTranslation: "De quem", relatedScene: "Casa da Família", searchTerms: ["de quem", "whose", "posse", "livro", "bolsa"] },
  { id: "a1-study-habit", unit: "Unidade 7 · Ações, hábitos e necessidades", kind: "vocabulary", cefr: "A1", title: "Descrever um hábito de estudo", subtitle: "Usar study em uma rotina pessoal", targetText: "I study English every day.", nativeExplanation: "Use study para falar de aprendizagem regular. Every day indica rotina.", figurativePronunciation: "ai stâdi ínglish évri dêi.", example: "We study new words every day.", exampleTranslation: "Nós estudamos palavras novas todos os dias.", paretoWord: "Study", paretoTranslation: "Estudar", relatedScene: "Biblioteca Histórica", searchTerms: ["estudar", "study", "todo dia", "hábito", "palavras"] },
  { id: "a1-cafe-order", unit: "Unidade 8 · Serviços, comida e escolhas", kind: "situation", cefr: "A1", title: "Fazer um pedido no café", subtitle: "Pedir dois itens de forma educada", targetText: "I would like water and a sandwich, please.", nativeExplanation: "Use I would like para pedir algo com educação. Junte itens com and e finalize com please.", figurativePronunciation: "ai uúd láik uóter én a sánduítch, plíiz.", example: "I would like tea and bread, please.", exampleTranslation: "Eu gostaria de chá e pão, por favor.", paretoWord: "Sandwich", paretoTranslation: "Sanduíche", relatedScene: "Café Parisiense", searchTerms: ["café", "pedido", "sandwich", "sanduíche", "água"] },
  { id: "a1-prefer-place", unit: "Unidade 9 · Descrever, comparar e opinar", kind: "grammar", cefr: "A1", title: "Dizer o que você prefere e explicar", subtitle: "Usar prefer e because para uma opinião simples", targetText: "I prefer the library because it is quieter.", nativeExplanation: "Use prefer para escolher e because para justificar a escolha.", figurativePronunciation: "ai prifêr dê láibréri bicóz it iz cuáiéter.", example: "I prefer the bus because it is cheaper.", exampleTranslation: "Eu prefiro o ônibus porque é mais barato.", paretoWord: "Prefer", paretoTranslation: "Preferir", relatedScene: "Biblioteca Histórica", searchTerms: ["preferir", "prefer", "opinião", "because", "comparar"] },
  { id: "a1-connect-ideas", unit: "Unidade 10 · Conversa, revisão e autonomia", kind: "grammar", cefr: "A1", title: "Organizar uma sequência de estudo", subtitle: "Usar first, then e finally para ligar ideias", targetText: "First I read, then I write, and finally I speak.", nativeExplanation: "Use first, then e finally para organizar etapas e explicar uma sequência.", figurativePronunciation: "fârst ai ríd, dên ai ráit, én fáinali ai spík.", example: "First I listen, then I repeat, and finally I practice.", exampleTranslation: "Primeiro eu escuto, depois repito e, por fim, pratico.", paretoWord: "Finally", paretoTranslation: "Por fim", relatedScene: "Sala de Aula", searchTerms: ["primeiro", "depois", "por fim", "first", "then", "finally", "sequência"] },
);

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

export function getStructuredStudyUnit(unit: string | null | undefined): StructuredStudyUnit | null {
  return STRUCTURED_A1_UNITS.find((item) => item.unit === unit) || null;
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

export type SentenceTransformation = {
  source: string;
  instruction: string;
  hint: string;
};

export function getSentenceTransformation(entry: StudyEntry): SentenceTransformation {
  const transformations: Record<string, SentenceTransformation> = {
    "a1-introduce-yourself": { source: "My name is Ana.", instruction: "Troque Ana pelo seu nome.", hint: "Mantenha: My name is ___." },
    "a1-ask-for-help": { source: "Can you help me, please?", instruction: "Acrescente o que você precisa, sem tirar help.", hint: "Can you help me with ___, please?" },
    "a1-where-is": { source: "Where is the pool?", instruction: "Troque pool por outro lugar singular.", hint: "Where is the hotel?" },
    "a1-this-is": { source: "This is a book.", instruction: "Troque book por outro objeto próximo.", hint: "This is a table." },
    "a1-family-mom": { source: "My mom is at home.", instruction: "Troque at home por outro lugar ou situação.", hint: "My mom is at work." },
    "a1-routine-now": { source: "I need water now.", instruction: "Troque water pelo que você precisa agora.", hint: "I need help now." },
    "a1-order-water": { source: "I would like water, please.", instruction: "Acrescente uma qualidade ao pedido.", hint: "I would like cold water, please." },
    "a1-ask-price": { source: "How much is this ticket?", instruction: "Troque ticket por outro item singular.", hint: "How much is this book?" },
    "a1-near-location": { source: "The hotel is near the beach.", instruction: "Troque um dos lugares e mantenha near.", hint: "The restaurant is near the hotel." },
    "a1-repeat-please": { source: "Please repeat that.", instruction: "Acrescente como você quer ouvir novamente.", hint: "Please repeat that slowly." },
    "a1-morning-routine": { source: "I study English in the morning.", instruction: "Troque a ação, mas mantenha morning.", hint: "I work in the morning." },
  };
  return transformations[entry.id] || { source: entry.targetText, instruction: "Mude uma informação e mantenha a palavra Pareto.", hint: getSentenceStarter(entry) };
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

export function reviewStudyTransformation(entry: StudyEntry, sentence: string): string {
  const normalized = NORMALIZE(sentence);
  const transformation = getSentenceTransformation(entry);
  if (!normalized) return "Escreva a frase transformada para receber orientação.";
  if (UNSAFE_PATTERN.test(normalized)) return "Vamos manter a prática respeitosa e ligada à lição. Transforme a frase usando a palavra Pareto.";
  if (normalized.split(/\s+/).length < 3) return "Use uma frase completa. Siga a estrutura do modelo e mude apenas uma informação.";
  if (normalized === NORMALIZE(transformation.source)) return "Você manteve o modelo. Agora altere uma informação para criar uma nova situação.";
  if (!normalized.includes(NORMALIZE(entry.paretoWord))) return `Mantenha a palavra Pareto “${entry.paretoWord}” para praticar o conteúdo desta unidade.`;
  return `Boa transformação. Você preservou “${entry.paretoWord}” e criou uma situação nova. Ouça a frase e depois faça mais uma variação.`;
}
