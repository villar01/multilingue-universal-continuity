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

export type ABCBookDelivery = {
  available: true;
  edition: string;
  nativeLabel: string;
  targetLabel: string;
  introduction: string;
  survivalIntro: string;
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
    grammar: string;
    pattern: string;
    example: string;
    paretoPrompt: string;
  }>;
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
      grammar: "substantivo contável ou verbo; com need, atua como substantivo",
      pattern: "I need help with + assunto: I need help with this word.",
      example: "Can you help me, please? — Você pode me ajudar, por favor?",
      paretoPrompt: "Escreva uma pergunta educada pedindo help para uma situação real.",
    },
    {
      term: "water",
      meaning: "água",
      grammar: "substantivo não contável; use some ou a glass of para indicar quantidade",
      pattern: "I would like + água/bebida: I would like water, please.",
      example: "Could I have some water, please? — Eu poderia tomar um pouco de água, por favor?",
      paretoPrompt: "Crie um pedido educado com water e pratique-o sem consultar o modelo.",
    },
    {
      term: "where",
      meaning: "onde",
      grammar: "advérbio interrogativo usado para perguntar por lugar ou localização",
      pattern: "Where is + lugar/coisa?: Where is the hotel?",
      example: "Where is the airport? — Onde fica o aeroporto?",
      paretoPrompt: "Escreva uma pergunta de localização com where e responda usando in, on ou near.",
    },
    {
      term: "airport",
      meaning: "aeroporto",
      grammar: "substantivo contável; use the quando falar de um aeroporto específico conhecido no contexto",
      pattern: "at/to the airport: I am at the airport. / I need to go to the airport.",
      example: "I need help at the airport. — Eu preciso de ajuda no aeroporto.",
      paretoPrompt: "Crie uma frase de necessidade ou localização usando airport e pratique-a em voz alta.",
    },
    {
      term: "friend",
      meaning: "amigo; amiga",
      grammar: "substantivo contável; use my, your, his ou her para indicar de quem é a amizade",
      pattern: "My friend + verbo: My friend studies English.",
      example: "My friend practices with me. — Minha amiga pratica comigo.",
      paretoPrompt: "Escreva uma frase sobre um friend e acrescente uma ação que essa pessoa faz na rotina.",
    },
    {
      term: "morning",
      meaning: "manhã",
      grammar: "substantivo de período do dia; use in the morning para situar uma rotina",
      pattern: "ação + in the morning: I study English in the morning.",
      example: "I practice new words in the morning. — Eu pratico palavras novas de manhã.",
      paretoPrompt: "Crie uma frase verdadeira com morning e leve-a para a recuperação Pareto sem consultar o modelo.",
    },
    {
      term: "study",
      meaning: "estudar",
      grammar: "verbo regular; com I, you, we e they, use study; com he, she e it, use studies",
      pattern: "I study + idioma/assunto: I study English every day.",
      example: "We study new words together. — Nós estudamos palavras novas juntos.",
      paretoPrompt: "Escreva quando e o que você study; depois transforme a frase em uma pergunta ao Professor.",
    },
    {
      term: "tomorrow",
      meaning: "amanhã",
      grammar: "advérbio de tempo; pode aparecer no fim ou no início de uma frase sobre um plano próximo",
      pattern: "I will + ação + tomorrow: I will practice tomorrow.",
      example: "I will review this word tomorrow. — Vou revisar esta palavra amanhã.",
      paretoPrompt: "Planeje uma revisão curta com tomorrow e repita a frase sem olhar antes de seguir no Pareto.",
    },
    {
      term: "book",
      meaning: "livro",
      grammar: "substantivo contável; use a/an para um livro e the para um livro específico no contexto",
      pattern: "This is + a book: This is a useful book.",
      example: "I have a book for my English class. — Eu tenho um livro para minha aula de inglês.",
      paretoPrompt: "Descreva um book que você usa para aprender e transforme a ideia em uma frase própria.",
    },
    {
      term: "work",
      meaning: "trabalhar; trabalho",
      grammar: "pode ser verbo ou substantivo não contável; como verbo, use work com I, you, we e they",
      pattern: "I work + lugar/horário: I work in the morning.",
      example: "I work and study English every day. — Eu trabalho e estudo inglês todos os dias.",
      paretoPrompt: "Crie uma frase sobre work e acrescente quando você estuda ou pratica depois da rotina.",
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
