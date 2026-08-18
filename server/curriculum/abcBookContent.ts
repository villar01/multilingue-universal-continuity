import { STRUCTURED_A1_UNITS } from "./studyBaseContent";

export type ABCBookSection = {
  title: string;
  text: string;
  example: string;
};

export type ABCBookChapter = {
  title: string;
  objective: string;
  reading: string;
  translation: string;
  grammarTitle: string;
  grammarExplanation: string;
  writingPrompt: string;
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

const A1_CHAPTERS: ABCBookChapter[] = STRUCTURED_A1_UNITS.map((unit) => ({
  title: unit.unit,
  objective: unit.objective,
  reading: unit.reading,
  translation: unit.readingTranslation,
  grammarTitle: unit.grammarTitle,
  grammarExplanation: unit.grammarExplanation,
  writingPrompt: unit.writingPrompt,
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
