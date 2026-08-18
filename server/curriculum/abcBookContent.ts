import { STRUCTURED_A1_UNITS } from "./studyBaseContent";

export type ABCBookSection = {
  title: string;
  text: string;
  example: string;
  paretoPrompt?: string;
};

export type ABCBookChapter = {
  title: string;
  objective: string;
  reading: string;
  translation: string;
  grammarTitle: string;
  grammarExplanation: string;
  writingPrompt: string;
  orderingExercise: ABCBookOrderingExercise;
  paretoContext: "foundation" | "family" | "social-circle" | "routine-time" | "home" | "transport";
};

export type ABCBookOrderingExercise = {
  prompt: string;
  scrambled: string[];
  answer: string;
  explanation: string;
  followUpPrompt: string;
};

export type ABCBookPhrase = {
  english: string;
  portuguese: string;
  focus: string;
};

export type ABCBookMemoryStep = {
  title: string;
  instruction: string;
  example: string;
};

export type ABCBookSentenceStructure = {
  title: string;
  introduction: string;
  sharedPattern: string;
  portuguesePattern: string;
  englishPattern: string;
  questionPattern: string;
  negativePattern: string;
  handwritingInstruction: string;
  typingInstruction: string;
};

export type ABCBookContextGroup = {
  title: string;
  purpose: string;
  words: Array<{
    target: string;
    native: string;
    relation: string;
  }>;
  contrast: string;
  modelSentence: string;
  writingPrompt: string;
  paretoPrompt: string;
};

export type ABCAlphabetLetter = {
  letter: string;
  name: string;
  guide: string;
};

export type ABCBookSoundLesson = {
  title: string;
  explanation: string;
  examples: Array<{
    target: string;
    pronunciation: string;
    native: string;
  }>;
  writingPrompt: string;
};

export type ABCBookProgressiveLesson = {
  section: string;
  title: string;
  explanation: string;
  languageFocus: string;
  examples: Array<{
    target: string;
    native: string;
    note: string;
  }>;
  writingPrompt: string;
  scrambled: string[];
  answer: string;
  paretoPrompt: string;
};

export type ABCBookDelivery = {
  available: true;
  edition: string;
  nativeLabel: string;
  targetLabel: string;
  introduction: string;
  survivalIntro: string;
  alphabetIntroduction: string;
  alphabetLetters: ABCAlphabetLetter[];
  soundLessons: ABCBookSoundLesson[];
  progressiveLessons: ABCBookProgressiveLesson[];
  termCard: {
    term: string;
    meaning: string;
    grammar: string;
    pronunciation: string;
    pattern: string;
    example: string;
    paretoPrompt: string;
  };
  additionalTermCards: Array<{
    term: string;
    meaning: string;
    pronunciation: string;
    grammar: string;
    pattern: string;
    example: string;
    paretoPrompt: string;
  }>;
  memorySteps: ABCBookMemoryStep[];
  sentenceStructure: ABCBookSentenceStructure;
  contextGroups: ABCBookContextGroup[];
  sections: ABCBookSection[];
  chapters: ABCBookChapter[];
  phrases: ABCBookPhrase[];
};

export type ABCBookUnavailableDelivery = {
  available: false;
  edition: string;
  nativeLabel: string;
  targetLabel: string;
  unavailableMessage: string;
};

const A1_ORDERING_EXERCISES: ABCBookOrderingExercise[] = [
  {
    prompt: "Reorganize as palavras para formar uma apresentação completa.",
    scrambled: ["name", "is", "My", "Ana"],
    answer: "My name is Ana.",
    explanation: "Em uma apresentação simples, o possessivo my vem antes de name; is liga a pessoa ao nome.",
    followUpPrompt: "Troque Ana pelo seu nome e escreva a frase sem consultar o modelo.",
  },
  {
    prompt: "Reorganize as palavras para expressar uma necessidade educada.",
    scrambled: ["need", "I", "help"],
    answer: "I need help.",
    explanation: "A frase inglesa começa com o sujeito I, depois o verbo need e, por fim, o que é necessário.",
    followUpPrompt: "Acrescente with this word ou at the airport para tornar a ideia mais específica.",
  },
  {
    prompt: "Reorganize as palavras para perguntar por um lugar.",
    scrambled: ["is", "Where", "hotel", "the"],
    answer: "Where is the hotel?",
    explanation: "Em perguntas com where e be, a palavra interrogativa vem primeiro, seguida de is, sujeito e complemento.",
    followUpPrompt: "Troque hotel por airport e faça a pergunta novamente.",
  },
  {
    prompt: "Reorganize as palavras para falar de uma rotina com outra pessoa.",
    scrambled: ["studies", "My", "with", "English", "friend", "me", "every", "morning"],
    answer: "My friend studies English with me every morning.",
    explanation: "O sujeito My friend vem antes de studies; o objeto English vem antes das informações adicionais with me e every morning.",
    followUpPrompt: "Troque every morning por in the afternoon e mantenha a ordem principal.",
  },
  {
    prompt: "Reorganize as palavras para criar um plano para amanhã.",
    scrambled: ["will", "Tomorrow", "new", "practice", "I", "words", "after", "work"],
    answer: "Tomorrow, I will practice new words after work.",
    explanation: "Tomorrow pode abrir a frase. Depois aparecem sujeito, will, verbo principal, objeto e informação de tempo.",
    followUpPrompt: "Escreva um plano seu com I will e uma atividade de estudo.",
  },
  {
    prompt: "Reorganize as palavras para descrever um livro útil.",
    scrambled: ["is", "useful", "This", "a", "book", "for", "my", "English", "class"],
    answer: "This is a useful book for my English class.",
    explanation: "Em inglês, useful vem antes de book. A expressão for my English class explica a finalidade do livro.",
    followUpPrompt: "Troque useful por interesting e leia a nova frase em voz alta.",
  },
  {
    prompt: "Reorganize as palavras para ligar duas partes da rotina.",
    scrambled: ["in", "I", "work", "morning", "the", "and", "study", "English", "at", "night"],
    answer: "I work in the morning and study English at night.",
    explanation: "O sujeito I inicia a frase e vale para os dois verbos. O conector and une as duas ações sem repetir I.",
    followUpPrompt: "Substitua at night por in the evening e compare as duas expressões de tempo.",
  },
  {
    prompt: "Reorganize as palavras para fazer um pedido educado mais longo.",
    scrambled: ["you", "help", "Can", "me", "with", "this", "word", "please"],
    answer: "Can you help me with this word, please?",
    explanation: "Can abre a pergunta, you é o sujeito, help é o verbo e me with this word completa o pedido. Please suaviza a fala.",
    followUpPrompt: "Troque this word por this sentence e use a mesma estrutura.",
  },
  {
    prompt: "Reorganize as palavras para pedir repetição de forma gentil.",
    scrambled: ["can", "Sorry", "you", "say", "that", "again", "more", "slowly", "please"],
    answer: "Sorry, can you say that again more slowly, please?",
    explanation: "Sorry prepara o reparo. A pergunta começa com can you; again e more slowly explicam como a ação deve acontecer.",
    followUpPrompt: "Escreva outro pedido educado com sorry e please sem copiar a resposta-modelo.",
  },
  {
    prompt: "Reorganize as palavras para ligar estudo, tempo e conversa.",
    scrambled: ["Today", "learn", "one", "useful", "phrase", "before", "I", "talk", "to", "my", "teacher"],
    answer: "Today, I learn one useful phrase before I talk to my teacher.",
    explanation: "Today abre a frase. A primeira ideia é I learn one useful phrase; before introduz a segunda ação, I talk to my teacher.",
    followUpPrompt: "Troque one useful phrase por two new words e mantenha a ligação com before.",
  },
];

const A1_PARETO_CONTEXTS: ABCBookChapter["paretoContext"][] = [
  "foundation", "foundation", "foundation", "routine-time", "routine-time",
  "home", "routine-time", "transport", "transport", "social-circle",
];

const A1_CHAPTERS: ABCBookChapter[] = STRUCTURED_A1_UNITS.map((unit, index) => ({
  title: unit.unit,
  objective: unit.objective,
  reading: unit.reading,
  translation: unit.readingTranslation,
  grammarTitle: unit.grammarTitle,
  grammarExplanation: unit.grammarExplanation,
  writingPrompt: unit.writingPrompt,
  orderingExercise: A1_ORDERING_EXERCISES[index] ?? A1_ORDERING_EXERCISES[0],
  paretoContext: A1_PARETO_CONTEXTS[index] ?? "foundation",
}));

