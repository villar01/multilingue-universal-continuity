export type ABCBookSection = {
  title: string;
  text: string;
  example: string;
};

export type ABCBookPhrase = {
  english: string;
  portuguese: string;
  focus: string;
};

export type ABCBookDelivery = {
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
  phrases: ABCBookPhrase[];
};

const PORTUGUESE_ENGLISH_BOOK: ABCBookDelivery = {
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
  ],
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

export function getABCBookDelivery(_input: { nativeLanguage: string; targetLanguage: string }): ABCBookDelivery {
  // A primeira edição comercial é PT-BR → inglês. A entrega continua no servidor
  // para que futuras edições por dupla reutilizem o mesmo contrato protegido.
  return PORTUGUESE_ENGLISH_BOOK;
}