const PORTUGUESE_ENGLISH_BOOK: ABCBookDelivery = {
  available: true,
  edition: "Português → Inglês",
  nativeLabel: "Português",
  targetLabel: "Inglês",
  introduction: "Quando uma frase, uma palavra ou uma resposta parecer difícil, use este livro como um caderno de apoio. Comece pelo sentido, observe o padrão, recupere a palavra sem consultar e aplique-a em uma nova frase. O professor e a cena continuam disponíveis depois que você fechar o livro.",
  survivalIntro: "Leia primeiro em inglês, confirme o sentido em português e depois cubra a linha em inglês para recuperá-la de memória. Estas frases também servem como ponto de partida para falar com o professor.",
  alphabetIntroduction: "Comece pelo nome das letras. Depois, observe que uma mesma letra pode mudar de som quando forma uma palavra. Não tente decorar todos os casos de uma vez: leia a letra, ouça o exemplo e avance passo a passo.",
  alphabetLetters: [
    { letter: "A", name: "ei", guide: "/eɪ/" }, { letter: "B", name: "bi", guide: "/biː/" }, { letter: "C", name: "si", guide: "/siː/" }, { letter: "D", name: "di", guide: "/diː/" }, { letter: "E", name: "i", guide: "/iː/" }, { letter: "F", name: "ef", guide: "/ef/" }, { letter: "G", name: "dji", guide: "/dʒiː/" },
    { letter: "H", name: "eitch", guide: "/eɪtʃ/" }, { letter: "I", name: "ai", guide: "/aɪ/" }, { letter: "J", name: "djei", guide: "/dʒeɪ/" }, { letter: "K", name: "kei", guide: "/keɪ/" }, { letter: "L", name: "el", guide: "/el/" }, { letter: "M", name: "em", guide: "/em/" }, { letter: "N", name: "en", guide: "/en/" },
    { letter: "O", name: "ou", guide: "/oʊ/" }, { letter: "P", name: "pi", guide: "/piː/" }, { letter: "Q", name: "kiu", guide: "/kjuː/" }, { letter: "R", name: "ar", guide: "/ɑːr/" }, { letter: "S", name: "es", guide: "/es/" }, { letter: "T", name: "ti", guide: "/tiː/" }, { letter: "U", name: "iu", guide: "/juː/" },
    { letter: "V", name: "vi", guide: "/viː/" }, { letter: "W", name: "dâbliu", guide: "/ˈdʌbəljuː/" }, { letter: "X", name: "eks", guide: "/eks/" }, { letter: "Y", name: "uai", guide: "/waɪ/" }, { letter: "Z", name: "zi", guide: "/ziː/" },
  ],
  soundLessons: [
    {
      title: "A em palavra curta",
      explanation: "Em muitas palavras curtas, a letra a tem um som aberto e breve /æ/. Observe a boca mais aberta e não prolongue a vogal.",
      examples: [
        { target: "cat", pronunciation: "/kæt/", native: "gato" },
        { target: "map", pronunciation: "/mæp/", native: "mapa" },
        { target: "family", pronunciation: "/ˈfæm.əl.i/", native: "família" },
      ],
      writingPrompt: "Escreva cat e map. Depois crie: My family is here.",
    },
    {
      title: "A que diz o nome da letra",
      explanation: "Em alguns padrões, a letra a pode soar /eɪ/, como no próprio nome da letra. Ouça o som longo antes de escrever.",
      examples: [
        { target: "name", pronunciation: "/neɪm/", native: "nome" },
        { target: "late", pronunciation: "/leɪt/", native: "tarde" },
        { target: "same", pronunciation: "/seɪm/", native: "mesmo" },
      ],
      writingPrompt: "Escreva: My name is ____. Depois compare name e same.",
    },
    {
      title: "A em sílaba sem força",
      explanation: "Em palavras maiores, algumas vogais ficam fracas. Em family, o segundo a não recebe a força principal da palavra.",
      examples: [
        { target: "about", pronunciation: "/əˈbaʊt/", native: "sobre" },
        { target: "banana", pronunciation: "/bəˈnæn.ə/", native: "banana" },
        { target: "America", pronunciation: "/əˈmer.ɪ.kə/", native: "América" },
      ],
      writingPrompt: "Diga as palavras devagar e marque a sílaba que recebe mais força.",
    },
    {
      title: "I curto e I longo",
      explanation: "Compare o i curto /ɪ/ com o som longo /iː/. O primeiro é breve; o segundo dura um pouco mais e muda a palavra que o aluno reconhece.",
      examples: [
        { target: "sit", pronunciation: "/sɪt/", native: "sentar" },
        { target: "ship", pronunciation: "/ʃɪp/", native: "navio" },
        { target: "need", pronunciation: "/niːd/", native: "precisar" },
      ],
      writingPrompt: "Escreva sit e need. Leia cada uma sem acelerar e perceba qual som fica mais longo.",
    },
    {
      title: "E aberto",
      explanation: "O som /ɛ/ aparece em palavras como help e friend. Abra levemente a boca e não transforme esse e em i.",
      examples: [
        { target: "help", pronunciation: "/hɛlp/", native: "ajuda; ajudar" },
        { target: "friend", pronunciation: "/frɛnd/", native: "amigo ou amiga" },
        { target: "ten", pronunciation: "/tɛn/", native: "dez" },
      ],
      writingPrompt: "Copie help e friend. Depois escreva: My friend can help me.",
    },
    {
      title: "U central",
      explanation: "Em palavras como understand e bus, o som /ʌ/ é curto e central. Evite transformar a vogal em u prolongado do português.",
      examples: [
        { target: "bus", pronunciation: "/bʌs/", native: "ônibus" },
        { target: "cup", pronunciation: "/kʌp/", native: "xícara" },
        { target: "understand", pronunciation: "/ˌʌn.dɚˈstænd/", native: "entender" },
      ],
      writingPrompt: "Diga bus e cup. Em seguida, escreva: I understand the bus schedule.",
    },
    {
      title: "O em palavra curta",
      explanation: "Em inglês americano, o som de o em hot e not costuma ser aberto e curto /ɑ/. Não acrescente uma vogal depois da consoante final.",
      examples: [
        { target: "hot", pronunciation: "/hɑːt/", native: "quente" },
        { target: "not", pronunciation: "/nɑːt/", native: "não" },
        { target: "stop", pronunciation: "/stɑːp/", native: "parar" },
      ],
      writingPrompt: "Escreva: It is not hot today. Circule not e compare o som da vogal.",
    },
    {
      title: "P e B no início",
      explanation: "P e b são sons próximos, mas b vem com voz e p começa com uma pequena saída de ar. Compare sem colocar vogal antes da palavra.",
      examples: [
        { target: "pen", pronunciation: "/pɛn/", native: "caneta" },
        { target: "book", pronunciation: "/bʊk/", native: "livro" },
        { target: "please", pronunciation: "/pliːz/", native: "por favor" },
      ],
      writingPrompt: "Leia pen, book e please. Depois escreva um pedido com please e uma palavra com b.",
    },
    {
      title: "TH de thank e this",
      explanation: "O grupo th pode ter ar sem voz /θ/ como em thank ou voz /ð/ como em this. A língua toca de leve os dentes; não troque o som por f, d ou t.",
      examples: [
        { target: "thank", pronunciation: "/θæŋk/", native: "agradecer" },
        { target: "this", pronunciation: "/ðɪs/", native: "isto; esta" },
        { target: "three", pronunciation: "/θriː/", native: "três" },
      ],
      writingPrompt: "Escreva: Thank you for this book. Leia first thank e depois this com atenção ao som inicial.",
    },
    {
      title: "H soprado e combinações iniciais",
      explanation: "Em hello e help, h começa com uma saída leve de ar. Em study e speak, duas consoantes aparecem juntas no início: diga o conjunto sem inserir uma vogal extra.",
      examples: [
        { target: "hello", pronunciation: "/həˈloʊ/", native: "olá" },
        { target: "study", pronunciation: "/ˈstʌd.i/", native: "estudar" },
        { target: "speak", pronunciation: "/spiːk/", native: "falar" },
      ],
      writingPrompt: "Copie: Hello. I study and speak English. Depois sublinhe study e speak.",
    },
    {
      title: "R, L e final da palavra",
      explanation: "Em inglês, r e l precisam ser percebidos como sons diferentes. Também finalize a palavra: em word e world, o fim faz parte da mensagem.",
      examples: [
        { target: "read", pronunciation: "/riːd/", native: "ler" },
        { target: "learn", pronunciation: "/lɝːn/", native: "aprender" },
        { target: "word", pronunciation: "/wɝːd/", native: "palavra" },
      ],
      writingPrompt: "Escreva: I learn one word. Leia learn e word preservando o final da palavra.",
    },
  ],
  progressiveLessons: [
    {
      section: "Som e escrita",
      title: "C e G: um som pode mudar",
      explanation: "As letras c e g não têm sempre o mesmo som. Em palavras frequentes, observe a letra ao lado e trate cada palavra como uma combinação completa, não como uma letra isolada.",
      languageFocus: "Compare o c de cat com o c de city e o g de go com o g de gentle.",
      examples: [
        { target: "cat", native: "gato", note: "c com som /k/" },
        { target: "city", native: "cidade", note: "c com som /s/" },
        { target: "go", native: "ir", note: "g com som /g/" },
      ],
      writingPrompt: "Copie cat e city. Depois escreva: I go to the city.",
      scrambled: ["go", "I", "to", "the", "city"],
      answer: "I go to the city.",
      paretoPrompt: "No Pareto, recupere go e city pelo sentido e crie outra frase com to.",
    },
    {
      section: "Som e escrita",
      title: "O e silencioso no fim",
      explanation: "Em muitas palavras, a letra e final não ganha uma sílaba própria, mas muda o som da vogal anterior. Compare uma forma curta e outra com e final.",
      languageFocus: "A palavra final ajuda a perceber o som longo da vogal: cap/cape, kit/kite.",
      examples: [
        { target: "cap / cape", native: "boné / capa", note: "a muda de /æ/ para /eɪ/" },
        { target: "kit / kite", native: "kit / pipa", note: "i muda de /ɪ/ para /aɪ/" },
        { target: "not / note", native: "não / nota", note: "o muda de som" },
      ],
      writingPrompt: "Escreva os pares e circule a letra e final. Leia cada par lentamente.",
      scrambled: ["a", "write", "note", "I"],
      answer: "I write a note.",
      paretoPrompt: "No Pareto, recupere note e write; depois descreva o que você escreve.",
    },
    {
      section: "Som e escrita",
      title: "Final -s: mais de uma forma de ouvir",
      explanation: "O final -s pode indicar plural ou uma ação com he, she ou it. O som varia, mas a escrita ajuda a perceber a função da palavra na frase.",
      languageFocus: "Veja books como plural e studies como ação de uma pessoa.",
      examples: [
        { target: "books", native: "livros", note: "plural de book" },
        { target: "friends", native: "amigos", note: "plural de friend" },
        { target: "she studies", native: "ela estuda", note: "verbo no presente com she" },
      ],
      writingPrompt: "Escreva uma frase com two books e outra com she studies.",
      scrambled: ["studies", "English", "She", "every", "day"],
      answer: "She studies English every day.",
      paretoPrompt: "No Pareto, recupere book, friend e study; compare plural e verbo com s.",
    },
    {
      section: "Som e escrita",
      title: "Final -ed: ação concluída",
      explanation: "O final -ed aparece em muitas ações no passado. Nesta etapa, primeiro reconheça o padrão e a ideia de ação concluída; a pronúncia detalhada será retomada mais adiante.",
      languageFocus: "Palavras como worked e studied mostram que a ação aconteceu antes de agora.",
      examples: [
        { target: "worked", native: "trabalhou", note: "ação concluída" },
        { target: "studied", native: "estudou", note: "y muda para i antes de ed" },
        { target: "helped", native: "ajudou", note: "ação concluída" },
      ],
      writingPrompt: "Copie: I studied English yesterday. Depois troque studied por worked.",
      scrambled: ["studied", "I", "English", "yesterday"],
      answer: "I studied English yesterday.",
      paretoPrompt: "No Pareto, recupere study, work e help e observe a ideia de ação concluída.",
    },
    {
      section: "Palavras que constroem frases",
      title: "Pronomes: quem aparece na frase",
      explanation: "Em inglês, o sujeito normalmente é dito. Os pronomes substituem nomes e ajudam o leitor a saber quem faz a ação.",
      languageFocus: "I, you, we e they acompanham pessoas; he, she e it apontam para uma pessoa ou coisa já conhecida.",
      examples: [
        { target: "I study.", native: "Eu estudo.", note: "quem fala" },
        { target: "She works.", native: "Ela trabalha.", note: "uma pessoa mencionada" },
        { target: "They live here.", native: "Eles moram aqui.", note: "mais de uma pessoa" },
      ],
      writingPrompt: "Escreva uma frase com I e outra com he, she ou they.",
      scrambled: ["live", "They", "near", "here"],
      answer: "They live near here.",
      paretoPrompt: "No Pareto, recupere os pronomes e escolha o sujeito certo para cada ação.",
    },
    {
      section: "Palavras que constroem frases",
      title: "O verbo be: ser e estar",
      explanation: "O verbo be liga uma pessoa, lugar ou coisa a uma informação. Ele muda conforme o sujeito: am, is e are.",
      languageFocus: "Use I am, you are, he/she/it is e we/they are.",
      examples: [
        { target: "I am ready.", native: "Eu estou pronto ou pronta.", note: "am com I" },
        { target: "She is my friend.", native: "Ela é minha amiga.", note: "is com she" },
        { target: "We are at home.", native: "Nós estamos em casa.", note: "are com we" },
      ],
      writingPrompt: "Complete três frases verdadeiras com am, is ou are.",
      scrambled: ["ready", "I", "am", "to", "learn"],
      answer: "I am ready to learn.",
      paretoPrompt: "No Pareto, recupere am, is, are, ready e home; monte frases sem consultar.",
    },
    {
      section: "Palavras que constroem frases",
      title: "Possessivos: de quem é?",
      explanation: "My, your, his, her, our e their vêm antes do nome para indicar a quem algo pertence. Eles evitam repetir o nome da pessoa.",
      languageFocus: "O possessivo vem antes do substantivo: my book, her name, our class.",
      examples: [
        { target: "my name", native: "meu nome", note: "quem fala" },
        { target: "her book", native: "o livro dela", note: "uma mulher ou menina" },
        { target: "our class", native: "nossa turma", note: "grupo de quem fala" },
      ],
      writingPrompt: "Escreva uma frase com my e uma frase com your.",
      scrambled: ["is", "My", "this", "book"],
      answer: "This is my book.",
      paretoPrompt: "No Pareto, recupere my, your e book; troque apenas o possessivo e explique o sentido.",
    },
    {
      section: "Palavras que constroem frases",
      title: "A, an e the: apresentar e retomar",
      explanation: "Use a ou an para apresentar uma coisa ainda não identificada. Use the quando a pessoa já sabe qual coisa é ou quando há uma referência específica no contexto.",
      languageFocus: "A aparece antes de som consonantal; an, antes de som vocálico. The retoma algo conhecido.",
      examples: [
        { target: "a book", native: "um livro", note: "apresentação geral" },
        { target: "an airport", native: "um aeroporto", note: "som inicial vocálico" },
        { target: "the airport", native: "o aeroporto", note: "lugar específico no contexto" },
      ],
      writingPrompt: "Escreva uma frase com a e outra com the usando um objeto ou lugar real.",
      scrambled: ["is", "the", "Where", "airport"],
      answer: "Where is the airport?",
      paretoPrompt: "No Pareto, recupere book, airport e os artigos; escolha a forma adequada pela situação.",
    },
    {
      section: "Números e quantidade",
      title: "Números de um a dez",
      explanation: "Números aparecem em horários, preços, endereços e quantidades. Leia em ordem, depois fora de ordem, até reconhecer cada forma rapidamente.",
      languageFocus: "one, two, three, four, five, six, seven, eight, nine, ten.",
      examples: [
        { target: "one book", native: "um livro", note: "quantidade singular" },
        { target: "two friends", native: "dois amigos", note: "quantidade plural" },
        { target: "ten words", native: "dez palavras", note: "meta de estudo" },
      ],
      writingPrompt: "Escreva três quantidades reais que você vê hoje.",
      scrambled: ["have", "I", "two", "books"],
      answer: "I have two books.",
      paretoPrompt: "No Pareto, recupere números, book e friend; crie frases de quantidade.",
    },
    {
      section: "Números e quantidade",
      title: "Números em horários e preços",
      explanation: "O mesmo número muda de função conforme o contexto. Com time, ele organiza uma hora; com price, organiza uma compra; com page, organiza a leitura.",
      languageFocus: "Use at para hora e combine número com a unidade que dá sentido à informação.",
      examples: [
        { target: "at eight", native: "às oito", note: "horário" },
        { target: "five dollars", native: "cinco dólares", note: "preço" },
        { target: "page ten", native: "página dez", note: "posição no livro" },
      ],
      writingPrompt: "Escreva uma hora e um preço fictício usando números em inglês.",
      scrambled: ["at", "I", "study", "eight"],
      answer: "I study at eight.",
      paretoPrompt: "No Pareto, recupere números e tempo; diga uma rotina com at.",
    },
    {
      section: "Objetos e estudo",
      title: "Objetos da mesa de estudo",
      explanation: "Aprender objetos próximos permite criar frases úteis e imediatas. Primeiro nomeie; depois indique posse, posição e ação.",
      languageFocus: "book, pen, notebook, paper, phone e computer.",
      examples: [
        { target: "a pen", native: "uma caneta", note: "objeto para escrever" },
        { target: "a notebook", native: "um caderno", note: "objeto para registrar" },
        { target: "my phone", native: "meu telefone", note: "objeto pessoal" },
      ],
      writingPrompt: "Liste três objetos da sua mesa e escreva uma frase com um deles.",
      scrambled: ["on", "The", "is", "table", "pen", "the"],
      answer: "The pen is on the table.",
      paretoPrompt: "No Pareto, recupere pen, notebook e phone; use cada termo em uma frase curta.",
    },
    {
      section: "Descrição cotidiana",
      title: "Cores ajudam a identificar",
      explanation: "Uma cor acrescenta uma informação simples ao substantivo. Em inglês, o adjetivo vem antes da coisa descrita.",
      languageFocus: "Use a ordem adjetivo + substantivo: a blue pen, a red book.",
      examples: [
        { target: "a blue pen", native: "uma caneta azul", note: "adjetivo antes do nome" },
        { target: "a red book", native: "um livro vermelho", note: "cor identifica objeto" },
        { target: "a green bag", native: "uma bolsa verde", note: "mesma ordem" },
      ],
      writingPrompt: "Descreva dois objetos com cor e nome em inglês.",
      scrambled: ["have", "a", "blue", "I", "pen"],
      answer: "I have a blue pen.",
      paretoPrompt: "No Pareto, recupere uma cor e um objeto; preserve a ordem do inglês.",
    },
    {
      section: "Descrição cotidiana",
      title: "Tamanho e quantidade",
      explanation: "Small, big, long e short descrevem tamanho. Some, many e a little ajudam a falar de quantidade. Escolha apenas uma informação nova por frase no início.",
      languageFocus: "O adjetivo vem antes do substantivo; expressões de quantidade organizam o que é contado ou não contado.",
      examples: [
        { target: "a small house", native: "uma casa pequena", note: "tamanho antes do nome" },
        { target: "many books", native: "muitos livros", note: "plural contável" },
        { target: "a little water", native: "um pouco de água", note: "quantidade não contável" },
      ],
      writingPrompt: "Escreva uma frase com small ou big e outra com many ou a little.",
      scrambled: ["a", "small", "My", "house", "is"],
      answer: "My house is small.",
      paretoPrompt: "No Pareto, recupere house, water e um adjetivo ou expressão de quantidade.",
    },
    {
      section: "Necessidades e pedidos",
      title: "Querer e precisar",
      explanation: "Need fala de necessidade. Want fala de vontade ou escolha. A diferença muda o tom da mensagem e ajuda o aluno a ser preciso em situações reais.",
      languageFocus: "Use I need para algo necessário e I want para algo desejado ou escolhido.",
      examples: [
        { target: "I need help.", native: "Eu preciso de ajuda.", note: "necessidade" },
        { target: "I want water.", native: "Eu quero água.", note: "vontade ou escolha" },
        { target: "I would like water, please.", native: "Eu gostaria de água, por favor.", note: "pedido educado" },
      ],
      writingPrompt: "Escreva uma necessidade e um pedido educado em duas frases.",
      scrambled: ["like", "I", "would", "water", "please"],
      answer: "I would like water, please.",
      paretoPrompt: "No Pareto, compare need, want e would like usando o mesmo objeto.",
    },
    {
      section: "Vida cotidiana",
      title: "Comida e bebida em contexto",
      explanation: "Palavras de comida funcionam melhor dentro de um pedido, uma preferência ou uma rotina. Combine nome do item com want, like ou have.",
      languageFocus: "food, coffee, tea, bread, fruit, water e meal aparecem em pedidos e hábitos.",
      examples: [
        { target: "I like tea.", native: "Eu gosto de chá.", note: "preferência" },
        { target: "We have bread.", native: "Nós temos pão.", note: "disponibilidade" },
        { target: "I would like coffee.", native: "Eu gostaria de café.", note: "pedido" },
      ],
      writingPrompt: "Escreva uma frase sobre algo que você gosta e outra sobre um pedido educado.",
      scrambled: ["like", "I", "tea", "and", "bread"],
      answer: "I like tea and bread.",
      paretoPrompt: "No Pareto, recupere uma bebida, um alimento e um verbo de preferência.",
    },
    {
      section: "Casa e cidade",
      title: "Lugares que você usa todos os dias",
      explanation: "Home, school, work, store e park organizam a vida diária. Uma frase clara mostra para onde você vai ou onde você está.",
      languageFocus: "Use at para estar em um lugar e to para indicar direção ou destino.",
      examples: [
        { target: "at home", native: "em casa", note: "localização" },
        { target: "go to school", native: "ir à escola", note: "destino" },
        { target: "at work", native: "no trabalho", note: "localização" },
      ],
      writingPrompt: "Escreva uma frase com at e outra com go to.",
      scrambled: ["go", "to", "work", "I", "at", "nine"],
      answer: "I go to work at nine.",
      paretoPrompt: "No Pareto, recupere home, school, work e os conectores at/to.",
    },
    {
      section: "Casa e cidade",
      title: "Serviços úteis na cidade",
      explanation: "Bank, pharmacy, market, hospital e library nomeiam lugares que resolvem necessidades práticas. Aprenda o lugar junto da pergunta que você realmente faria.",
      languageFocus: "Use Where is the…? para perguntar localização de um serviço.",
      examples: [
        { target: "the pharmacy", native: "a farmácia", note: "saúde e remédio" },
        { target: "the market", native: "o mercado", note: "compras" },
        { target: "the library", native: "a biblioteca", note: "estudo e leitura" },
      ],
      writingPrompt: "Escreva duas perguntas com Where is the…? usando lugares diferentes.",
      scrambled: ["is", "the", "Where", "pharmacy"],
      answer: "Where is the pharmacy?",
      paretoPrompt: "No Pareto, recupere pharmacy, market e library e pratique perguntas de localização.",
    },
    {
      section: "Deslocamento",
      title: "Chegar e sair",
      explanation: "Arrive e leave organizam começo e fim de um trajeto. Acrescente o lugar ou horário depois do verbo para explicar melhor a situação.",
      languageFocus: "Use arrive at para lugar específico e leave + lugar para ponto de saída.",
      examples: [
        { target: "arrive at the station", native: "chegar à estação", note: "chegada" },
        { target: "leave home", native: "sair de casa", note: "saída" },
        { target: "take the bus", native: "pegar o ônibus", note: "meio de transporte" },
      ],
      writingPrompt: "Escreva uma frase sobre como você sai de casa ou chega a um lugar.",
      scrambled: ["the", "take", "I", "bus", "to", "work"],
      answer: "I take the bus to work.",
      paretoPrompt: "No Pareto, recupere bus, station, arrive e leave e monte um trajeto simples.",
    },
    {
      section: "Tempo e clima",
      title: "Falar do tempo de hoje",
      explanation: "Weather não serve apenas para conversa pequena: ele ajuda a explicar roupa, planos e sensação do dia. Comece com It is e uma condição simples.",
      languageFocus: "Use It is + adjetivo para muitas condições: sunny, cold, warm e rainy.",
      examples: [
        { target: "It is sunny.", native: "Está ensolarado.", note: "sol" },
        { target: "It is cold today.", native: "Está frio hoje.", note: "temperatura" },
        { target: "It is rainy.", native: "Está chuvoso.", note: "chuva" },
      ],
      writingPrompt: "Descreva o tempo de hoje e diga uma atividade possível nesse clima.",
      scrambled: ["is", "It", "warm", "today"],
      answer: "It is warm today.",
      paretoPrompt: "No Pareto, recupere today, warm, cold e sunny; descreva o dia sem consultar.",
    },
    {
      section: "Trabalho e estudo",
      title: "Ações de uma rotina produtiva",
      explanation: "Read, write, learn, work, practice e rest ajudam a contar o que você faz. Junte uma ação a um horário ou lugar para construir uma ideia mais completa.",
      languageFocus: "No presente simples, o sujeito vem antes da ação; informação de tempo costuma completar a frase.",
      examples: [
        { target: "I read at night.", native: "Eu leio à noite.", note: "ação e horário" },
        { target: "We practice English.", native: "Nós praticamos inglês.", note: "ação e objeto" },
        { target: "They work today.", native: "Eles trabalham hoje.", note: "sujeito plural" },
      ],
      writingPrompt: "Escreva três ações que fazem parte do seu dia usando tempos diferentes.",
      scrambled: ["practice", "We", "English", "after", "work"],
      answer: "We practice English after work.",
      paretoPrompt: "No Pareto, recupere read, write, learn, work e practice; crie uma rotina com duas ações.",
    },
    {
      section: "Tecnologia e comunicação",
      title: "Uma mensagem curta e clara",
      explanation: "Mensagens úteis precisam de pessoa, ação e informação principal. Use o vocabulário digital para pedir, confirmar ou avisar algo sem escrever uma frase longa demais.",
      languageFocus: "message, call, email, phone, computer e online aparecem em ações de comunicação.",
      examples: [
        { target: "Send me a message.", native: "Envie-me uma mensagem.", note: "pedido" },
        { target: "I check my email.", native: "Eu verifico meu e-mail.", note: "rotina" },
        { target: "The class is online.", native: "A aula é on-line.", note: "informação" },
      ],
      writingPrompt: "Escreva uma mensagem curta para combinar um horário de estudo.",
      scrambled: ["a", "Send", "me", "message", "please"],
      answer: "Send me a message, please.",
      paretoPrompt: "No Pareto, recupere message, email, phone e online e crie um aviso útil.",
    },
    {
      section: "Revisão do bloco",
      title: "Da palavra ao pequeno texto",
      explanation: "Agora reúna sons, palavras frequentes, lugar, tempo e ação. Um pequeno texto não precisa ter palavras difíceis: precisa manter a ordem compreensível de cada ideia.",
      languageFocus: "Escreva começo, informação principal e complemento de tempo ou lugar. Use and ou then para ligar duas ações.",
      examples: [
        { target: "I study at home.", native: "Eu estudo em casa.", note: "ideia principal" },
        { target: "Then I write new words.", native: "Depois eu escrevo palavras novas.", note: "sequência" },
        { target: "My friend reads with me.", native: "Meu amigo lê comigo.", note: "pessoa e companhia" },
      ],
      writingPrompt: "Escreva três frases sobre uma sessão de estudo. Ligue duas delas com then ou and.",
      scrambled: ["study", "at", "home", "I", "and", "write", "new", "words"],
      answer: "I study at home and write new words.",
      paretoPrompt: "No Pareto, escolha dez palavras deste bloco e recupere-as em três frases conectadas.",
    },
    {
      section: "Vida cotidiana",
      title: "Como você está hoje?",
      explanation: "Estados pessoais ajudam a começar uma conversa real. Use o verbo be para dizer como você está; em seguida, acrescente uma razão simples apenas se ela for útil para a mensagem.",
      languageFocus: "Use I am + estado: ready, tired, happy, hungry ou fine. A resposta curta pode virar uma frase mais completa.",
      examples: [
        { target: "I am ready.", native: "Eu estou pronto ou pronta.", note: "disposição" },
        { target: "I am tired today.", native: "Eu estou cansado ou cansada hoje.", note: "estado e tempo" },
        { target: "She is happy.", native: "Ela está feliz.", note: "estado de outra pessoa" },
      ],
      writingPrompt: "Escreva como você está hoje e acrescente uma atividade que pretende fazer.",
      scrambled: ["today", "I", "am", "ready", "to", "learn"],
      answer: "I am ready to learn today.",
      paretoPrompt: "No Pareto, recupere ready, tired, happy e today; diga uma frase verdadeira sem olhar.",
    },
    {
      section: "Vida cotidiana",
      title: "Uma conversa curta sobre o dia",
      explanation: "Uma conversa básica tem abertura, pergunta, resposta e continuação. O objetivo não é decorar um diálogo inteiro, mas reconhecer a ordem de uma troca real.",
      languageFocus: "Comece com uma saudação, use How are you? e responda com I am…; depois acrescente uma informação curta.",
      examples: [
        { target: "Hello. How are you?", native: "Olá. Como você está?", note: "abertura e pergunta" },
        { target: "I am fine, thank you.", native: "Estou bem, obrigado ou obrigada.", note: "resposta educada" },
        { target: "I am fine. I study today.", native: "Estou bem. Eu estudo hoje.", note: "continuação simples" },
      ],
      writingPrompt: "Escreva um diálogo de quatro linhas com saudação, pergunta, resposta e uma informação sobre hoje.",
      scrambled: ["are", "How", "you", "today"],
      answer: "How are you today?",
      paretoPrompt: "No Pareto, recupere hello, how, are, fine e today; faça a pergunta e responda sem consultar.",
    },
  ],
  memorySteps: [
    {
      title: "1. Veja a ideia",
      instruction: "Leia uma frase curta e imagine a situação concreta antes de tentar decorar qualquer palavra isolada.",
      example: "I need water. Imagine uma pessoa com sede pedindo água.",
    },
    {
      title: "2. Escute o som",
      instruction: "Observe o som principal e repita devagar. A pronúncia vem antes da velocidade.",
      example: "need /niːd/: mantenha o som longo no meio da palavra.",
    },
    {
      title: "3. Ligue som, escrita e sentido",
      instruction: "Olhe a palavra, diga o sentido e copie apenas uma vez com atenção às letras.",
      example: "need → precisar. Escreva: I need water.",
    },
    {
      title: "4. Cubra e recupere",
      instruction: "Esconda o modelo. Diga ou escreva a palavra a partir do sentido em português.",
      example: "Eu preciso de água. → I need water.",
    },
    {
      title: "5. Troque uma peça",
      instruction: "Mantenha a estrutura e substitua somente uma informação. Assim a frase vira um padrão útil.",
      example: "I need water. → I need help. → I need a ticket.",
    },
    {
      title: "6. Escreva uma ideia sua",
      instruction: "Use uma informação real. Primeiro escreva à mão ou no caderno; depois digite sem consultar o exemplo.",
      example: "I need help with this word.",
    },
    {
      title: "7. Revise com Pareto",
      instruction: "Leve a frase ao Pareto para recuperar sem olhar hoje, amanhã e nos próximos intervalos de revisão.",
      example: "Recupere need, help e water em uma frase nova.",
    },
  ],
  sentenceStructure: {
    title: "Da ideia à frase: português e inglês",
    introduction: "As duas línguas usam muitas vezes uma ideia com quem faz algo, ação e complemento. O objetivo é perceber a ordem natural de cada idioma e escrever uma frase de cada vez.",
    sharedPattern: "Ideia básica: sujeito + verbo + complemento. Exemplo: Eu preciso de água. / I need water.",
    portuguesePattern: "Em português, o sujeito pode ficar implícito porque a forma do verbo frequentemente mostra quem age: Preciso de água. Os adjetivos normalmente vêm depois do substantivo: uma palavra útil.",
    englishPattern: "Em inglês, o sujeito normalmente aparece: I need water. Os adjetivos costumam vir antes do substantivo: a useful word.",
    questionPattern: "Perguntas: em português, a entonação pode manter a ordem da afirmação: Você precisa de ajuda? Em inglês, o auxiliar ou verbo vem antes do sujeito: Do you need help? / Can you help me?",
    negativePattern: "Negação: português usa não antes do verbo: Eu não entendo. Inglês usa do not ou outra forma auxiliar no presente simples: I do not understand.",
    handwritingInstruction: "No papel, deixe uma linha por ideia: quem? faz o quê? com quem ou com o quê? Depois compare somente a ordem das palavras.",
    typingInstruction: "Ao digitar, escreva primeiro a frase completa sem corretor automático. Em seguida, confira maiúscula inicial, espaço entre palavras e ponto final.",
  },
  contextGroups: [
    {
      title: "Contexto 1 — Família",
      purpose: "Apresente as pessoas da família e escolha a palavra que mostra a relação exata. Comece pelo grupo e depois nomeie a pessoa.",
      words: [
        { target: "family", native: "família", relation: "o grupo de pessoas ligadas por parentesco" },
        { target: "parents", native: "pais", relation: "pai e mãe considerados juntos" },
        { target: "mother / father", native: "mãe / pai", relation: "pessoas específicas dentro de parents" },
        { target: "child", native: "filho, filha ou criança", relation: "pessoa jovem da família; o contexto define o sentido" },
        { target: "relative", native: "parente", relation: "membro da família que não precisa ser pai, mãe ou irmão" },
      ],
      contrast: "family é o conjunto; relative é uma pessoa da família. parents reúne mother e father.",
      modelSentence: "My family is small. My parents live in Brazil. — Minha família é pequena. Meus pais moram no Brasil.",
      writingPrompt: "Escreva duas frases: uma sobre your family e outra sobre uma pessoa específica, usando mother, father ou relative.",
      paretoPrompt: "No Pareto, recupere family, parents e relative sem olhar e crie uma frase diferente da frase-modelo.",
    },
    {
      title: "Contexto 2 — Círculo social",
      purpose: "Diferencie convivência, estudo, trabalho e vizinhança. As palavras não são iguais: cada uma nomeia o tipo de vínculo.",
      words: [
        { target: "friend", native: "amigo ou amiga", relation: "pessoa com quem existe amizade" },
        { target: "close friend", native: "amigo próximo", relation: "friend com vínculo de maior confiança" },
        { target: "classmate", native: "colega de classe", relation: "pessoa que estuda na mesma turma" },
        { target: "colleague", native: "colega de trabalho", relation: "pessoa do ambiente profissional" },
        { target: "neighbor", native: "vizinho ou vizinha", relation: "pessoa que mora perto; pode ou não ser friend" },
      ],
      contrast: "friend descreve amizade; classmate, colleague e neighbor descrevem o lugar ou a convivência. Uma mesma pessoa pode ter mais de um desses papéis.",
      modelSentence: "My classmate is my friend. My neighbor is very kind. — Meu colega de classe é meu amigo. Meu vizinho é muito gentil.",
      writingPrompt: "Escreva uma frase sobre um classmate ou colleague e outra sobre um friend ou neighbor. Compare os papéis com cuidado.",
      paretoPrompt: "No Pareto, recupere friend, classmate e neighbor e explique em português qual é a diferença entre elas.",
    },
    {
      title: "Contexto 3 — Rotina e tempo",
      purpose: "Una uma ação à informação que mostra quando ela acontece. A palavra de tempo organiza a ideia e ajuda a formar hábitos e planos.",
      words: [
        { target: "today / tomorrow", native: "hoje / amanhã", relation: "tempo atual e plano próximo" },
        { target: "every morning", native: "toda manhã", relation: "frequência e rotina" },
        { target: "always / sometimes", native: "sempre / às vezes", relation: "frequência alta ou parcial" },
        { target: "now", native: "agora", relation: "ação no momento presente" },
      ],
      contrast: "today nomeia o dia atual; tomorrow aponta o plano seguinte. every morning descreve rotina; now descreve o momento presente.",
      modelSentence: "Today, I study English. I practice new words every morning. — Hoje, eu estudo inglês. Eu pratico palavras novas toda manhã.",
      writingPrompt: "Escreva uma frase sobre hoje e outra sobre amanhã. Depois acrescente uma rotina com every morning ou sometimes.",
      paretoPrompt: "No Pareto, use o contexto Rotina e tempo para recuperar today, tomorrow e uma expressão de frequência antes de montar a frase.",
    },
    {
      title: "Contexto 4 — Casa",
      purpose: "Nomeie os lugares e objetos de casa que ajudam a contar uma rotina real. Comece pelo lugar; depois acrescente a ação ou a qualidade.",
      words: [
        { target: "house / apartment", native: "casa / apartamento", relation: "moradia geral ou unidade residencial" },
        { target: "bedroom / living room", native: "quarto / sala", relation: "espaço de descanso ou convivência" },
        { target: "kitchen", native: "cozinha", relation: "lugar de preparar comida" },
        { target: "door / window", native: "porta / janela", relation: "abertura de entrada ou de luz e ar" },
      ],
      contrast: "house fala da moradia como um todo; bedroom, living room e kitchen são partes específicas dela.",
      modelSentence: "I cook in the kitchen and read in the living room. — Eu cozinho na cozinha e leio na sala.",
      writingPrompt: "Descreva dois lugares da sua casa e uma ação que você faz em cada um.",
      paretoPrompt: "No Pareto, abra o contexto Casa e ordene uma frase com I, a ação e o lugar.",
    },
    {
      title: "Contexto 5 — Deslocamento",
      purpose: "Aprenda a dizer como chega a um lugar e onde começa ou termina um trajeto. O transporte aparece junto com a estação, o aeroporto ou o destino.",
      words: [
        { target: "bus / train / subway", native: "ônibus / trem / metrô", relation: "meios de transporte coletivo" },
        { target: "station", native: "estação", relation: "ponto de saída ou chegada de trem e metrô" },
        { target: "airport", native: "aeroporto", relation: "ponto de viagem aérea" },
        { target: "ticket", native: "bilhete ou passagem", relation: "documento de acesso ao trajeto" },
      ],
      contrast: "bus, train e subway são meios de transporte; station e airport são lugares; ticket permite usar o serviço.",
      modelSentence: "I take the bus to the station. Then I go to the airport. — Eu pego o ônibus para a estação. Depois vou ao aeroporto.",
      writingPrompt: "Escreva como você chega a um lugar conhecido e inclua um meio de transporte e um destino.",
      paretoPrompt: "No Pareto, abra o contexto Deslocamento e recupere o transporte, o lugar e a ordem da frase.",
    },
  ],
  termCard: {
    term: "need",
    meaning: "precisar; ter necessidade de",
    grammar: "verbo principal; costuma ser seguido de um substantivo ou de to + verbo",
    pronunciation: "/niːd/ — alongue a vogal central antes do d final",
    pattern: "I need + coisa/ação: I need water. / I need to study.",
    example: "I need help at the airport. — Eu preciso de ajuda no aeroporto.",
    paretoPrompt: "Sem olhar, escreva uma necessidade real sua usando need e leve a frase para a prática Pareto.",
  },
  additionalTermCards: [
    {
      term: "help",
      meaning: "ajuda; ajudar",
      pronunciation: "/hɛlp/",
      grammar: "substantivo contável ou verbo; com need, atua como substantivo",
      pattern: "I need help with + assunto: I need help with this word.",
      example: "Can you help me, please? — Você pode me ajudar, por favor?",
      paretoPrompt: "Escreva uma pergunta educada pedindo help para uma situação real.",
    },
    {
      term: "water",
      meaning: "água",
      pronunciation: "/ˈwɔː.t̬ɚ/",
      grammar: "substantivo não contável; use some ou a glass of para indicar quantidade",
      pattern: "I would like + água/bebida: I would like water, please.",
      example: "Could I have some water, please? — Eu poderia tomar um pouco de água, por favor?",
      paretoPrompt: "Crie um pedido educado com water e pratique-o sem consultar o modelo.",
    },
    {
      term: "where",
      meaning: "onde",
      pronunciation: "/wɛr/",
      grammar: "advérbio interrogativo usado para perguntar por lugar ou localização",
      pattern: "Where is + lugar/coisa?: Where is the hotel?",
      example: "Where is the airport? — Onde fica o aeroporto?",
      paretoPrompt: "Escreva uma pergunta de localização com where e responda usando in, on ou near.",
    },
    {
      term: "airport",
      meaning: "aeroporto",
      pronunciation: "/ˈɛr.pɔːrt/",
      grammar: "substantivo contável; use the quando falar de um aeroporto específico conhecido no contexto",
      pattern: "at/to the airport: I am at the airport. / I need to go to the airport.",
      example: "I need help at the airport. — Eu preciso de ajuda no aeroporto.",
      paretoPrompt: "Crie uma frase de necessidade ou localização usando airport e pratique-a em voz alta.",
    },
    {
      term: "friend",
      meaning: "amigo; amiga",
      pronunciation: "/frɛnd/",
      grammar: "substantivo contável; use my, your, his ou her para indicar de quem é a amizade",
      pattern: "My friend + verbo: My friend studies English.",
      example: "My friend practices with me. — Minha amiga pratica comigo.",
      paretoPrompt: "Escreva uma frase sobre um friend e acrescente uma ação que essa pessoa faz na rotina.",
    },
    {
      term: "morning",
      meaning: "manhã",
      pronunciation: "/ˈmɔːr.nɪŋ/",
      grammar: "substantivo de período do dia; use in the morning para situar uma rotina",
      pattern: "ação + in the morning: I study English in the morning.",
      example: "I practice new words in the morning. — Eu pratico palavras novas de manhã.",
      paretoPrompt: "Crie uma frase verdadeira com morning e leve-a para a recuperação Pareto sem consultar o modelo.",
    },
    {
      term: "study",
      meaning: "estudar",
      pronunciation: "/ˈstʌd.i/",
      grammar: "verbo regular; com I, you, we e they, use study; com he, she e it, use studies",
      pattern: "I study + idioma/assunto: I study English every day.",
      example: "We study new words together. — Nós estudamos palavras novas juntos.",
      paretoPrompt: "Escreva quando e o que você study; depois transforme a frase em uma pergunta ao Professor.",
    },
    {
      term: "tomorrow",
      meaning: "amanhã",
      pronunciation: "/təˈmɑːr.oʊ/",
      grammar: "advérbio de tempo; pode aparecer no fim ou no início de uma frase sobre um plano próximo",
      pattern: "I will + ação + tomorrow: I will practice tomorrow.",
      example: "I will review this word tomorrow. — Vou revisar esta palavra amanhã.",
      paretoPrompt: "Planeje uma revisão curta com tomorrow e repita a frase sem olhar antes de seguir no Pareto.",
    },
    {
      term: "book",
      meaning: "livro",
      pronunciation: "/bʊk/",
      grammar: "substantivo contável; use a/an para um livro e the para um livro específico no contexto",
      pattern: "This is + a book: This is a useful book.",
      example: "I have a book for my English class. — Eu tenho um livro para minha aula de inglês.",
      paretoPrompt: "Descreva um book que você usa para aprender e transforme a ideia em uma frase própria.",
    },
    {
      term: "work",
      meaning: "trabalhar; trabalho",
      pronunciation: "/wɝːk/",
      grammar: "pode ser verbo ou substantivo não contável; como verbo, use work com I, you, we e they",
      pattern: "I work + lugar/horário: I work in the morning.",
      example: "I work and study English every day. — Eu trabalho e estudo inglês todos os dias.",
      paretoPrompt: "Crie uma frase sobre work e acrescente quando você estuda ou pratica depois da rotina.",
    },
    {
      term: "can",
      meaning: "poder; conseguir",
      pronunciation: "/kæn/",
      grammar: "verbo modal; é seguido do verbo principal sem to e não muda com he ou she",
      pattern: "Can you + verbo?: Can you help me?",
      example: "Can you speak slowly, please? — Você pode falar devagar, por favor?",
      paretoPrompt: "Crie uma pergunta útil com can e use-a como abertura de conversa com o Professor.",
    },
    {
      term: "please",
      meaning: "por favor",
      pronunciation: "/pliːz/",
      grammar: "marcador de cortesia; pode aparecer no fim de pedidos e perguntas educadas",
      pattern: "pedido + please: Repeat that, please.",
      example: "Please show me the way. — Por favor, mostre-me o caminho.",
      paretoPrompt: "Transforme um pedido direto em pedido educado acrescentando please e pratique-o em voz alta.",
    },
    {
      term: "hello",
      meaning: "olá",
      pronunciation: "/həˈloʊ/",
      grammar: "saudação neutra; pode abrir uma conversa curta antes de uma apresentação ou pedido",
      pattern: "Hello, + nome/ideia: Hello, I am ready to learn.",
      example: "Hello, my name is Ana. — Olá, meu nome é Ana.",
      paretoPrompt: "Crie uma apresentação curta que comece com hello e diga-a antes de falar com o Professor.",
    },
    {
      term: "thank you",
      meaning: "obrigado; obrigada",
      pronunciation: "/ˈθæŋk juː/",
      grammar: "expressão fixa de agradecimento; pode ser seguida de for + motivo para tornar a resposta mais completa",
      pattern: "Thank you for + motivo: Thank you for your help.",
      example: "Thank you for speaking slowly. — Obrigado por falar devagar.",
      paretoPrompt: "Agradeça uma ajuda real usando thank you e acrescente o motivo com for.",
    },
    {
      term: "sorry",
      meaning: "desculpe; sinto muito",
      pronunciation: "/ˈsɑːr.i/",
      grammar: "expressão de reparo; pode vir antes de uma explicação ou de um pedido de repetição",
      pattern: "Sorry, I + não entendo: Sorry, I do not understand.",
      example: "Sorry, can you say that again? — Desculpe, você pode dizer isso de novo?",
      paretoPrompt: "Use sorry para abrir um pedido de ajuda e depois repita a frase sem consultar.",
    },
    {
      term: "again",
      meaning: "de novo; novamente",
      pronunciation: "/əˈɡen/",
      grammar: "advérbio de repetição; normalmente acompanha a ação que precisa ser refeita ou ouvida mais uma vez",
      pattern: "Say/try/repeat + again: Please say it again.",
      example: "Could you repeat the word again? — Você poderia repetir a palavra de novo?",
      paretoPrompt: "Forme um pedido educado com again e escolha uma palavra que gostaria de ouvir outra vez.",
    },
    {
      term: "slowly",
      meaning: "devagar",
      pronunciation: "/ˈsloʊ.li/",
      grammar: "advérbio que descreve como uma ação acontece; costuma acompanhar verbos como speak, read e repeat",
      pattern: "verbo + slowly: Please speak slowly.",
      example: "Please read the sentence slowly. — Por favor, leia a frase devagar.",
      paretoPrompt: "Peça que o Professor fale slowly e responda com uma frase curta no seu próprio ritmo.",
    },
    {
      term: "understand",
      meaning: "entender; compreender",
      pronunciation: "/ˌʌn.dɚˈstænd/",
      grammar: "verbo principal; use do not antes dele para dizer que ainda não compreende",
      pattern: "I understand / I do not understand + ideia: I understand the example.",
      example: "I do not understand this word yet. — Eu ainda não entendo esta palavra.",
      paretoPrompt: "Diga se você understand ou do not understand uma frase e transforme a dúvida em uma pergunta ao Professor.",
    },
    {
      term: "learn",
      meaning: "aprender",
      pronunciation: "/lɝːn/",
      grammar: "verbo regular; use learn com I, you, we e they; com he, she e it, use learns",
      pattern: "I learn + idioma/assunto: I learn English every day.",
      example: "I learn new words with this book. — Eu aprendo palavras novas com este livro.",
      paretoPrompt: "Escreva o que você learn hoje e transforme a frase em uma meta simples para a próxima prática.",
    },
    {
      term: "today",
      meaning: "hoje",
      pronunciation: "/təˈdeɪ/",
      grammar: "advérbio de tempo; pode aparecer no começo ou no fim de uma frase sobre o dia atual",
      pattern: "Today, I + ação / I + ação + today: Today, I practice English.",
      example: "Today, I learn one useful phrase. — Hoje, eu aprendo uma frase útil.",
      paretoPrompt: "Diga uma frase verdadeira com today e leve-a ao Pareto para recuperar sem consultar o modelo.",
    },
    {
      term: "name",
      meaning: "nome",
      pronunciation: "/neɪm/",
      grammar: "substantivo contável; em apresentações, costuma aparecer com my, your ou com a pergunta what is",
      pattern: "My name is + nome: My name is Ana.",
      example: "My name is Paulo. — Meu nome é Paulo.",
      paretoPrompt: "Apresente-se com my name is e faça a mesma pergunta ao Professor usando what is your name?",
    },
    {
      term: "from",
      meaning: "de; vindo de",
      pronunciation: "/frʌm/",
      grammar: "preposição usada para indicar origem, ponto de partida ou procedência",
      pattern: "I am from + lugar: I am from Brazil.",
      example: "I am from Brazil, and I learn English. — Eu sou do Brasil e aprendo inglês.",
      paretoPrompt: "Diga de onde você é usando from e acrescente uma informação sobre o que está aprendendo.",
    },
  ],
  chapters: A1_CHAPTERS,
  phrases: [
    { english: "Hello. How are you?", portuguese: "Olá. Como você está?", focus: "Saudação e pergunta" },
    { english: "I am learning English.", portuguese: "Eu estou aprendendo inglês.", focus: "Identidade e objetivo" },
    { english: "Please speak slowly.", portuguese: "Por favor, fale devagar.", focus: "Pedido de apoio" },
    { english: "I need help with this word.", portuguese: "Eu preciso de ajuda com esta palavra.", focus: "Dúvida de vocabulário" },
    { english: "Where is the airport?", portuguese: "Onde fica o aeroporto?", focus: "Localização" },
    { english: "I would like water, please.", portuguese: "Eu gostaria de água, por favor.", focus: "Necessidade e cortesia" },
  ],
  sections: [
    {
      title: "Comece pela ideia completa",
      text: "Aprenda cada palavra dentro de uma frase curta. Leia a frase em voz baixa, identifique a ideia e só então compare as duas línguas.",
      example: "I need water. — Eu preciso de água.",
    },
    {
      title: "Forme padrões úteis",
      text: "Use uma estrutura que possa ser reaproveitada. Troque apenas uma parte por vez e mantenha o sentido claro.",
      example: "I need help. / I need time. / I need a ticket.",
    },
    {
      title: "Fixe pelo Pareto",
      text: "Priorize palavras frequentes, recupere sem olhar, escreva uma frase e volte ao termo em novos intervalos. O objetivo é lembrar e usar, não apenas reconhecer.",
      example: "need · help · time · ticket · water",
    },
    {
      title: "Use e corrija",
      text: "Depois de compreender e memorizar, responda ao professor, descreva a cena e escreva uma frase própria. A correção mostra exatamente o próximo ponto a praticar.",
      example: "I need help at the airport. — Eu preciso de ajuda no aeroporto.",
    },
    {
      title: "Escute, repita e responda",
      text: "Primeiro escute uma frase inteira. Depois repita em partes curtas, juntando as palavras sem pressa. Por fim, responda com uma frase parecida, mas com uma informação sua. Falar não é copiar um som isolado: é recuperar uma ideia e torná-la útil na conversa.",
      example: "Can you speak slowly, please? — Depois responda: Yes, I can speak slowly.",
    },
    {
      title: "Escreva, corrija e reveja",
      text: "Escreva uma frase curta sem consultar o modelo. Compare com o exemplo, corrija somente o ponto necessário e volte a ela nos intervalos de revisão. Um erro identificado vira uma nova oportunidade de recuperação ativa, não uma interrupção do estudo.",
      example: "I study English in the morning. — Revise amanhã e acrescente uma nova informação.",
    },
    {
      title: "Som e escrita caminham juntos",
      text: "Aprenda a forma falada e a forma escrita no mesmo momento. Observe a pronúncia IPA, ouça um modelo, registre a palavra e use-a em uma frase. Quando uma letra ou som causar dúvida, soletrar, comparar e reescrever transforma a dúvida em uma pista concreta para a próxima revisão.",
      example: "How do you spell that? — Como se soletra isso? / It is spelled B-O-O-K.",
    },
    {
      title: "Monte a frase em blocos",
      text: "Em inglês, comece por quem faz ou vive a ideia. Depois coloque o verbo e complete o sentido. Acrescente uma informação por vez: primeiro a ação, depois o objeto, o lugar ou o tempo.",
      example: "I study English. / I study English at home. / I study English at home in the morning.",
      paretoPrompt: "Recupere subject, verb, object, home e morning. Monte três frases, acrescentando somente um bloco por vez.",
    },
    {
      title: "Diga quando e onde",
      text: "Uma frase fica mais útil quando indica tempo ou lugar. No nível inicial, mantenha a ordem simples: a ideia principal vem primeiro; a informação de lugar e de tempo completa a mensagem sem escondê-la.",
      example: "My friend works at the airport today. — Meu amigo trabalha no aeroporto hoje.",
      paretoPrompt: "Lembre friend, work, airport e today. Reordene as palavras antes de comparar com o modelo.",
    },
    {
      title: "Faça perguntas com do e does",
      text: "Para muitas perguntas no presente, use do ou does antes do sujeito. Depois vem a ação. Não copie a ordem da afirmação: a pergunta abre espaço para a resposta do outro.",
      example: "Do you study English? / Does she work here?",
      paretoPrompt: "Recupere do, does, study, work e here. Transforme uma afirmação do capítulo em pergunta.",
    },
    {
      title: "Negue com do not e does not",
      text: "Para dizer que algo não acontece no presente, use do not ou does not antes do verbo principal. Na fala, as formas curtas don’t e doesn’t aparecem com frequência; aprenda as duas formas.",
      example: "I do not work today. / She doesn’t study in the morning.",
      paretoPrompt: "Recupere do not, does not, work, study e today. Escreva uma frase negativa sem consultar o exemplo.",
    },
    {
      title: "Escolha a, an e the",
      text: "Use a ou an para apresentar uma coisa não específica; use the quando a pessoa já sabe de qual coisa você fala. Pense no som inicial para escolher a ou an, e não somente na letra escrita.",
      example: "I need a book. / I have an apple. / The book is on the table.",
      paretoPrompt: "Recupere a, an, the, book e table. Explique para si mesmo por que cada artigo aparece na frase.",
    },
    {
      title: "Descreva antes do nome",
      text: "Em inglês, o adjetivo normalmente vem antes do nome. Aprenda a combinação inteira, pois ela ajuda o aluno a evitar traduzir palavra por palavra na ordem do português.",
      example: "a small house / a good friend / an important question",
      paretoPrompt: "Recupere small, good, important, house, friend e question. Combine cada adjetivo com um nome.",
    },
    {
      title: "Ligue duas ideias",
      text: "Quando uma frase simples estiver segura, conecte duas ideias com and, but ou because. Cada conector cria uma relação diferente: soma, contraste ou motivo. Use apenas um conector por frase no início.",
      example: "I study English because I like languages. / I am tired, but I can study.",
      paretoPrompt: "Recupere and, but, because, study e like. Escolha um conector e complete uma ideia pessoal.",
    },
    {
      title: "Escreva um pequeno retrato",
      text: "Escrever não é juntar palavras ao acaso. Planeje três informações: quem é a pessoa ou o lugar, o que ela faz e uma informação de tempo, lugar ou preferência. Depois revise o sujeito e o verbo de cada frase.",
      example: "My name is Ana. I study English at home. I like my new book.",
      paretoPrompt: "Recupere name, study, home, like e book. Escreva três frases suas e releia na ordem.",
    },
    {
      title: "Transforme o modelo em ideia sua",
      text: "Use um modelo somente como começo. Troque um elemento verdadeiro da sua vida, leia a frase, escreva sem olhar e compare. A personalização torna a frase mais fácil de recuperar depois.",
      example: "Modelo: I need water. / Minha ideia: I need help with this lesson.",
      paretoPrompt: "Recupere need, water, help e lesson. Troque apenas um elemento e crie uma frase que seja verdadeira para você.",
    },
    {
      title: "Releia, recupere e avance",
      text: "No fim de cada grupo de páginas, feche o modelo por alguns segundos. Diga ou escreva o que lembra, confira o ponto que faltou e leve somente esse ponto para o Pareto. Avançar bem é recuperar, não correr.",
      example: "Hoje: I study English in the morning. Amanhã: escreva a frase sem consultar e acrescente where ou why.",
      paretoPrompt: "No Pareto do Livro, recupere a frase, mude hoje para amanhã e acrescente um lugar ou um motivo.",
    },
  ],
};

export function getABCBookDelivery(input: { nativeLanguage: string; targetLanguage: string }): ABCBookDelivery | ABCBookUnavailableDelivery {
  const isPortugueseEnglish = input.nativeLanguage.toLowerCase().startsWith("pt") && input.targetLanguage.toLowerCase().startsWith("en");
  if (isPortugueseEnglish) {
    return PORTUGUESE_ENGLISH_BOOK;
  }

  return {
    available: false,
    edition: `${input.nativeLanguage} → ${input.targetLanguage}`,
    nativeLabel: input.nativeLanguage,
    targetLabel: input.targetLanguage,
    unavailableMessage: "A edição completa para esta dupla está sendo preparada com conteúdo próprio. Enquanto isso, continue pela Base de Estudos, pelo Pareto e pelas cenas com o seu par de idiomas ativo.",
  };
}
