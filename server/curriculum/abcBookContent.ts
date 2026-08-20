import { STRUCTURED_A1_UNITS } from "./studyBaseContent";

import { FIFTH_BLOCK_PROGRESSIVE_LESSONS } from "./abcBookFifthBlock";
import { SIXTH_BLOCK_PROGRESSIVE_LESSONS } from "./abcBookSixthBlock";
import { SEVENTH_BLOCK_LITERACY_LABS } from "./abcBookSeventhBlock";
import { EIGHTH_BLOCK_QUANTIFIERS_AND_AUXILIARIES } from "./abcBookEighthBlock";
import { NINTH_BLOCK_AUXILIARIES_AND_TENSES } from "./abcBookNinthBlock";
import { TENTH_BLOCK_NEGATIONS_AND_SELF } from "./abcBookTenthBlock";
import { ELEVENTH_BLOCK_ADVERBS_AND_TRAVEL } from "./abcBookEleventhBlock";
import { TWELFTH_BLOCK_PREPOSITIONS_PHRASALS_CONJUNCTIONS } from "./abcBookTwelfthBlock";
import { THIRTEENTH_BLOCK_ADJECTIVES_AND_COLORS } from "./abcBookThirteenthBlock";
import { FOURTEENTH_BLOCK_COMPARATIVES_SUPERLATIVES } from "./abcBookFourteenthBlock";
import { FIFTEENTH_BLOCK_GREETINGS_CALENDAR } from "./abcBookFifteenthBlock";
import { SIXTEENTH_BLOCK_PHRASALS_IDIOMS } from "./abcBookSixteenthBlock";
import { SEVENTEENTH_BLOCK_BODY_FIELD_PLANET } from "./abcBookSeventeenthBlock";
import { getLanguageBlocks } from "./languageBlocksContent";

export type ABCBookSection = {
  title: string;
  text: string;
  example: string;
  paretoPrompt?: string;
};

export type ABCBookManualLeaf = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  model: string;
  practice: string;
};

export type ABCBookChapter = {
  title: string;
  objective: string;
  reading: string;
  translation: string;
  guidedDialogue: Array<{
    speaker: string;
    target: string;
    native: string;
  }>;
  comprehensionQuestions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  grammarTitle: string;
  grammarExplanation: string;
  writingPrompt: string;
  orderingExercise: ABCBookOrderingExercise;
  paretoContext: "foundation" | "family" | "social-circle" | "routine-time" | "home" | "transport";
  paretoChapter: number;
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
  nativeBridge?: string;
  paretoPrompt?: string;
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

const SECOND_BLOCK_PROGRESSIVE_LESSONS: ABCBookProgressiveLesson[] = [
  {
    section: "Vocabulário básico",
    title: "Objetos do armário: roupa e itens pessoais",
    explanation: "Comece por objetos que podem ser vistos e apontados. Agrupe roupa, acessórios e itens pessoais por função; a voz nativa é a referência para ouvir cada palavra antes de formar uma frase.",
    languageFocus: "coat, wallet, blouse, boots, belt, shirt, skirt, jeans, hat, umbrella e shoes nomeiam itens do armário e do dia a dia.",
    examples: [
      { target: "My coat is here.", native: "Meu casaco está aqui.", note: "roupa e localização" },
      { target: "These boots are new.", native: "Estas botas são novas.", note: "item plural" },
      { target: "Her wallet is in the bag.", native: "A carteira dela está na bolsa.", note: "item pessoal e posse" },
    ],
    writingPrompt: "Escolha três itens de roupa ou objetos pessoais reais ou imaginados. Escreva uma frase curta para cada um e ouça as palavras antes de repetir.",
    scrambled: ["These", "boots", "are", "new"],
    answer: "These boots are new.",
    paretoPrompt: "No Pareto, recupere coat, boots, wallet, bag e shoes; separe roupa, acessório e objeto pessoal antes de criar duas frases.",
  },
  {
    section: "Vocabulário básico",
    title: "De quem são estas coisas?",
    explanation: "Aplique a pergunta de posse a objetos concretos. Whose pergunta pelo dono; a resposta pode usar nome + ’s, possessivo antes do nome ou pronome possessivo quando o objeto já está claro.",
    languageFocus: "Whose hat is this? It is Alice’s hat. It is her hat. / Whose shoes are these? They are mine.",
    examples: [
      { target: "Whose hat is this? It is Alice’s hat.", native: "De quem é este chapéu? É o chapéu da Alice.", note: "dono com nome + ’s" },
      { target: "Whose bag is that? It is hers.", native: "De quem é aquela bolsa? É dela.", note: "resposta sem repetir bag" },
      { target: "Whose shoes are these? They are mine.", native: "De quem são estes sapatos? São meus.", note: "plural e pronome possessivo" },
    ],
    writingPrompt: "Crie duas perguntas com whose usando itens fictícios. Responda uma com nome + ’s e outra com mine, yours, his, hers ou theirs.",
    scrambled: ["Whose", "hat", "is", "this"],
    answer: "Whose hat is this?",
    paretoPrompt: "No Pareto, recupere whose, hat, bag, shoes e hers; faça uma pergunta e responda sem repetir o objeto quando ele já estiver claro.",
  },
  {
    section: "Vocabulário básico",
    title: "Pessoas, relações e pronomes",
    explanation: "O original amplia o vocabulário com pessoas da família, amigos e pronomes. Organize primeiro a relação; depois escolha o pronome que evita repetir o nome. Relações podem ser reais ou fictícias, sem exigir dados pessoais.",
    languageFocus: "aunt, uncle, cousin, friend, daughter, son, mother, father, sister, brother, he, she, we, they e you formam uma base de apresentação.",
    examples: [
      { target: "My cousin is a doctor. She helps people.", native: "Minha prima é médica. Ela ajuda pessoas.", note: "relação, profissão e pronome" },
      { target: "Their son is my friend.", native: "O filho deles é meu amigo.", note: "relação e posse" },
      { target: "We study with our aunt.", native: "Nós estudamos com nossa tia.", note: "grupo e relação" },
    ],
    writingPrompt: "Escreva três relações de uma família ou grupo fictício. Em uma frase, troque o nome pelo pronome adequado.",
    scrambled: ["is", "Their", "son", "my", "friend"],
    answer: "Their son is my friend.",
    paretoPrompt: "No Pareto, recupere aunt, cousin, friend, she e they; apresente duas pessoas sem repetir o mesmo nome em todas as frases.",
  },
  {
    section: "Vocabulário básico",
    title: "Profissões e funções na comunidade",
    explanation: "Profissões ganham sentido quando aparecem em uma ação ou lugar. Use termos atuais e inclusivos: firefighter e police officer descrevem a função sem depender de uma forma marcada por gênero.",
    languageFocus: "doctor, teacher, nurse, driver, cook, lawyer, firefighter, police officer, actor e actress podem aparecer com be, work e help.",
    examples: [
      { target: "The doctor works at the hospital.", native: "A médica ou o médico trabalha no hospital.", note: "profissão e lugar" },
      { target: "A firefighter helps people.", native: "Uma pessoa bombeira ajuda pessoas.", note: "função atualizada" },
      { target: "My neighbor is a police officer.", native: "Meu vizinho ou minha vizinha é policial.", note: "função sem marca de gênero" },
    ],
    writingPrompt: "Escolha três profissões e associe cada uma a uma ação ou lugar. Use situações reais ou fictícias, sem dados pessoais.",
    scrambled: ["works", "The", "doctor", "at", "the", "hospital"],
    answer: "The doctor works at the hospital.",
    paretoPrompt: "No Pareto, recupere doctor, teacher, nurse, firefighter e police officer; diga uma função e uma ação para cada profissão.",
  },
  {
    section: "Vocabulário básico",
    title: "Reconhecer profissões em contexto",
    explanation: "A busca visual do original vira reconhecimento com sentido. Localize a profissão, depois confirme a pessoa e a ação; não trate uma lista como memorização isolada.",
    languageFocus: "Compare cook, driver, butcher, waitress, teacher, doctor e police officer pelo trabalho que cada pessoa realiza.",
    examples: [
      { target: "The cook prepares food.", native: "A cozinheira ou o cozinheiro prepara comida.", note: "ação da profissão" },
      { target: "The driver drives a car.", native: "A motorista ou o motorista dirige um carro.", note: "profissão e objeto" },
      { target: "The teacher helps students learn.", native: "A professora ou o professor ajuda estudantes a aprender.", note: "função e pessoas" },
    ],
    writingPrompt: "Encontre três profissões nas lições anteriores. Para cada uma, escreva uma ação verdadeira ou fictícia que explique o trabalho.",
    scrambled: ["The", "driver", "drives", "a", "car"],
    answer: "The driver drives a car.",
    paretoPrompt: "No Pareto, recupere cook, driver, teacher, doctor e help; associe cada palavra a uma ação antes de escrever a frase.",
  },
  {
    section: "Vocabulário básico",
    title: "Pessoa + profissão: formar frases",
    explanation: "A tabela do original usa pessoa + is + profissão. Mantenha esse molde, mas faça a escolha de artigo conscientemente: a antes de som consonantal e an antes de som vocálico.",
    languageFocus: "Use nome ou relação + is + a/an + profissão: My aunt is a nurse. Ana is an artist.",
    examples: [
      { target: "My aunt is a nurse.", native: "Minha tia é enfermeira.", note: "relação + profissão" },
      { target: "Ana is an artist.", native: "Ana é artista.", note: "an antes do som vocálico de artist" },
      { target: "Their father is a teacher.", native: "O pai deles é professor.", note: "possessivo + profissão" },
    ],
    writingPrompt: "Forme três frases com uma pessoa e uma profissão. Em uma delas, use an corretamente antes de uma profissão iniciada por som vocálico.",
    scrambled: ["is", "Ana", "an", "artist"],
    answer: "Ana is an artist.",
    paretoPrompt: "No Pareto, recupere is, a, an, nurse, artist e teacher; complete uma frase sem olhar e explique por que usou a ou an.",
  },
  {
    section: "Vocabulário básico",
    title: "A casa: cômodos e objetos do dia a dia",
    explanation: "O original muda das pessoas para os lugares em que elas vivem. Agrupe primeiro os cômodos e depois objetos que realmente pertencem a cada espaço; ouvir a palavra nativa vem antes de tentar aproximar o som pela escrita.",
    languageFocus: "house, living room, kitchen, dining room, bedroom, bathroom, garden, door, window, lamp e table descrevem espaços concretos.",
    examples: [
      { target: "The kitchen has a table.", native: "A cozinha tem uma mesa.", note: "cômodo e objeto" },
      { target: "The lamp is in the living room.", native: "A luminária está na sala.", note: "localização" },
      { target: "Our house has a garden.", native: "Nossa casa tem um jardim.", note: "casa e espaço externo" },
    ],
    writingPrompt: "Escolha três cômodos ou objetos de uma casa real ou fictícia. Escreva onde está cada objeto usando in ou has.",
    scrambled: ["The", "kitchen", "has", "a", "table"],
    answer: "The kitchen has a table.",
    paretoPrompt: "No Pareto, recupere house, kitchen, room, table, lamp e garden; classifique cada palavra como lugar ou objeto e forme duas frases.",
  },
  {
    section: "Vocabulário básico",
    title: "Quarto e banheiro: itens pessoais",
    explanation: "Detalhe a casa com objetos de uso pessoal. Use grupos curtos para não acumular palavras sem contexto: cama e travesseiro no quarto; sabonete e escova no banheiro.",
    languageFocus: "bed, pillow, closet, blanket, mirror, shower, soap, toothbrush, towel e shampoo formam um núcleo prático de quarto e banheiro.",
    examples: [
      { target: "The pillow is on the bed.", native: "O travesseiro está na cama.", note: "objeto e lugar" },
      { target: "My toothbrush is in the bathroom.", native: "Minha escova de dentes está no banheiro.", note: "objeto pessoal" },
      { target: "The towel is clean.", native: "A toalha está limpa.", note: "descrição simples" },
    ],
    writingPrompt: "Escreva três frases sobre um quarto ou banheiro fictício. Use pelo menos um objeto pessoal e um lugar.",
    scrambled: ["My", "toothbrush", "is", "in", "the", "bathroom"],
    answer: "My toothbrush is in the bathroom.",
    paretoPrompt: "No Pareto, recupere bed, pillow, bathroom, towel e toothbrush; diga onde cada item fica sem consultar a lista.",
  },
  {
    section: "Vocabulário básico",
    title: "A cozinha: lugares e utensílios",
    explanation: "A cozinha dá continuidade à casa com objetos de uso real. Agrupe os itens por função: preparar, guardar, servir e limpar. Ouça o áudio nativo antes de comparar escrita e sentido.",
    languageFocus: "kitchen, stove, refrigerator, sink, cupboard, plate, cup, glass, spoon, fork e knife organizam ações e objetos da cozinha.",
    examples: [
      { target: "The cups are in the cupboard.", native: "As xícaras estão no armário da cozinha.", note: "objeto plural e lugar" },
      { target: "The plate is on the table.", native: "O prato está sobre a mesa.", note: "objeto e posição" },
      { target: "The sink is in the kitchen.", native: "A pia está na cozinha.", note: "objeto e cômodo" },
    ],
    writingPrompt: "Escolha três utensílios ou lugares da cozinha e diga onde ficam em uma cozinha real ou imaginada.",
    scrambled: ["The", "plate", "is", "on", "the", "table"],
    answer: "The plate is on the table.",
    paretoPrompt: "No Pareto, recupere kitchen, plate, cup, table e sink; agrupe por lugar, utensílio e ação antes de dizer duas frases.",
  },
  {
    section: "Vocabulário básico",
    title: "Alimentos e bebidas do dia a dia",
    explanation: "Alimentos ganham sentido quando aparecem em uma refeição ou pedido simples. Agrupe comida e bebida e pratique quantidades básicas sem tentar memorizar uma lista inteira de uma vez.",
    languageFocus: "bread, rice, fruit, egg, cheese, soup, water, milk, coffee, tea e juice formam um núcleo frequente de alimentos e bebidas.",
    examples: [
      { target: "I drink water in the morning.", native: "Eu bebo água de manhã.", note: "bebida e momento" },
      { target: "We have bread and cheese.", native: "Nós temos pão e queijo.", note: "alimentos em conjunto" },
      { target: "She likes tea.", native: "Ela gosta de chá.", note: "preferência simples" },
    ],
    writingPrompt: "Escolha duas comidas e duas bebidas. Escreva uma frase com have ou like e uma frase com drink ou eat.",
    scrambled: ["I", "drink", "water", "in", "the", "morning"],
    answer: "I drink water in the morning.",
    paretoPrompt: "No Pareto, recupere water, bread, tea, rice e fruit; separe comida e bebida e complete uma frase para cada grupo.",
  },
  {
    section: "Vocabulário básico",
    title: "Preparar e servir uma refeição",
    explanation: "Transforme palavras de cozinha em ação. O padrão pessoa + verbo + alimento ou objeto ajuda a formar frases úteis sem mudar a ordem básica do inglês.",
    languageFocus: "Use make, cook, eat, drink, wash e serve com pessoas, alimentos e utensílios: We cook rice. I wash the dishes.",
    examples: [
      { target: "We cook rice for lunch.", native: "Nós cozinhamos arroz para o almoço.", note: "ação e refeição" },
      { target: "I wash the dishes.", native: "Eu lavo a louça.", note: "ação doméstica" },
      { target: "They serve juice in glasses.", native: "Eles servem suco em copos.", note: "ação, bebida e recipiente" },
    ],
    writingPrompt: "Escreva três ações de cozinha com uma pessoa e um objeto ou alimento. Use uma ação diferente em cada frase.",
    scrambled: ["We", "cook", "rice", "for", "lunch"],
    answer: "We cook rice for lunch.",
    paretoPrompt: "No Pareto, recupere cook, eat, drink, wash e serve; ligue cada verbo a um alimento, bebida ou utensílio antes de montar a frase.",
  },
  {
    section: "Vocabulário básico",
    title: "Na mesa: pedir, oferecer e responder",
    explanation: "A prática contextual do original pode virar uma troca curta na mesa. Comece com pedido ou oferta, responda de forma educada e acrescente uma informação simples quando necessário.",
    languageFocus: "Use Can I have…?, Would you like…?, Here you are e Thank you em uma interação de refeição curta.",
    examples: [
      { target: "Would you like some tea?", native: "Você gostaria de um pouco de chá?", note: "oferta educada" },
      { target: "Yes, please. Thank you.", native: "Sim, por favor. Obrigado ou obrigada.", note: "aceite educado" },
      { target: "Can I have some water, please?", native: "Posso tomar um pouco de água, por favor?", note: "pedido simples" },
    ],
    writingPrompt: "Escreva um mini diálogo de quatro linhas: ofereça uma bebida, responda, faça um pedido e agradeça.",
    scrambled: ["Would", "you", "like", "some", "tea"],
    answer: "Would you like some tea?",
    paretoPrompt: "No Pareto, recupere water, tea, please, thank you e would like; faça uma oferta e um pedido sem consultar a lista.",
  },
  {
    section: "Gramática em uso",
    title: "Plural regular: -s e -es",
    explanation: "Comece pelo padrão mais frequente: acrescente -s. Depois observe os finais que pedem -es: -s, -ss, -sh, -ch, -x e, em muitos casos, -o. Use as palavras em frases; não memorize apenas a regra isolada.",
    languageFocus: "book → books, cup → cups, bus → buses, church → churches, box → boxes. A pronúncia vem do áudio nativo; a escrita mostra a regra.",
    examples: [
      { target: "One book, two books.", native: "Um livro, dois livros.", note: "plural com -s" },
      { target: "The buses are late.", native: "Os ônibus estão atrasados.", note: "plural com -es" },
      { target: "These boxes are heavy.", native: "Estas caixas são pesadas.", note: "demonstrativo e plural" },
    ],
    writingPrompt: "Transforme três substantivos da casa ou da cozinha para o plural e use cada um em uma frase curta.",
    scrambled: ["These", "boxes", "are", "heavy"],
    answer: "These boxes are heavy.",
    paretoPrompt: "No Pareto, recupere book/books, cup/cups, bus/buses, church/churches e box/boxes; classifique -s e -es antes de formar duas frases.",
  },
  {
    section: "Gramática em uso",
    title: "Plural com mudança e plural irregular",
    explanation: "Algumas palavras mudam a escrita: consonante + y geralmente vira -ies; certos finais em -f ou -fe podem virar -ves. Outras são irregulares e precisam ser aprendidas como pares de sentido.",
    languageFocus: "baby → babies, city → cities, knife → knives, leaf → leaves; child → children, person → people, tooth → teeth e foot → feet são pares irregulares frequentes.",
    examples: [
      { target: "The baby has two teeth.", native: "O bebê tem dois dentes.", note: "plural irregular em contexto" },
      { target: "The children play in the park.", native: "As crianças brincam no parque.", note: "child → children" },
      { target: "Three knives are on the table.", native: "Três facas estão sobre a mesa.", note: "knife → knives" },
    ],
    writingPrompt: "Escreva uma frase com children ou people e outra com babies, cities, knives ou leaves.",
    scrambled: ["The", "children", "play", "in", "the", "park"],
    answer: "The children play in the park.",
    paretoPrompt: "No Pareto, recupere child/children, person/people, tooth/teeth, baby/babies e knife/knives; explique se o plural segue padrão ou é irregular.",
  },
  {
    section: "Gramática em uso",
    title: "Preposições: at, in, on e to",
    explanation: "Preposições ligam pessoas, coisas, lugares e tempo. Em vez de uma tradução única, aprenda a relação: at marca ponto específico, in indica interior ou período, on toca uma superfície ou dia, e to marca direção ou destino.",
    languageFocus: "at the bus stop, in the kitchen, on the table e to the office são padrões de uso; o contexto decide a melhor tradução.",
    examples: [
      { target: "The keys are on the table.", native: "As chaves estão sobre a mesa.", note: "contato com superfície" },
      { target: "She is in the kitchen.", native: "Ela está na cozinha.", note: "dentro de um lugar" },
      { target: "We go to the office at eight.", native: "Nós vamos ao escritório às oito.", note: "direção e horário" },
    ],
    writingPrompt: "Escreva uma frase com in, uma com on e uma com to usando lugares e objetos que você já estudou.",
    scrambled: ["The", "keys", "are", "on", "the", "table"],
    answer: "The keys are on the table.",
    paretoPrompt: "No Pareto, recupere at, in, on e to; associe cada uma a ponto, interior, superfície ou destino antes de completar frases.",
  },
  {
    section: "Gramática em uso",
    title: "Preposições de posição e origem",
    explanation: "Amplie a descrição de lugares com under, behind, over, between, near e from. A pergunta principal é: onde algo está, de onde vem ou em relação a que objeto aparece?",
    languageFocus: "under the chair, behind the door, over the table, between two chairs, near the window e from Brazil mostram posição, proximidade ou origem.",
    examples: [
      { target: "The bag is under the chair.", native: "A bolsa está debaixo da cadeira.", note: "posição inferior" },
      { target: "The lamp is near the window.", native: "A luminária está perto da janela.", note: "proximidade" },
      { target: "She is from Brazil.", native: "Ela é do Brasil.", note: "origem" },
    ],
    writingPrompt: "Descreva a posição de três objetos no seu quarto, em uma imagem ou em uma cena imaginada.",
    scrambled: ["The", "bag", "is", "under", "the", "chair"],
    answer: "The bag is under the chair.",
    paretoPrompt: "No Pareto, recupere under, behind, near, between, over e from; desenhe mentalmente uma cena e diga onde estão os objetos.",
  },
  {
    section: "Gramática em uso",
    title: "Aplicação: plural e lugar em frases",
    explanation: "Combine as duas ideias do capítulo: nomeie mais de um objeto e diga onde ele está. O exercício de completar frases é mantido, agora com uma explicação clara sobre a pista que cada palavra oferece.",
    languageFocus: "Observe substantivo plural + verbo are + preposição + lugar: The books are on the shelf. The children are at school.",
    examples: [
      { target: "The books are on the shelf.", native: "Os livros estão na estante.", note: "plural e superfície" },
      { target: "The children are at school.", native: "As crianças estão na escola.", note: "plural irregular e ponto específico" },
      { target: "My shoes are under the bed.", native: "Meus sapatos estão debaixo da cama.", note: "plural e posição" },
    ],
    writingPrompt: "Complete duas frases com um plural e uma preposição. Depois crie uma terceira frase descrevendo um lugar real.",
    scrambled: ["My", "shoes", "are", "under", "the", "bed"],
    answer: "My shoes are under the bed.",
    paretoPrompt: "No Pareto, recupere books, children, shoes, on, at e under; complete três frases usando uma pista de plural e uma pista de lugar.",
  },
  {
    section: "Perguntas e respostas",
    title: "Do e does: perguntas no presente",
    explanation: "Do e does ajudam a formar perguntas no presente simples. Use do com I, you, we e they; use does com he, she e it. Depois de does, o verbo principal volta à forma base: Does she work?, não Does she works?.",
    languageFocus: "Do you work here? Does he live in Brazil? O auxiliar vem antes do sujeito; o verbo principal permanece simples.",
    examples: [
      { target: "Do you live near here?", native: "Você mora perto daqui?", note: "do + you + verbo base" },
      { target: "Does she work at the hospital?", native: "Ela trabalha no hospital?", note: "does + she + verbo base" },
      { target: "Do they like coffee?", native: "Eles gostam de café?", note: "do + they + verbo base" },
    ],
    writingPrompt: "Escreva duas perguntas com do e duas com does sobre rotina, lugar ou preferência.",
    scrambled: ["Does", "she", "work", "at", "the", "hospital"],
    answer: "Does she work at the hospital?",
    paretoPrompt: "No Pareto, recupere do, does, live, work e like; escolha o auxiliar pelo sujeito antes de montar três perguntas.",
  },
  {
    section: "Perguntas e respostas",
    title: "Respostas curtas com do e does",
    explanation: "A resposta curta repete o auxiliar, não o verbo principal. Ela confirma ou nega sem repetir toda a pergunta: Yes, I do. No, she does not. Depois, uma frase completa pode acrescentar uma informação útil.",
    languageFocus: "Yes, I do. No, I do not. Yes, she does. No, she does not. As formas contraídas don't e doesn't serão ouvidas no áudio, mas a forma completa também deve ser reconhecida.",
    examples: [
      { target: "Do you speak English? Yes, I do.", native: "Você fala inglês? Sim, falo.", note: "resposta curta afirmativa" },
      { target: "Does he like tea? No, he does not.", native: "Ele gosta de chá? Não, não gosta.", note: "resposta curta negativa" },
      { target: "Do they work here? Yes, they do.", native: "Eles trabalham aqui? Sim, trabalham.", note: "auxiliar retoma a pergunta" },
    ],
    writingPrompt: "Crie três pares de pergunta e resposta curta: um com I, um com she e um com they.",
    scrambled: ["Yes", "I", "do"],
    answer: "Yes, I do.",
    paretoPrompt: "No Pareto, recupere yes, no, do, does e not; responda três perguntas sem repetir o verbo principal.",
  },
  {
    section: "Perguntas e respostas",
    title: "What, where e when em perguntas",
    explanation: "Palavras interrogativas pedem uma informação específica. What pergunta coisa ou atividade; where pergunta lugar; when pergunta tempo. Depois delas, a pergunta continua com do ou does quando o verbo principal não é be.",
    languageFocus: "What do you eat for breakfast? Where does she work? When do they study? A palavra interrogativa vem antes do auxiliar.",
    examples: [
      { target: "What do you eat for breakfast?", native: "O que você come no café da manhã?", note: "informação sobre coisa ou atividade" },
      { target: "Where does she work?", native: "Onde ela trabalha?", note: "informação sobre lugar" },
      { target: "When do they study?", native: "Quando eles estudam?", note: "informação sobre tempo" },
    ],
    writingPrompt: "Escreva uma pergunta com what, uma com where e uma com when. Responda cada uma com uma frase completa.",
    scrambled: ["Where", "does", "she", "work"],
    answer: "Where does she work?",
    paretoPrompt: "No Pareto, recupere what, where, when, do e does; associe cada palavra interrogativa ao tipo de informação pedido.",
  },
  {
    section: "Perguntas e respostas",
    title: "Did: perguntas sobre uma ação passada",
    explanation: "Did marca uma pergunta no passado simples para todos os sujeitos. Depois de did, o verbo principal fica na forma base: Did you visit…?, não Did you visited…?. A resposta curta usa did ou did not.",
    languageFocus: "Did you call your friend? Yes, I did. Did she cook dinner? No, she did not. O passado está no auxiliar did, não no verbo seguinte.",
    examples: [
      { target: "Did you visit your family? Yes, I did.", native: "Você visitou sua família? Sim, visitei.", note: "pergunta e resposta no passado" },
      { target: "Did she cook dinner? No, she did not.", native: "Ela preparou o jantar? Não, não preparou.", note: "did + verbo base" },
      { target: "Did they study yesterday? Yes, they did.", native: "Eles estudaram ontem? Sim, estudaram.", note: "marcador de passado" },
    ],
    writingPrompt: "Escreva duas perguntas com did sobre ontem e responda uma afirmativamente e outra negativamente.",
    scrambled: ["Did", "they", "study", "yesterday"],
    answer: "Did they study yesterday?",
    paretoPrompt: "No Pareto, recupere did, yesterday, visit, cook e study; mantenha o verbo base depois de did em três perguntas.",
  },
  {
    section: "Perguntas e respostas",
    title: "Aplicação: entrevista curta",
    explanation: "A prática final reúne perguntas, respostas curtas e frases desenvolvidas. Primeiro faça a pergunta; depois responda de forma curta; por fim, acrescente um detalhe real. Isso preserva o exercício de perguntas e o transforma em conversa útil.",
    languageFocus: "Do you work…? Where do you live? Did you study yesterday? Use a resposta curta primeiro e uma frase completa para detalhar depois.",
    examples: [
      { target: "Do you work here? Yes, I do. I work here every morning.", native: "Você trabalha aqui? Sim. Eu trabalho aqui todas as manhãs.", note: "resposta curta + detalhe" },
      { target: "Where do you live? I live near the park.", native: "Onde você mora? Eu moro perto do parque.", note: "pergunta de lugar + resposta completa" },
      { target: "Did you study yesterday? No, I did not. I studied today.", native: "Você estudou ontem? Não. Eu estudei hoje.", note: "passado com contraste" },
    ],
    writingPrompt: "Escreva uma entrevista de seis linhas com três perguntas, três respostas curtas e pelo menos um detalhe em frase completa.",
    scrambled: ["Do", "you", "work", "here"],
    answer: "Do you work here?",
    paretoPrompt: "No Pareto, recupere do, does, did, what, where e when; conduza uma mini entrevista sem consultar as frases-modelo.",
  },
  {
    section: "Verbos regulares",
    title: "Verbo-base, passado e particípio",
    explanation: "O original organiza verbos em três formas. Em muitos verbos regulares, o passado simples e o particípio terminam em -ed e têm a mesma escrita: work → worked → worked. A forma-base é usada no presente e depois de do, does e did.",
    languageFocus: "Verbo-base: I work. Passado simples: I worked yesterday. Particípio: I have worked here before. Não leia as três formas como palavras separadas: veja quando cada uma entra na frase.",
    examples: [
      { target: "work → worked → worked", native: "trabalhar → trabalhei/trabalhou → trabalhado", note: "forma regular frequente" },
      { target: "clean → cleaned → cleaned", native: "limpar → limpei/limpou → limpado", note: "-ed acrescentado" },
      { target: "play → played → played", native: "jogar/brincar → joguei/jogou → jogado", note: "-ed acrescentado" },
    ],
    writingPrompt: "Copie três verbos e escreva uma frase no presente e uma no passado para cada um.",
    scrambled: ["I", "worked", "yesterday"],
    answer: "I worked yesterday.",
    paretoPrompt: "No Pareto, recupere work, clean e play; escolha a forma-base ou worked/cleaned/played conforme o tempo indicado.",
  },
  {
    section: "Verbos regulares",
    title: "Como a escrita muda em verbos regulares",
    explanation: "A regra geral é acrescentar -ed, mas algumas grafias mudam para preservar a leitura. Verbos terminados em e recebem apenas -d; verbos terminados em consoante + y trocam y por i antes de -ed; alguns verbos curtos dobram a consoante final.",
    languageFocus: "live → lived; study → studied; stop → stopped. O áudio nativo mostra o ritmo da palavra inteira; a explicação escrita serve para reconhecer o padrão.",
    examples: [
      { target: "live → lived", native: "morar/viver → morei/viveu", note: "e final + d" },
      { target: "study → studied", native: "estudar → estudei/estudou", note: "y troca por i" },
      { target: "stop → stopped", native: "parar → parei/parou", note: "consoante final dobrada" },
    ],
    writingPrompt: "Transforme like, study e stop para o passado. Depois use cada forma em uma frase curta.",
    scrambled: ["She", "studied", "English", "yesterday"],
    answer: "She studied English yesterday.",
    paretoPrompt: "No Pareto, recupere live, study e stop; explique qual mudança de escrita cada verbo pede antes de formar a frase.",
  },
  {
    section: "Verbos regulares",
    title: "Ações úteis em contextos reais",
    explanation: "A tabela do original reúne muitos verbos sem contexto. Nesta folha, os mesmos tipos de ação aparecem em situações úteis: organizar algo, preparar uma atividade, responder alguém ou aprender. Primeiro escolha a ação; depois acrescente quem, o quê, onde ou quando.",
    languageFocus: "Use verbos como answer, call, start, help, listen, open, close e prepare em frases que uma pessoa realmente precisaria dizer.",
    examples: [
      { target: "I answered the teacher's question.", native: "Eu respondi à pergunta da professora/do professor.", note: "ação concluída" },
      { target: "We started the lesson at nine.", native: "Nós começamos a aula às nove.", note: "ação + tempo" },
      { target: "She cleaned the kitchen after dinner.", native: "Ela limpou a cozinha depois do jantar.", note: "ação + lugar + tempo" },
    ],
    writingPrompt: "Escolha três verbos da folha e escreva uma frase real para cada um no passado simples.",
    scrambled: ["We", "started", "the", "lesson", "at", "nine"],
    answer: "We started the lesson at nine.",
    paretoPrompt: "No Pareto, recupere answer, start, clean, lesson e kitchen; produza três frases sem consultar a tradução.",
  },
  {
    section: "Verbos regulares",
    title: "Passado simples e particípio não têm a mesma função",
    explanation: "Nos verbos regulares, passado e particípio geralmente têm a mesma escrita, mas não fazem o mesmo trabalho. O passado simples pode ficar sozinho com uma indicação de tempo. O particípio costuma precisar de have ou has para ligar uma experiência ao presente.",
    languageFocus: "I studied yesterday. / I have studied this topic before. A forma studied é igual; o auxiliar e a intenção da frase mostram a diferença.",
    examples: [
      { target: "I visited my family last week.", native: "Eu visitei minha família na semana passada.", note: "passado simples + tempo concluído" },
      { target: "I have visited this city before.", native: "Eu já visitei esta cidade antes.", note: "have + particípio" },
      { target: "She has worked here since May.", native: "Ela trabalha aqui desde maio.", note: "has + particípio em continuidade" },
    ],
    writingPrompt: "Escreva uma frase com passado simples e outra com have/has + particípio. Circule o auxiliar na segunda frase.",
    scrambled: ["I", "have", "visited", "this", "city", "before"],
    answer: "I have visited this city before.",
    paretoPrompt: "No Pareto, recupere visited, worked, have, has e before; separe duas frases de passado simples e duas com particípio.",
  },
  {
    section: "Verbos regulares",
    title: "Aplicação: relato curto de uma atividade",
    explanation: "A prática final retoma a tabela de verbos como relato. Escolha uma atividade real, conte duas ações concluídas e acrescente uma experiência que ainda importa. Assim, o aluno vê a forma verbal funcionando em uma pequena mensagem, não apenas em colunas.",
    languageFocus: "Yesterday, I cleaned my room and studied English. I have practiced these words before. A primeira parte relata ações terminadas; a última conecta experiência e presente.",
    examples: [
      { target: "Yesterday, I cooked dinner and washed the dishes.", native: "Ontem, eu preparei o jantar e lavei a louça.", note: "duas ações concluídas" },
      { target: "I have practiced this sentence before.", native: "Eu já pratiquei esta frase antes.", note: "experiência ligada ao presente" },
      { target: "She called her friend and talked for ten minutes.", native: "Ela ligou para a amiga e conversou por dez minutos.", note: "sequência de ações" },
    ],
    writingPrompt: "Escreva um relato de três linhas: duas ações de ontem e uma experiência com have/has. Leia-o em voz alta depois de ouvir o áudio.",
    scrambled: ["Yesterday", "I", "cooked", "dinner"],
    answer: "Yesterday, I cooked dinner.",
    paretoPrompt: "No Pareto, recupere cooked, washed, called, talked, practiced e yesterday; reconstrua um relato curto sem olhar as frases-modelo.",
  },
  {
    section: "Verbos regulares",
    title: "Decidir, comparar e organizar",
    explanation: "A continuação da tabela original reúne verbos úteis para escolher, organizar e concluir uma atividade. Em vez de decorar uma coluna, observe o padrão regular e use cada verbo em uma situação concreta.",
    languageFocus: "decide → decided, compare → compared, organize → organized. O passado simples relata uma decisão ou tarefa concluída.",
    examples: [
      { target: "We decided to study together.", native: "Nós decidimos estudar juntos.", note: "decide → decided" },
      { target: "She compared two prices.", native: "Ela comparou dois preços.", note: "compare → compared" },
      { target: "I organized my notes yesterday.", native: "Eu organizei minhas anotações ontem.", note: "organize → organized" },
    ],
    writingPrompt: "Escreva uma frase com decided, compared ou organized. Marque qual decisão ou tarefa aconteceu no passado.",
    scrambled: ["We", "decided", "to", "study", "together"],
    answer: "We decided to study together.",
    paretoPrompt: "No Pareto, recupere decide, compare e organize; escolha uma forma no passado e explique a situação em português antes de dizer a frase em inglês.",
  },
  {
    section: "Verbos regulares",
    title: "Comunicar e responder",
    explanation: "Verbos como answer, explain, inform, invite e share aparecem na continuação do original. Eles ajudam a responder, informar e manter uma conversa útil. A forma regular não muda a necessidade de construir uma frase completa.",
    languageFocus: "answered, explained, informed, invited e shared funcionam como passado simples; o áudio nativo é a referência de pronúncia, não uma escrita aproximada em português.",
    examples: [
      { target: "I explained the exercise to my friend.", native: "Eu expliquei o exercício para minha amiga/meu amigo.", note: "explain → explained" },
      { target: "They invited us to the meeting.", native: "Eles nos convidaram para a reunião.", note: "invite → invited" },
      { target: "She shared the information yesterday.", native: "Ela compartilhou a informação ontem.", note: "share → shared" },
    ],
    writingPrompt: "Escreva uma resposta curta com explained, invited ou shared e acrescente para quem ou para quê a ação aconteceu.",
    scrambled: ["She", "shared", "the", "information", "yesterday"],
    answer: "She shared the information yesterday.",
    paretoPrompt: "No Pareto, recupere explain, invite, share, answer e inform; transforme dois deles em frases de conversa curta.",
  },
  {
    section: "Verbos regulares",
    title: "Produção: um registro de trabalho ou estudo",
    explanation: "Feche esta segunda sequência de verbos criando um registro curto. Combine ações de organização e comunicação para mostrar o que foi feito, por que foi feito e qual resultado ficou disponível.",
    languageFocus: "Yesterday, I organized the notes, explained the task and shared the file. Três verbos regulares formam um relato claro quando aparecem em ordem lógica.",
    examples: [
      { target: "I completed the task and emailed the report.", native: "Eu concluí a tarefa e enviei o relatório por e-mail.", note: "complete/email no passado" },
      { target: "We practiced, reviewed and corrected the answers.", native: "Nós praticamos, revisamos e corrigimos as respostas.", note: "sequência de ações" },
      { target: "He waited, listened and answered carefully.", native: "Ele esperou, escutou e respondeu com cuidado.", note: "ações em sequência" },
    ],
    writingPrompt: "Escreva três ações regulares que você fez em uma atividade. Depois leia o registro em voz alta usando o áudio como referência.",
    scrambled: ["We", "practiced", "and", "reviewed", "the", "answers"],
    answer: "We practiced and reviewed the answers.",
    paretoPrompt: "No Pareto, recupere complete, practice, review, correct, wait e listen; monte um registro de três ações sem olhar o modelo.",
  },
  {
    section: "Conjugação e tempos",
    title: "Presente, passado e auxiliar: a regra correta",
    explanation: "A tabela do original mostra presente e passado, mas precisa de uma correção importante: uma frase afirmativa no passado simples não usa auxiliar. Diga I walked. Use did apenas para pergunta ou negativa: Did you walk? / I did not walk.",
    languageFocus: "I walk / He walks / I walked. O -s é da terceira pessoa no presente; -ed marca passado regular. Did não aparece junto de walked.",
    examples: [
      { target: "She walks to school.", native: "Ela caminha até a escola.", note: "presente: terceira pessoa com -s" },
      { target: "She walked to school yesterday.", native: "Ela caminhou até a escola ontem.", note: "passado afirmativo sem did" },
      { target: "Did she walk to school?", native: "Ela caminhou até a escola?", note: "pergunta com did + verbo-base" },
    ],
    writingPrompt: "Transforme uma frase sua do presente para o passado e depois escreva uma pergunta com did. Não use did junto de um verbo em -ed.",
    scrambled: ["She", "walked", "to", "school", "yesterday"],
    answer: "She walked to school yesterday.",
    paretoPrompt: "No Pareto, recupere walk, wash e believe em presente e passado; explique em português quando usar did e produza uma pergunta correta.",
  },
  {
    section: "Conjugação e tempos",
    title: "Primeiros verbos irregulares por padrão",
    explanation: "Agora entram os irregulares do original. Eles não recebem -ed: cada grupo precisa ser reconhecido e usado em contexto. Aprenda a forma-base, o passado e o particípio com frase e áudio nativo.",
    languageFocus: "drink–drank–drunk, sing–sang–sung, begin–began–begun, eat–ate–eaten e give–gave–given. O particípio aparece com have/has, não sozinho como passado simples.",
    examples: [
      { target: "I drank water after class.", native: "Eu bebi água depois da aula.", note: "passado: drank" },
      { target: "She has eaten breakfast.", native: "Ela tomou café da manhã.", note: "particípio: eaten com has" },
      { target: "They gave me a book.", native: "Eles me deram um livro.", note: "passado: gave" },
    ],
    writingPrompt: "Escreva duas frases: uma com drank, sang, began, ate ou gave; outra com has/have + drunk, sung, begun, eaten ou given.",
    scrambled: ["She", "has", "eaten", "breakfast"],
    answer: "She has eaten breakfast.",
    paretoPrompt: "No Pareto, recupere drink/drank/drunk, sing/sang/sung e begin/began/begun; separe passado simples de particípio antes de formar as frases.",
  },
  {
    section: "Conjugação e tempos",
    title: "Irregular por pessoa: drink e drive",
    explanation: "Depois da tabela, pratique os irregulares em frases completas. No presente, he, she e it recebem -s; no passado, a mesma forma irregular vale para todas as pessoas e não usa did em afirmações.",
    languageFocus: "I drink / she drinks / we drink; I drank / she drank / we drank. I drive / he drives / they drive; I drove / he drove / they drove.",
    examples: [
      { target: "She drinks water every morning.", native: "Ela bebe água todas as manhãs.", note: "presente: she drinks" },
      { target: "We drank juice after class.", native: "Nós bebemos suco depois da aula.", note: "passado: we drank, sem did" },
      { target: "He drove to work yesterday.", native: "Ele dirigiu para o trabalho ontem.", note: "passado: drove" },
    ],
    writingPrompt: "Escreva duas frases no presente e duas no passado: uma com drink/drank e outra com drive/drove. Marque quem recebe -s no presente.",
    scrambled: ["We", "drank", "juice", "after", "class"],
    answer: "We drank juice after class.",
    paretoPrompt: "No Pareto, recupere drink/drank/drunk e drive/drove/driven; organize cada trio, escolha uma pessoa e produza uma frase de presente e uma de passado.",
  },
  {
    section: "Conjugação e tempos",
    title: "Verbos irregulares: combinar, conferir e usar",
    explanation: "O exercício de combinação do original continua, mas os verbos são agrupados por padrão e depois usados em frase. Primeiro una forma-base, passado e particípio; depois escolha o tempo certo no contexto.",
    languageFocus: "write–wrote–written, see–saw–seen, take–took–taken, bring–brought–brought, speak–spoke–spoken e sleep–slept–slept.",
    examples: [
      { target: "I wrote a message yesterday.", native: "Eu escrevi uma mensagem ontem.", note: "passado: wrote" },
      { target: "They have seen the film.", native: "Eles viram o filme.", note: "particípio: seen com have" },
      { target: "She brought her notes to class.", native: "Ela trouxe suas anotações para a aula.", note: "passado: brought" },
    ],
    writingPrompt: "Monte três trios de verbo, passado e particípio. Depois escreva uma frase no passado e uma com have/has + particípio.",
    scrambled: ["She", "brought", "her", "notes", "to", "class"],
    answer: "She brought her notes to class.",
    paretoPrompt: "No Pareto, recupere write/wrote/written, see/saw/seen e take/took/taken; faça a combinação antes de escrever as frases de uso real.",
  },
  {
    section: "Família e identidade",
    title: "As pessoas da família",
    explanation: "Nomeie as pessoas de uma família antes de descrevê-las. Isso permite apresentar relações reais sem criar frases longas demais.",
    languageFocus: "mother, father, parent, child, sister e brother organizam relações próximas.",
    examples: [
      { target: "my mother", native: "minha mãe", note: "relação pessoal" },
      { target: "a parent", native: "um pai ou uma mãe", note: "termo geral" },
      { target: "two children", native: "duas crianças", note: "plural de child" },
    ],
    writingPrompt: "Escreva três palavras de família que façam parte da sua realidade ou de uma família fictícia.",
    scrambled: ["is", "My", "mother", "at", "home"],
    answer: "My mother is at home.",
    paretoPrompt: "No Pareto, recupere mother, father, parent e child; diga quem é cada pessoa na sua frase.",
  },
  {
    section: "Família e identidade",
    title: "Um nome e uma relação",
    explanation: "Um nome próprio pode ser seguido de uma relação para tornar a informação clara. O possessivo mostra de quem é a relação sem repetir uma explicação longa.",
    languageFocus: "Use my, your, his ou her antes da relação: her sister, his father.",
    examples: [
      { target: "Ana is my sister.", native: "Ana é minha irmã.", note: "nome e relação" },
      { target: "His father works.", native: "O pai dele trabalha.", note: "possessivo antes do nome" },
      { target: "Her brother studies.", native: "O irmão dela estuda.", note: "ação de outra pessoa" },
    ],
    writingPrompt: "Crie duas frases com um nome e uma relação familiar.",
    scrambled: ["my", "is", "brother", "Pedro"],
    answer: "Pedro is my brother.",
    paretoPrompt: "No Pareto, recupere brother, sister, my, his e her; troque somente a relação e explique o novo sentido.",
  },
  {
    section: "Família e identidade",
    title: "Ter e não ter",
    explanation: "Have e has mostram posse, relação ou característica. A forma muda com o sujeito: I, you, we e they usam have; he, she e it usam has.",
    languageFocus: "Use have/has para dizer quem tem algo ou quem tem irmãos, filhos e amigos.",
    examples: [
      { target: "I have a sister.", native: "Eu tenho uma irmã.", note: "I + have" },
      { target: "She has two children.", native: "Ela tem duas crianças.", note: "she + has" },
      { target: "We have friends here.", native: "Nós temos amigos aqui.", note: "we + have" },
    ],
    writingPrompt: "Escreva uma frase afirmativa e uma negativa com have ou has.",
    scrambled: ["has", "She", "two", "children"],
    answer: "She has two children.",
    paretoPrompt: "No Pareto, recupere have, has, friend e child e crie uma frase sem olhar.",
  },
  {
    section: "Família e identidade",
    title: "Descrever sem exagerar",
    explanation: "Uma descrição simples usa o verbo be e um adjetivo útil. Comece por qualidades observáveis no convívio, como kind, busy, calm ou helpful.",
    languageFocus: "O padrão é sujeito + be + adjetivo: My friend is kind.",
    examples: [
      { target: "My friend is kind.", native: "Meu amigo é gentil.", note: "qualidade" },
      { target: "My father is busy.", native: "Meu pai está ocupado.", note: "estado atual" },
      { target: "Our teacher is helpful.", native: "Nosso professor é prestativo.", note: "função no grupo" },
    ],
    writingPrompt: "Descreva duas pessoas com qualidades diferentes, sem usar o mesmo adjetivo duas vezes.",
    scrambled: ["is", "Our", "teacher", "helpful"],
    answer: "Our teacher is helpful.",
    paretoPrompt: "No Pareto, recupere kind, busy e helpful; combine cada adjetivo com uma pessoa adequada.",
  },
  {
    section: "Família e identidade",
    title: "Perguntar quem é alguém",
    explanation: "Who pergunta sobre uma pessoa. A ordem em inglês muda: a palavra de pergunta vem primeiro, seguida do verbo be e da pessoa ou coisa perguntada.",
    languageFocus: "Use Who is…? para identificar uma pessoa: Who is she? Who is your teacher?",
    examples: [
      { target: "Who is she?", native: "Quem é ela?", note: "pergunta curta" },
      { target: "She is my aunt.", native: "Ela é minha tia.", note: "resposta com relação" },
      { target: "Who is your teacher?", native: "Quem é seu professor?", note: "pergunta completa" },
    ],
    writingPrompt: "Escreva duas perguntas com Who e dê uma resposta para cada uma.",
    scrambled: ["your", "Who", "is", "teacher"],
    answer: "Who is your teacher?",
    paretoPrompt: "No Pareto, recupere who, teacher e aunt; faça uma pergunta e uma resposta sem consultar.",
  },
  {
    section: "Família e identidade",
    title: "Texto: uma família pequena",
    explanation: "Um texto curto junta frases que apresentam pessoas e uma informação sobre cada uma. A ordem ajuda o leitor: apresentação geral, pessoas e detalhe final.",
    languageFocus: "Ligue frases simples com and e use pronomes para evitar repetir o mesmo nome.",
    examples: [
      { target: "My family is small.", native: "Minha família é pequena.", note: "apresentação geral" },
      { target: "I have one sister, and she studies English.", native: "Eu tenho uma irmã, e ela estuda inglês.", note: "relação e ação" },
      { target: "We are at home today.", native: "Nós estamos em casa hoje.", note: "fechamento com tempo" },
    ],
    writingPrompt: "Escreva três ou quatro frases sobre uma família real ou imaginada. Use and uma vez.",
    scrambled: ["family", "My", "small", "is", "and", "kind"],
    answer: "My family is small and kind.",
    paretoPrompt: "No Pareto, recupere family, sister, study, home e today; transforme as palavras em um texto curto.",
  },
  {
    section: "Círculo social",
    title: "Amigo, colega e vizinho",
    explanation: "Pessoas do círculo social podem ser próximas em sentidos diferentes. Use a palavra que explica a relação: friend para amizade, classmate para turma, colleague para trabalho e neighbor para vizinhança.",
    languageFocus: "Escolha a relação pelo contexto, não apenas pela tradução mais parecida.",
    examples: [
      { target: "a close friend", native: "um amigo próximo", note: "amizade" },
      { target: "my classmate", native: "meu colega de turma", note: "estudo" },
      { target: "our neighbor", native: "nosso vizinho", note: "vizinhança" },
    ],
    writingPrompt: "Escreva uma frase sobre duas relações sociais diferentes.",
    scrambled: ["is", "My", "classmate", "helpful"],
    answer: "My classmate is helpful.",
    paretoPrompt: "No Pareto, compare friend, classmate, colleague e neighbor antes de criar uma frase para cada contexto.",
  },
  {
    section: "Círculo social",
    title: "Estudar e trabalhar com pessoas",
    explanation: "Quando uma ação envolve grupo, informe com quem ou onde ela acontece. Isso deixa uma frase simples mais completa sem mudar sua ordem básica.",
    languageFocus: "Use with + pessoa e at + lugar: study with my classmate; work at the office.",
    examples: [
      { target: "I study with my classmate.", native: "Eu estudo com meu colega de turma.", note: "companhia" },
      { target: "She works with a colleague.", native: "Ela trabalha com uma colega.", note: "trabalho" },
      { target: "We learn together.", native: "Nós aprendemos juntos.", note: "ação compartilhada" },
    ],
    writingPrompt: "Escreva duas ações que você faz com outra pessoa ou grupo.",
    scrambled: ["together", "We", "learn"],
    answer: "We learn together.",
    paretoPrompt: "No Pareto, recupere study, work, learn, with e together; complete uma frase com companhia.",
  },
  {
    section: "Círculo social",
    title: "Convidar com educação",
    explanation: "Um convite simples mostra a ação e uma possibilidade de tempo. Can é útil para perguntar de modo direto; would you like torna o convite mais cuidadoso.",
    languageFocus: "Use Can you…? para possibilidade e Would you like to…? para convite educado.",
    examples: [
      { target: "Can you study today?", native: "Você pode estudar hoje?", note: "possibilidade" },
      { target: "Would you like to join us?", native: "Você gostaria de se juntar a nós?", note: "convite" },
      { target: "Yes, I can.", native: "Sim, eu posso.", note: "resposta curta" },
    ],
    writingPrompt: "Escreva um convite e uma resposta positiva ou negativa educada.",
    scrambled: ["like", "Would", "you", "to", "join", "us"],
    answer: "Would you like to join us?",
    paretoPrompt: "No Pareto, recupere can, would like, join e today; faça um convite completo.",
  },
  {
    section: "Círculo social",
    title: "Preferências em grupo",
    explanation: "Like, love e prefer mostram graus diferentes de preferência. Acrescente uma atividade ou objeto para dizer exatamente do que você fala.",
    languageFocus: "Use prefer quando compara escolhas: I prefer tea to coffee.",
    examples: [
      { target: "I like reading.", native: "Eu gosto de ler.", note: "preferência geral" },
      { target: "We love music.", native: "Nós adoramos música.", note: "preferência forte" },
      { target: "I prefer tea to coffee.", native: "Eu prefiro chá a café.", note: "comparação" },
    ],
    writingPrompt: "Escreva duas preferências e uma comparação com prefer.",
    scrambled: ["tea", "prefer", "I", "to", "coffee"],
    answer: "I prefer tea to coffee.",
    paretoPrompt: "No Pareto, recupere like, love, prefer, tea e coffee; compare duas escolhas pessoais.",
  },
  {
    section: "Rotina e tempo",
    title: "A manhã organiza o dia",
    explanation: "Palavras de rotina ficam mais fáceis quando seguem uma ordem de tempo. Comece pelo que acontece in the morning e depois avance para o restante do dia.",
    languageFocus: "Use in the morning para parte do dia e depois coloque a ação principal.",
    examples: [
      { target: "I wake up in the morning.", native: "Eu acordo de manhã.", note: "início da rotina" },
      { target: "I have breakfast at seven.", native: "Eu tomo café da manhã às sete.", note: "ação e hora" },
      { target: "Then I go to work.", native: "Depois eu vou ao trabalho.", note: "sequência" },
    ],
    writingPrompt: "Escreva três ações da sua manhã usando then em uma delas.",
    scrambled: ["up", "I", "wake", "at", "seven"],
    answer: "I wake up at seven.",
    paretoPrompt: "No Pareto, recupere wake, breakfast, seven, then e work; monte sua manhã sem olhar.",
  },
  {
    section: "Rotina e tempo",
    title: "Ações da tarde e da noite",
    explanation: "Afternoon e evening ajudam a separar partes do dia. A frase continua com a mesma base: sujeito, verbo e complemento; muda apenas o momento da ação.",
    languageFocus: "Use in the afternoon e in the evening para ampliar uma rotina.",
    examples: [
      { target: "I work in the afternoon.", native: "Eu trabalho à tarde.", note: "período do dia" },
      { target: "We cook in the evening.", native: "Nós cozinhamos à noite.", note: "atividade em grupo" },
      { target: "They rest at night.", native: "Eles descansam à noite.", note: "fim do dia" },
    ],
    writingPrompt: "Escreva uma ação da tarde e uma ação da noite.",
    scrambled: ["in", "We", "the", "cook", "evening"],
    answer: "We cook in the evening.",
    paretoPrompt: "No Pareto, recupere work, cook, rest, afternoon e evening; contraste dois momentos do dia.",
  },
  {
    section: "Rotina e tempo",
    title: "Dias da semana em planejamento",
    explanation: "Dias da semana não precisam aparecer isolados. Use-os para marcar compromissos, hábitos e planos reais; assim a palavra já entra em uma estrutura útil.",
    languageFocus: "Use on + dia da semana: on Monday, on Friday. O dia normalmente começa com letra maiúscula.",
    examples: [
      { target: "I study on Monday.", native: "Eu estudo na segunda-feira.", note: "plano ou hábito" },
      { target: "We meet on Friday.", native: "Nós nos encontramos na sexta-feira.", note: "encontro" },
      { target: "The class is on Tuesday.", native: "A aula é na terça-feira.", note: "agenda" },
    ],
    writingPrompt: "Escreva duas atividades em dias diferentes da semana.",
    scrambled: ["on", "The", "is", "class", "Tuesday"],
    answer: "The class is on Tuesday.",
    paretoPrompt: "No Pareto, recupere dois dias da semana, class, study e meet; formule uma agenda curta.",
  },
  {
    section: "Rotina e tempo",
    title: "Frequência: sempre, às vezes, nunca",
    explanation: "Advérbios de frequência mostram quanto uma ação acontece. Em frases simples com verbo comum, eles geralmente ficam antes da ação principal.",
    languageFocus: "Use always, usually, sometimes e never antes do verbo: I usually study at night.",
    examples: [
      { target: "I always drink water.", native: "Eu sempre bebo água.", note: "hábito constante" },
      { target: "She usually walks to work.", native: "Ela geralmente caminha ao trabalho.", note: "hábito frequente" },
      { target: "We sometimes cook at home.", native: "Nós às vezes cozinhamos em casa.", note: "hábito variável" },
    ],
    writingPrompt: "Escreva três hábitos usando advérbios de frequência diferentes.",
    scrambled: ["usually", "I", "study", "at", "night"],
    answer: "I usually study at night.",
    paretoPrompt: "No Pareto, recupere always, usually, sometimes e never e mude apenas o advérbio para alterar o sentido.",
  },
  {
    section: "Rotina e tempo",
    title: "Perguntar sobre hábitos",
    explanation: "Do inicia perguntas no presente com I, you, we e they. A ação volta à forma simples depois de do; não coloque s no verbo nessa pergunta.",
    languageFocus: "Use Do + sujeito + verbo: Do you work here? Do they study at night?",
    examples: [
      { target: "Do you work here?", native: "Você trabalha aqui?", note: "pergunta sobre trabalho" },
      { target: "Do they study English?", native: "Eles estudam inglês?", note: "sujeito plural" },
      { target: "Yes, we do.", native: "Sim, nós estudamos ou fazemos.", note: "resposta curta" },
    ],
    writingPrompt: "Escreva duas perguntas com Do e respostas curtas para elas.",
    scrambled: ["you", "Do", "study", "at", "night"],
    answer: "Do you study at night?",
    paretoPrompt: "No Pareto, recupere do, work, study e night; transforme uma afirmação em pergunta.",
  },
];

const NATIVE_SOUND_REFERENCE: Record<string, string> = {
  "A em palavra curta": "Ouça cat, map e family na voz nativa. Não há uma cópia perfeita desse som em português; mantenha a vogal curta e confirme pela audição.",
  "A que diz o nome da letra": "Ouça name, late e same. O começo lembra de longe o fim de “rei”, mas a referência certa é a voz em inglês, não uma escrita aproximada.",
  "A em sílaba sem força": "Ouça a palavra inteira e deixe a sílaba fraca passar rapidamente. A força fica na parte mais importante da palavra.",
  "I curto e I longo": "Ouça sit e need em sequência. O i de need lembra o i de “vida”; sit é mais curto e precisa ser aprendido pela escuta.",
  "E aberto": "Ouça help, friend e ten. Comece com um e aberto parecido com o de “café”, mas confirme a posição da boca pela fala nativa.",
  "U central": "Ouça bus, cup e understand sem buscar uma vogal idêntica em português. Repita a palavra inteira no ritmo da voz nativa.",
  "O em palavra curta": "Ouça hot, not e stop. Esse o americano não corresponde exatamente ao português; repita sem acrescentar uma vogal no final.",
  "P e B no início": "Compare pen e book. Comece pelos mesmos contrastes de p e b que você já ouve em “pato” e “bola”, depois confirme pela voz inglesa.",
  "TH de thank e this": "Ouça thank e this. Não existe equivalente direto em português: veja a ponta da língua entre os dentes e use o áudio como referência principal.",
  "H soprado e combinações iniciais": "Ouça hello, study e speak. Perceba o pequeno sopro antes de hello e repita os grupos iniciais sem colocar uma vogal antes deles.",
  "R, L e final da palavra": "Ouça read, learn e word. R e l não soam como em português; preserve o final de cada palavra e deixe a voz nativa guiar a diferença.",
};

const SOUND_LESSON_PARETO_PROMPTS: Record<string, string> = {
  "A em palavra curta": "No Pareto, recupere cat, map e family. Diga uma frase curta com uma das palavras antes de conferir o modelo.",
  "A que diz o nome da letra": "No Pareto, recupere name, late e same. Compare duas palavras e diga qual delas você consegue ouvir no modelo.",
  "A em sílaba sem força": "No Pareto, recupere about, banana e America. Marque mentalmente a parte forte antes de falar a palavra inteira.",
  "I curto e I longo": "No Pareto, compare sit, ship e need. Ouça uma vez e escolha a palavra que tem o som mais longo.",
  "E aberto": "No Pareto, recupere help, friend e ten. Use uma delas em uma frase curta de apoio ou amizade.",
  "U central": "No Pareto, recupere bus, cup e understand. Escolha uma palavra, ouça e repita sem prolongar a vogal.",
  "O em palavra curta": "No Pareto, recupere hot, not e stop. Transforme uma afirmação curta em negativa com not.",
  "P e B no início": "No Pareto, compare pen, book e please. Faça um pedido educado com please e uma palavra iniciada por b.",
  "TH de thank e this": "No Pareto, compare thank, this e three. Escolha thank ou this e complete uma frase de cortesia.",
  "H soprado e combinações iniciais": "No Pareto, recupere hello, study e speak. Diga uma saudação e uma ação sem acrescentar vogal no começo.",
  "R, L e final da palavra": "No Pareto, recupere read, learn e word. Forme uma frase curta e mantenha o final de cada palavra audível.",
};

const NATIVE_SOUND_LESSON_INTRO = "Observe o padrão em palavras frequentes. A explicação em português só prepara sua escuta; a voz em inglês é a referência principal.";

const THIRD_BLOCK_PROGRESSIVE_LESSONS: ABCBookProgressiveLesson[] = [
  {
    section: "Casa e espaço",
    title: "Partes da casa",
    explanation: "Comece por nomear os espaços que usa todos os dias. A palavra fica mais fácil de lembrar quando já aparece dentro de uma ação possível naquele lugar.",
    languageFocus: "home é a ideia de lar; house é a construção. Room, kitchen, bathroom e bedroom nomeiam espaços.",
    examples: [
      { target: "I am at home.", native: "Eu estou em casa.", note: "ideia de lar" },
      { target: "The kitchen is clean.", native: "A cozinha está limpa.", note: "cômodo e qualidade" },
      { target: "My bedroom is small.", native: "Meu quarto é pequeno.", note: "espaço pessoal" },
    ],
    writingPrompt: "Escreva duas frases sobre espaços de uma casa real ou imaginada.",
    scrambled: ["is", "The", "kitchen", "clean"],
    answer: "The kitchen is clean.",
    paretoPrompt: "No Pareto, recupere home, house, kitchen e bedroom; associe cada palavra a uma ação possível.",
  },
  {
    section: "Casa e espaço",
    title: "Objetos próximos: this e that",
    explanation: "This indica algo perto de quem fala; that indica algo mais distante. Use o objeto depois da palavra de referência para apontar com clareza.",
    languageFocus: "This is + objeto perto. That is + objeto mais distante.",
    examples: [
      { target: "This is my book.", native: "Este é meu livro.", note: "objeto perto" },
      { target: "That is the door.", native: "Aquela é a porta.", note: "objeto mais distante" },
      { target: "This chair is new.", native: "Esta cadeira é nova.", note: "objeto e qualidade" },
    ],
    writingPrompt: "Aponte mentalmente para dois objetos e escreva uma frase com this e outra com that.",
    scrambled: ["This", "is", "my", "book"],
    answer: "This is my book.",
    paretoPrompt: "No Pareto, recupere this, that, book, door e chair; mude a distância sem mudar o objeto.",
  },
  {
    section: "Casa e espaço",
    title: "Existe e há: there is / there are",
    explanation: "Use there is para apresentar uma coisa e there are para duas ou mais. A estrutura mostra que algo existe em um lugar antes de detalhar sua posição.",
    languageFocus: "There is + singular. There are + plural.",
    examples: [
      { target: "There is a table in the room.", native: "Há uma mesa no quarto.", note: "uma coisa" },
      { target: "There are two windows.", native: "Há duas janelas.", note: "mais de uma coisa" },
      { target: "There is water in the cup.", native: "Há água no copo.", note: "substância" },
    ],
    writingPrompt: "Descreva três coisas que existem em um cômodo usando there is ou there are.",
    scrambled: ["is", "There", "a", "table", "here"],
    answer: "There is a table here.",
    paretoPrompt: "No Pareto, recupere there is, there are, table, window e water; escolha singular ou plural antes de falar.",
  },
  {
    section: "Casa e espaço",
    title: "Onde está o objeto?",
    explanation: "As preposições colocam objetos no espaço. Aprenda cada uma com uma imagem mental simples; não tente decorar uma lista sem cenário.",
    languageFocus: "in fica dentro, on fica sobre uma superfície, under fica abaixo e next to fica ao lado.",
    examples: [
      { target: "The keys are on the table.", native: "As chaves estão sobre a mesa.", note: "superfície" },
      { target: "The bag is under the chair.", native: "A bolsa está embaixo da cadeira.", note: "posição abaixo" },
      { target: "The lamp is next to the bed.", native: "A luminária está ao lado da cama.", note: "proximidade" },
    ],
    writingPrompt: "Escolha três objetos de um cômodo e escreva onde cada um está.",
    scrambled: ["on", "The", "keys", "are", "table", "the"],
    answer: "The keys are on the table.",
    paretoPrompt: "No Pareto, recupere in, on, under e next to; altere a posição de um mesmo objeto em quatro frases.",
  },
  {
    section: "Cidade e serviços",
    title: "Lugares úteis na cidade",
    explanation: "A cidade é aprendida por finalidade: você vai à bank para resolver dinheiro, à pharmacy para itens de saúde e ao store para compras.",
    languageFocus: "Use to + lugar para destino: go to the bank, walk to the store.",
    examples: [
      { target: "The bank is open today.", native: "O banco está aberto hoje.", note: "serviço financeiro" },
      { target: "I go to the pharmacy.", native: "Eu vou à farmácia.", note: "destino" },
      { target: "The store is near here.", native: "A loja fica perto daqui.", note: "localização" },
    ],
    writingPrompt: "Liste três lugares úteis de uma cidade e escreva uma ação para cada um.",
    scrambled: ["to", "I", "the", "pharmacy", "go"],
    answer: "I go to the pharmacy.",
    paretoPrompt: "No Pareto, recupere bank, pharmacy, store, go e near; planeje uma saída curta pela cidade.",
  },
  {
    section: "Cidade e serviços",
    title: "Perguntar pelo caminho",
    explanation: "Para pedir direção, comece com desculpa ou cortesia e depois pergunte where. A resposta pode usar preposições e pontos de referência.",
    languageFocus: "Excuse me, where is the…? abre uma pergunta educada e clara.",
    examples: [
      { target: "Excuse me, where is the station?", native: "Com licença, onde fica a estação?", note: "pergunta educada" },
      { target: "It is near the park.", native: "Fica perto do parque.", note: "ponto de referência" },
      { target: "Go straight and turn left.", native: "Siga em frente e vire à esquerda.", note: "instrução" },
    ],
    writingPrompt: "Escreva uma pergunta por um lugar e uma resposta curta de direção.",
    scrambled: ["where", "is", "the", "station", "Excuse", "me"],
    answer: "Excuse me, where is the station?",
    paretoPrompt: "No Pareto, recupere excuse me, where, station, near e park; pergunte e responda sem consultar.",
  },
  {
    section: "Cidade e serviços",
    title: "Direita, esquerda e em frente",
    explanation: "Uma direção curta tem uma sequência: movimento, rumo e referência. Use poucas instruções por frase para não perder a pessoa que escuta.",
    languageFocus: "Turn right, turn left e go straight são comandos de direção frequentes.",
    examples: [
      { target: "Turn right at the corner.", native: "Vire à direita na esquina.", note: "mudança de rumo" },
      { target: "Go straight for two blocks.", native: "Siga em frente por dois quarteirões.", note: "continuação" },
      { target: "The hotel is on the left.", native: "O hotel fica à esquerda.", note: "posição final" },
    ],
    writingPrompt: "Escreva uma rota de três passos de um lugar conhecido até outro.",
    scrambled: ["right", "Turn", "at", "the", "corner"],
    answer: "Turn right at the corner.",
    paretoPrompt: "No Pareto, recupere right, left, straight, corner e hotel; descreva uma rota sem olhar.",
  },
  {
    section: "Cidade e serviços",
    title: "Horários e funcionamento",
    explanation: "Open e closed ajudam a decidir quando ir a um serviço. Acrescente hora ou dia para transformar a informação em um plano prático.",
    languageFocus: "Use opens at e closes at para horário. At acompanha um horário específico.",
    examples: [
      { target: "The store opens at nine.", native: "A loja abre às nove.", note: "horário de abertura" },
      { target: "The library closes at six.", native: "A biblioteca fecha às seis.", note: "horário de fechamento" },
      { target: "Is the museum open?", native: "O museu está aberto?", note: "pergunta de funcionamento" },
    ],
    writingPrompt: "Escreva dois horários de lugares que você imagina usar em uma cidade.",
    scrambled: ["opens", "The", "store", "at", "nine"],
    answer: "The store opens at nine.",
    paretoPrompt: "No Pareto, recupere open, close, store, library e nine; forme uma pergunta e uma resposta sobre horário.",
  },
  {
    section: "Alimentação e compras",
    title: "Pedir comida e bebida",
    explanation: "Em um café ou restaurante, diga primeiro o que deseja. Acrescente please para manter o pedido educado e claro.",
    languageFocus: "I would like + item é uma forma educada de pedir.",
    examples: [
      { target: "I would like water, please.", native: "Eu gostaria de água, por favor.", note: "pedido básico" },
      { target: "Can I have a coffee?", native: "Posso pedir um café?", note: "pedido em pergunta" },
      { target: "We need a table for two.", native: "Nós precisamos de uma mesa para dois.", note: "situação de restaurante" },
    ],
    writingPrompt: "Escreva um pedido de bebida e um pedido de comida usando please.",
    scrambled: ["would", "I", "like", "water", "please"],
    answer: "I would like water, please.",
    paretoPrompt: "No Pareto, recupere would like, water, coffee, table e two; faça um pedido completo.",
  },
  {
    section: "Alimentação e compras",
    title: "Quantidade: some e any",
    explanation: "Some aparece com frequência em pedidos e frases afirmativas; any é comum em perguntas e negativas. Aprenda o padrão dentro de situações reais de compra.",
    languageFocus: "Use some em I need some bread. Use any em Do you have any milk?",
    examples: [
      { target: "I need some bread.", native: "Eu preciso de pão.", note: "quantidade afirmativa" },
      { target: "Do you have any milk?", native: "Você tem leite?", note: "pergunta" },
      { target: "We do not have any rice.", native: "Nós não temos arroz.", note: "negação" },
    ],
    writingPrompt: "Escreva uma frase afirmativa com some e uma pergunta com any.",
    scrambled: ["have", "Do", "you", "any", "milk"],
    answer: "Do you have any milk?",
    paretoPrompt: "No Pareto, recupere some, any, bread, milk e rice; troque afirmação, pergunta e negação.",
  },
  {
    section: "Alimentação e compras",
    title: "Preço e pagamento",
    explanation: "Uma compra simples começa pelo preço e termina pela forma de pagamento. Perguntas curtas evitam confusão em situações reais.",
    languageFocus: "How much is…? pergunta preço. Pay by card ou pay in cash informa pagamento.",
    examples: [
      { target: "How much is this?", native: "Quanto custa isto?", note: "pergunta de preço" },
      { target: "It is ten dollars.", native: "Custa dez dólares.", note: "resposta" },
      { target: "Can I pay by card?", native: "Posso pagar com cartão?", note: "forma de pagamento" },
    ],
    writingPrompt: "Escreva um diálogo de três linhas sobre perguntar e pagar por um item.",
    scrambled: ["much", "How", "is", "this"],
    answer: "How much is this?",
    paretoPrompt: "No Pareto, recupere how much, ten, pay, card e cash; pratique uma compra curta.",
  },
  {
    section: "Alimentação e compras",
    title: "Comparar escolhas",
    explanation: "Quando há duas opções, use comparativos simples para explicar a escolha. Compare apenas uma característica por frase no começo.",
    languageFocus: "Use cheaper, bigger ou better + than para comparar duas opções.",
    examples: [
      { target: "This bag is cheaper than that one.", native: "Esta bolsa é mais barata que aquela.", note: "preço" },
      { target: "The blue cup is bigger.", native: "O copo azul é maior.", note: "tamanho" },
      { target: "This option is better for me.", native: "Esta opção é melhor para mim.", note: "escolha" },
    ],
    writingPrompt: "Compare dois objetos, dois preços ou duas opções em duas frases.",
    scrambled: ["is", "This", "cheaper", "option"],
    answer: "This option is cheaper.",
    paretoPrompt: "No Pareto, recupere cheaper, bigger, better, option e bag; explique uma escolha pessoal.",
  },
  {
    section: "Viagem e deslocamento",
    title: "Chegar ao aeroporto",
    explanation: "Uma viagem começa com destino e meio de transporte. Use go to para o destino e by para explicar como você vai.",
    languageFocus: "Go to the airport by bus, train ou car descreve um deslocamento completo.",
    examples: [
      { target: "I go to the airport by bus.", native: "Eu vou ao aeroporto de ônibus.", note: "destino e transporte" },
      { target: "The train is late.", native: "O trem está atrasado.", note: "situação de viagem" },
      { target: "We travel tomorrow.", native: "Nós viajamos amanhã.", note: "plano próximo" },
    ],
    writingPrompt: "Escreva como você chegaria a um aeroporto e em que dia viajaria.",
    scrambled: ["to", "I", "the", "airport", "go", "by", "bus"],
    answer: "I go to the airport by bus.",
    paretoPrompt: "No Pareto, recupere airport, bus, train, travel e tomorrow; planeje uma viagem curta.",
  },
  {
    section: "Viagem e deslocamento",
    title: "Bilhete, horário e plataforma",
    explanation: "Em estações e aeroportos, três informações resolvem muitas situações: ticket, time e platform ou gate. Pergunte uma por vez.",
    languageFocus: "What time is…? pergunta horário. Where is…? pergunta localização.",
    examples: [
      { target: "Where is the ticket office?", native: "Onde fica a bilheteria?", note: "localização" },
      { target: "What time is the train?", native: "Que horas é o trem?", note: "horário" },
      { target: "The platform is number four.", native: "A plataforma é a número quatro.", note: "informação de embarque" },
    ],
    writingPrompt: "Escreva duas perguntas que você faria em uma estação.",
    scrambled: ["time", "What", "is", "the", "train"],
    answer: "What time is the train?",
    paretoPrompt: "No Pareto, recupere ticket, time, train, platform e number; faça uma pergunta e responda.",
  },
  {
    section: "Viagem e deslocamento",
    title: "Hotel e reserva",
    explanation: "Uma reserva pede nome, data e tipo de quarto. Frases curtas em ordem ajudam a confirmar informações sem perder detalhes.",
    languageFocus: "I have a reservation under + name informa a reserva ligada a uma pessoa.",
    examples: [
      { target: "I have a reservation under Silva.", native: "Eu tenho uma reserva no nome de Silva.", note: "identificação" },
      { target: "I need a room for two nights.", native: "Eu preciso de um quarto por duas noites.", note: "duração" },
      { target: "Is breakfast included?", native: "O café da manhã está incluído?", note: "pergunta de serviço" },
    ],
    writingPrompt: "Escreva uma mensagem curta para confirmar uma reserva de hotel.",
    scrambled: ["a", "I", "have", "reservation", "under", "Silva"],
    answer: "I have a reservation under Silva.",
    paretoPrompt: "No Pareto, recupere reservation, room, night, breakfast e included; confirme uma estadia.",
  },
  {
    section: "Viagem e deslocamento",
    title: "Um problema de viagem",
    explanation: "Quando algo não funciona, apresente o problema e depois faça um pedido de ajuda. A sequência problema + pedido torna a comunicação objetiva.",
    languageFocus: "My flight is delayed. Can you help me? une informação e pedido.",
    examples: [
      { target: "My flight is delayed.", native: "Meu voo está atrasado.", note: "problema" },
      { target: "I cannot find my bag.", native: "Eu não consigo encontrar minha mala.", note: "dificuldade" },
      { target: "Can you help me, please?", native: "Você pode me ajudar, por favor?", note: "pedido" },
    ],
    writingPrompt: "Escreva um problema de viagem e um pedido educado de ajuda.",
    scrambled: ["you", "Can", "help", "me", "please"],
    answer: "Can you help me, please?",
    paretoPrompt: "No Pareto, recupere delayed, find, bag, help e please; resolva uma situação curta de viagem.",
  },
  {
    section: "Saúde e bem-estar",
    title: "Como você se sente?",
    explanation: "Feel e be ajudam a falar sobre estado físico e emocional. Use uma palavra clara e depois acrescente tempo ou motivo se precisar explicar mais.",
    languageFocus: "I feel + adjetivo descreve sensação; I am + adjetivo também pode descrever estado.",
    examples: [
      { target: "I feel tired today.", native: "Eu me sinto cansado hoje.", note: "sensação" },
      { target: "She is sick.", native: "Ela está doente.", note: "estado" },
      { target: "We are fine now.", native: "Nós estamos bem agora.", note: "melhora" },
    ],
    writingPrompt: "Escreva três frases sobre como você ou outras pessoas se sentem.",
    scrambled: ["feel", "I", "tired", "today"],
    answer: "I feel tired today.",
    paretoPrompt: "No Pareto, recupere feel, tired, sick, fine e today; diga como está e pergunte a outra pessoa.",
  },
  {
    section: "Saúde e bem-estar",
    title: "Marcar uma consulta",
    explanation: "Para marcar uma consulta, diga o que precisa e pergunte por disponibilidade. A frase fica clara quando separa serviço, dia e horário.",
    languageFocus: "I need an appointment e Are you available…? formam uma solicitação simples.",
    examples: [
      { target: "I need an appointment.", native: "Eu preciso de uma consulta.", note: "necessidade" },
      { target: "Are you available on Monday?", native: "Você está disponível na segunda-feira?", note: "data" },
      { target: "Morning is better for me.", native: "De manhã é melhor para mim.", note: "preferência de horário" },
    ],
    writingPrompt: "Escreva uma solicitação de consulta com um dia e período de preferência.",
    scrambled: ["need", "I", "an", "appointment"],
    answer: "I need an appointment.",
    paretoPrompt: "No Pareto, recupere appointment, available, Monday, morning e better; marque um horário curto.",
  },
  {
    section: "Saúde e bem-estar",
    title: "Conselho simples com should",
    explanation: "Should oferece uma recomendação sem transformar a frase em ordem rígida. Use depois do sujeito e antes do verbo principal.",
    languageFocus: "You should + verbo: You should drink water. O verbo não recebe to.",
    examples: [
      { target: "You should drink water.", native: "Você deveria beber água.", note: "conselho" },
      { target: "You should rest today.", native: "Você deveria descansar hoje.", note: "cuidado" },
      { target: "Should I call a doctor?", native: "Eu deveria chamar um médico?", note: "pergunta de conselho" },
    ],
    writingPrompt: "Escreva dois conselhos simples sobre cuidado e uma pergunta com should.",
    scrambled: ["should", "You", "rest", "today"],
    answer: "You should rest today.",
    paretoPrompt: "No Pareto, recupere should, drink, water, rest e doctor; formule um conselho útil.",
  },
  {
    section: "Saúde e bem-estar",
    title: "Texto: um dia de cuidado",
    explanation: "Um texto de cuidado junta sensação, ação e resultado. A ordem natural é: como a pessoa está, o que ela faz e como espera ficar depois.",
    languageFocus: "Ligue ideias com so ou because: I am tired, so I rest. I drink water because it helps me.",
    examples: [
      { target: "I feel tired, so I rest.", native: "Eu me sinto cansado, então descanso.", note: "resultado" },
      { target: "I drink water because it helps me.", native: "Eu bebo água porque isso me ajuda.", note: "motivo" },
      { target: "Tomorrow I will feel better.", native: "Amanhã eu vou me sentir melhor.", note: "expectativa" },
    ],
    writingPrompt: "Escreva quatro frases sobre um dia em que alguém cuida de si.",
    scrambled: ["water", "I", "drink", "because", "it", "helps", "me"],
    answer: "I drink water because it helps me.",
    paretoPrompt: "No Pareto, recupere tired, rest, water, because e better; produza um texto curto de cuidado.",
  },
  {
    section: "Comunicação e estudo",
    title: "Enviar uma mensagem clara",
    explanation: "Uma mensagem curta diz para quem é, qual é o assunto e o que você precisa. Evite reunir muitas perguntas na mesma linha.",
    languageFocus: "Hello + nome, I need… e Thank you formam uma mensagem simples e educada.",
    examples: [
      { target: "Hello, I need help with this lesson.", native: "Olá, eu preciso de ajuda com esta lição.", note: "pedido claro" },
      { target: "Please call me later.", native: "Por favor, me ligue mais tarde.", note: "solicitação" },
      { target: "Thank you for your message.", native: "Obrigado pela sua mensagem.", note: "resposta" },
    ],
    writingPrompt: "Escreva uma mensagem de três linhas pedindo ajuda com um assunto de estudo.",
    scrambled: ["need", "I", "help", "with", "this", "lesson"],
    answer: "I need help with this lesson.",
    paretoPrompt: "No Pareto, recupere message, help, lesson, call e later; escreva uma mensagem educada.",
  },
  {
    section: "Comunicação e estudo",
    title: "Agenda e compromisso",
    explanation: "Uma agenda liga atividade, dia, horário e lugar. Acrescente as informações na ordem que ajuda quem lê a agir.",
    languageFocus: "I have + atividade + on + dia + at + hora organiza um compromisso.",
    examples: [
      { target: "I have a meeting on Tuesday.", native: "Eu tenho uma reunião na terça-feira.", note: "atividade e dia" },
      { target: "The class starts at ten.", native: "A aula começa às dez.", note: "horário" },
      { target: "We meet at the library.", native: "Nós nos encontramos na biblioteca.", note: "lugar" },
    ],
    writingPrompt: "Escreva três linhas de agenda para estudo, reunião ou compromisso pessoal.",
    scrambled: ["a", "have", "I", "meeting", "on", "Tuesday"],
    answer: "I have a meeting on Tuesday.",
    paretoPrompt: "No Pareto, recupere meeting, class, Tuesday, ten e library; monte uma agenda curta.",
  },
  {
    section: "Comunicação e estudo",
    title: "Explicar uma dificuldade",
    explanation: "Quando não entende algo, diga primeiro o que aconteceu e depois o que precisa. A pessoa que escuta consegue ajudar mais rápido.",
    languageFocus: "I do not understand + objeto. Could you explain…? pede uma ação de ajuda.",
    examples: [
      { target: "I do not understand this word.", native: "Eu não entendo esta palavra.", note: "dúvida direta" },
      { target: "Could you explain it again?", native: "Você poderia explicar isso de novo?", note: "pedido educado" },
      { target: "Please speak more slowly.", native: "Por favor, fale mais devagar.", note: "ajuste de ritmo" },
    ],
    writingPrompt: "Escreva uma mensagem de dúvida e um pedido de explicação.",
    scrambled: ["you", "Could", "explain", "it", "again"],
    answer: "Could you explain it again?",
    paretoPrompt: "No Pareto, recupere understand, explain, again, slowly e word; pratique pedir ajuda.",
  },
  {
    section: "Comunicação e estudo",
    title: "Revisão: conte uma pequena história",
    explanation: "Uma história curta pode juntar pessoa, rotina, lugar e objetivo. Comece com uma situação, descreva duas ações e feche com um resultado ou plano.",
    languageFocus: "Use first, then e finally para tornar a sequência visível sem frases excessivamente longas.",
    examples: [
      { target: "First, I study at home.", native: "Primeiro, eu estudo em casa.", note: "início" },
      { target: "Then I go to the library.", native: "Depois, eu vou à biblioteca.", note: "continuação" },
      { target: "Finally, I review new words.", native: "Por fim, eu reviso palavras novas.", note: "fechamento" },
    ],
    writingPrompt: "Escreva uma história de cinco frases sobre um dia de estudo, usando first, then e finally.",
    scrambled: ["Finally", "I", "review", "new", "words"],
    answer: "Finally, I review new words.",
    paretoPrompt: "No Pareto, recupere first, then, finally, study, library e review; reconte a sequência sem olhar.",
  },
];

const createFourthLesson = (
  section: string,
  title: string,
  explanation: string,
  languageFocus: string,
  examples: Array<[string, string]>,
  writingPrompt: string,
  scrambled: string[],
  answer: string,
  paretoPrompt: string,
): ABCBookProgressiveLesson => ({
  section,
  title,
  explanation,
  languageFocus,
  examples: examples.map(([target, native], index) => ({ target, native, note: index === 0 ? "modelo principal" : index === 1 ? "variação útil" : "uso no contexto" })),
  writingPrompt,
  scrambled,
  answer,
  paretoPrompt,
});

const FOURTH_BLOCK_PROGRESSIVE_LESSONS: ABCBookProgressiveLesson[] = [
  createFourthLesson("Trabalho e tecnologia", "Funções e lugares de trabalho", "Fale primeiro da função e depois do local. Uma frase curta com profissão e lugar já apresenta uma situação real.", "Use I am a… para função e I work at… para local de trabalho.", [["I am a designer.", "Eu sou designer."], ["She works at a hospital.", "Ela trabalha em um hospital."], ["We work from home.", "Nós trabalhamos de casa."]], "Escreva três frases sobre funções e locais de trabalho reais ou imaginados.", ["works", "She", "at", "a", "hospital"], "She works at a hospital.", "No Pareto, recupere work, designer, hospital, home e job; descreva uma rotina profissional."),
  createFourthLesson("Trabalho e tecnologia", "Tarefas de hoje", "Uma tarefa clara tem ação, objeto e prazo. Essa organização ajuda a escrever listas e pedir apoio sem ambiguidade.", "Use need to para necessidade e have to para obrigação.", [["I need to finish this report.", "Eu preciso terminar este relatório."], ["We have to send the email today.", "Nós temos de enviar o e-mail hoje."], ["He needs to call the client.", "Ele precisa ligar para o cliente."]], "Escreva três tarefas de um dia usando need to ou have to.", ["need", "I", "to", "finish", "this", "report"], "I need to finish this report.", "No Pareto, recupere need, finish, report, send e today; transforme tarefas em frases completas."),
  createFourthLesson("Trabalho e tecnologia", "Arquivo, mensagem e ligação", "Na comunicação digital, diga o que foi enviado, recebido ou precisa ser encontrado. O objeto da ação vem logo depois do verbo.", "Send, receive, open e save organizam tarefas de arquivo e mensagem.", [["Please send the file again.", "Por favor, envie o arquivo novamente."], ["I received your message.", "Eu recebi sua mensagem."], ["Save the document here.", "Salve o documento aqui."]], "Escreva uma mensagem curta pedindo um arquivo e confirmando seu recebimento.", ["the", "Please", "send", "file", "again"], "Please send the file again.", "No Pareto, recupere send, file, receive, message e save; simule uma troca de trabalho."),
  createFourthLesson("Trabalho e tecnologia", "Reunião curta e objetiva", "Uma reunião eficiente apresenta objetivo, horário e próxima ação. Use frases curtas para confirmar o que cada pessoa fará depois.", "Let’s + verbo sugere uma ação conjunta.", [["Let’s discuss the plan.", "Vamos discutir o plano."], ["The meeting starts at two.", "A reunião começa às duas."], ["I will take notes.", "Eu vou fazer anotações."]], "Escreva uma pauta de três linhas para uma reunião simples.", ["discuss", "Let’s", "the", "plan"], "Let’s discuss the plan.", "No Pareto, recupere meeting, plan, start, notes e discuss; conduza uma abertura breve."),
  createFourthLesson("Ideias e opinião", "Dar uma opinião com motivo", "Uma opinião fica mais forte quando vem acompanhada de motivo. Diga o que pensa e use because para ligar a explicação.", "I think apresenta opinião; because introduz o motivo.", [["I think this book is useful.", "Eu acho que este livro é útil."], ["I like it because it is clear.", "Eu gosto dele porque é claro."], ["We need more practice.", "Nós precisamos de mais prática."]], "Escreva duas opiniões e dê um motivo para cada uma.", ["think", "I", "this", "is", "useful"], "I think this is useful.", "No Pareto, recupere think, useful, clear, because e practice; defenda uma escolha simples."),
  createFourthLesson("Ideias e opinião", "Concordar e discordar com respeito", "Uma conversa pode discordar sem se tornar agressiva. Primeiro reconheça a ideia e depois apresente seu ponto de vista.", "I agree, I do not agree e I understand, but… criam respostas respeitosas.", [["I agree with you.", "Eu concordo com você."], ["I understand, but I prefer this option.", "Eu entendo, mas prefiro esta opção."], ["That is a good idea.", "Essa é uma boa ideia."]], "Escreva uma resposta de acordo e outra de discordância respeitosa.", ["agree", "I", "with", "you"], "I agree with you.", "No Pareto, recupere agree, understand, prefer, option e idea; participe de uma conversa curta."),
  createFourthLesson("Ideias e opinião", "Perguntar por quê", "Why pede motivo; because apresenta razão. Juntas, essas palavras ajudam a sair de respostas isoladas e construir uma ideia completa.", "Why do you…? e Because I… formam uma pergunta e uma resposta ligadas.", [["Why do you study English?", "Por que você estuda inglês?"], ["Because I want to travel.", "Porque eu quero viajar."], ["Why is this important?", "Por que isto é importante?"]], "Escreva duas perguntas com Why e dê respostas completas com Because.", ["do", "Why", "you", "study", "English"], "Why do you study English?", "No Pareto, recupere why, because, want, travel e important; explique um objetivo seu."),
  createFourthLesson("Ideias e opinião", "Comparar duas possibilidades", "Uma comparação boa apresenta duas opções e um critério. Use than para mostrar a relação sem perder a ordem da frase.", "A is more + adjetivo + than B compara duas ideias ou objetos.", [["This route is faster than that one.", "Esta rota é mais rápida que aquela."], ["Online study is more flexible.", "O estudo on-line é mais flexível."], ["This task is easier than the last task.", "Esta tarefa é mais fácil que a última."]], "Compare duas formas de estudar, dois lugares ou duas escolhas usando than.", ["is", "This", "faster", "route", "than", "that", "one"], "This route is faster than that one.", "No Pareto, recupere faster, flexible, easier, route e task; compare duas opções pessoais."),
  createFourthLesson("Passado e memória", "Ontem: ações concluídas", "Para contar algo concluído, use yesterday ou outra marca de tempo e escolha o verbo no passado. Comece com fatos curtos e claros.", "Verbos regulares normalmente recebem ed; verbos frequentes também precisam ser aprendidos em frases.", [["I studied English yesterday.", "Eu estudei inglês ontem."], ["She worked at home.", "Ela trabalhou em casa."], ["We went to the park.", "Nós fomos ao parque."]], "Escreva três ações que alguém fez ontem.", ["studied", "I", "English", "yesterday"], "I studied English yesterday.", "No Pareto, recupere yesterday, studied, worked, went e park; conte um dia em três linhas."),
  createFourthLesson("Passado e memória", "Perguntas no passado", "Did inicia muitas perguntas sobre ações passadas. Depois de did, o verbo retorna à forma simples.", "Use Did + sujeito + verbo para perguntar sobre ontem ou outro momento concluído.", [["Did you study yesterday?", "Você estudou ontem?"], ["Did she call you?", "Ela ligou para você?"], ["Yes, I did.", "Sim, eu estudei ou fiz."]], "Escreva duas perguntas com Did e respostas curtas.", ["you", "Did", "study", "yesterday"], "Did you study yesterday?", "No Pareto, recupere did, yesterday, call, study e answer; faça um pequeno diálogo no passado."),
  createFourthLesson("Passado e memória", "Uma lembrança curta", "Uma lembrança pode ter tempo, lugar e acontecimento. Conte os fatos na ordem em que ocorreram para não confundir quem lê.", "First, then e after that organizam uma sequência passada.", [["First, I arrived at the station.", "Primeiro, eu cheguei à estação."], ["Then I met my friend.", "Depois, encontrei meu amigo."], ["After that, we had coffee.", "Depois disso, tomamos café."]], "Escreva uma lembrança de quatro frases usando marcadores de sequência.", ["met", "I", "my", "friend", "Then"], "Then I met my friend.", "No Pareto, recupere arrived, station, met, friend e coffee; reconte uma sequência curta."),
  createFourthLesson("Passado e memória", "Revisar o que aprendeu", "Uma revisão útil não repete tudo. Ela escolhe palavras difíceis, recupera uma frase sem olhar e corrige apenas o ponto que faltou.", "Use I learned e I need to review para registrar aprendizado e próxima ação.", [["I learned five new words.", "Eu aprendi cinco palavras novas."], ["I need to review this sentence.", "Eu preciso revisar esta frase."], ["I remember the main idea.", "Eu lembro a ideia principal."]], "Registre três coisas que aprendeu e uma que deseja revisar.", ["learned", "I", "five", "new", "words"], "I learned five new words.", "No Pareto, recupere learned, review, remember, sentence e idea; faça uma revisão consciente."),
  createFourthLesson("Planos e futuro", "Decisão com will", "Will apresenta uma decisão ou promessa futura. Use-o antes do verbo principal e acrescente tempo quando isso ajudar a pessoa que escuta.", "I will + verbo indica uma ação futura escolhida agora.", [["I will call you later.", "Eu vou ligar para você mais tarde."], ["We will study tomorrow.", "Nós vamos estudar amanhã."], ["She will send the file.", "Ela vai enviar o arquivo."]], "Escreva três decisões simples para hoje ou amanhã.", ["will", "I", "call", "you", "later"], "I will call you later.", "No Pareto, recupere will, call, later, tomorrow e send; transforme planos em promessas claras."),
  createFourthLesson("Planos e futuro", "Plano com going to", "Going to mostra um plano que já está sendo preparado. Compare com will: a escolha depende do sentido, não da quantidade de palavras.", "I am going to + verbo apresenta intenção planejada.", [["I am going to travel next month.", "Eu vou viajar no próximo mês."], ["They are going to move soon.", "Eles vão se mudar em breve."], ["We are going to practise tonight.", "Nós vamos praticar esta noite."]], "Escreva três planos que já estão organizados.", ["going", "I", "am", "to", "travel", "next", "month"], "I am going to travel next month.", "No Pareto, recupere going to, travel, month, move e tonight; diferencie plano e decisão rápida."),
  createFourthLesson("Planos e futuro", "Marcar um encontro", "Um encontro precisa de pessoa, atividade, lugar e horário. Escreva as informações na ordem que outra pessoa consegue confirmar.", "Are you free…? pergunta disponibilidade. Let’s meet… propõe encontro.", [["Are you free on Saturday?", "Você está livre no sábado?"], ["Let’s meet at the café.", "Vamos nos encontrar no café."], ["What time works for you?", "Que horário funciona para você?"]], "Escreva um convite completo para um encontro de estudo ou lazer.", ["free", "Are", "you", "on", "Saturday"], "Are you free on Saturday?", "No Pareto, recupere free, Saturday, meet, café e time; marque uma atividade com outra pessoa."),
  createFourthLesson("Planos e futuro", "Condição simples com if", "If apresenta uma condição e mostra o que acontece depois. Comece com situações reais e somente uma consequência por frase.", "If + situação, + resultado: If it rains, I stay home.", [["If it rains, I stay home.", "Se chover, eu fico em casa."], ["If I have time, I will read.", "Se eu tiver tempo, eu vou ler."], ["If you need help, call me.", "Se você precisar de ajuda, ligue para mim."]], "Escreva três condições simples sobre rotina, estudo ou viagem.", ["it", "If", "rains", "I", "stay", "home"], "If it rains, I stay home.", "No Pareto, recupere if, rain, time, read e help; complete uma condição e uma consequência."),
  createFourthLesson("Comunidade e serviços", "Pedir ajuda em um serviço", "Em um serviço público ou loja, diga primeiro o que precisa e depois faça uma pergunta curta. Cortesia melhora a comunicação sem alongar demais.", "Could you help me with…? abre um pedido claro e educado.", [["Could you help me with this form?", "Você poderia me ajudar com este formulário?"], ["I need information about the service.", "Eu preciso de informação sobre o serviço."], ["Where should I wait?", "Onde eu devo esperar?"]], "Escreva um pedido de ajuda em um balcão de serviço.", ["you", "Could", "help", "me", "with", "this", "form"], "Could you help me with this form?", "No Pareto, recupere help, form, information, service e wait; simule uma conversa no balcão."),
  createFourthLesson("Comunidade e serviços", "Resolver uma reclamação", "Uma reclamação clara separa fato, problema e pedido de solução. Evite repetir emoções; informe a situação de modo objetivo.", "There is a problem with… apresenta a dificuldade; I would like… pede a solução.", [["There is a problem with my order.", "Há um problema com meu pedido."], ["I received the wrong item.", "Eu recebi o item errado."], ["I would like a refund, please.", "Eu gostaria de um reembolso, por favor."]], "Escreva uma reclamação educada de três linhas sobre uma compra.", ["is", "There", "a", "problem", "with", "my", "order"], "There is a problem with my order.", "No Pareto, recupere problem, order, wrong, item e refund; explique uma situação de compra."),
  createFourthLesson("Comunidade e serviços", "Segurança e orientação", "Em uma situação de urgência, a frase precisa ser curta e direta. Diga o local, o problema e a ajuda necessária.", "I need help e Call… são frases de ação imediata; mantenha o local quando souber.", [["I need help at the station.", "Eu preciso de ajuda na estação."], ["Please call the police.", "Por favor, chame a polícia."], ["My phone is missing.", "Meu telefone está desaparecido."],], "Escreva duas frases curtas para pedir ajuda em uma situação de perda.", ["need", "I", "help", "at", "the", "station"], "I need help at the station.", "No Pareto, recupere help, station, police, phone e missing; pratique informar um problema com calma."),
  createFourthLesson("Comunidade e serviços", "Participar de um evento", "Para participar de uma atividade, confirme data, local e o que levar. Essa organização serve para aulas, eventos e encontros comunitários.", "When is…? pergunta data; Do I need to bring…? pergunta o necessário.", [["When is the event?", "Quando é o evento?"], ["It is at the community center.", "É no centro comunitário."], ["Do I need to bring anything?", "Eu preciso levar algo?"],], "Escreva uma conversa curta para confirmar detalhes de um evento.", ["is", "When", "the", "event"], "When is the event?", "No Pareto, recupere event, community, center, bring e anything; confirme uma participação."),
  createFourthLesson("Projetos pessoais", "Hobbies e interesses", "Falar de interesses permite treinar verbos e frequência com conteúdo pessoal. Diga a atividade e acrescente quando ou com quem ela acontece.", "Enjoy, like e love podem apresentar interesse; use gerúndio depois deles quando falar da atividade.", [["I enjoy reading at night.", "Eu gosto de ler à noite."], ["She loves cooking with her family.", "Ela adora cozinhar com a família."], ["We like learning new skills.", "Nós gostamos de aprender novas habilidades."]], "Escreva três interesses seus com atividade e período de tempo.", ["enjoy", "I", "reading", "at", "night"], "I enjoy reading at night.", "No Pareto, recupere enjoy, reading, cooking, learning e skills; descreva um interesse pessoal."),
  createFourthLesson("Projetos pessoais", "Descrever uma experiência", "Uma experiência completa junta lugar, ação e impressão. Use uma frase para cada parte antes de tentar um texto maior.", "I went…, I did… e It was… organizam uma experiência passada.", [["I went to the beach last weekend.", "Eu fui à praia no último fim de semana."], ["I learned something new.", "Eu aprendi algo novo."], ["It was a great experience.", "Foi uma ótima experiência."],], "Escreva quatro frases sobre uma experiência simples e real ou imaginada.", ["was", "It", "a", "great", "experience"], "It was a great experience.", "No Pareto, recupere went, learned, great, experience e weekend; conte uma experiência curta."),
  createFourthLesson("Projetos pessoais", "Plano de aprendizagem", "Um plano de aprendizagem informa meta, método e frequência. Ele fica mais realista quando cada frase usa uma ação observável.", "I want to… apresenta meta; I will practise… apresenta rotina.", [["I want to speak more confidently.", "Eu quero falar com mais confiança."], ["I will practise every day.", "Eu vou praticar todos os dias."], ["I will review my notes weekly.", "Eu vou revisar minhas anotações semanalmente."]], "Escreva um plano de estudo de cinco linhas com meta, ação e frequência.", ["will", "I", "practise", "every", "day"], "I will practise every day.", "No Pareto, recupere want, speak, practise, review e notes; defina uma meta possível."),
  createFourthLesson("Projetos pessoais", "Projeto final: uma apresentação", "Uma apresentação curta reúne identidade, rotina, interesse, objetivo e próximo passo. Organize cada informação em uma frase antes de conectar ideias.", "Use conectores conhecidos, como and, but, because e then, sem usar todos na mesma frase.", [["My name is Ana, and I study English.", "Meu nome é Ana, e eu estudo inglês."], ["I learn because I want to travel.", "Eu aprendo porque quero viajar."], ["Next, I will practise with a friend.", "Em seguida, vou praticar com um amigo."],], "Escreva uma apresentação de oito frases usando o que aprendeu no volume.", ["will", "Next", "I", "practise", "with", "a", "friend"], "Next, I will practise with a friend.", "No Pareto, recupere name, study, learn, travel, practise e friend; apresente seu projeto sem consultar."),
];

export type ABCBookDelivery = {
  available: true;
  edition: string;
  nativeLabel: string;
  targetLabel: string;
  introduction: string;
  manualLeaves: ABCBookManualLeaf[];
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
  languageBlocks: Array<{
    id: string;
    kind: "essential_phrase" | "everyday_expression" | "natural_reply" | "contextual_slang";
    english: string;
    portuguese: string;
    figurativePronunciation: string;
    example: string;
    examplePortuguese: string;
    writingPrompt: string;
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

const A1_GUIDED_DIALOGUES: ABCBookChapter["guidedDialogue"][] = [
  [
    { speaker: "James", target: "Hello. I am James. What is your name?", native: "Olá. Eu sou James. Qual é o seu nome?" },
    { speaker: "Student", target: "My name is Ana. Nice to meet you.", native: "Meu nome é Ana. Prazer em conhecer você." },
  ],
  [
    { speaker: "Student", target: "Excuse me. Can you help me, please?", native: "Com licença. Você pode me ajudar, por favor?" },
    { speaker: "Assistant", target: "Of course. Do you need water too?", native: "Claro. Você também precisa de água?" },
  ],
  [
    { speaker: "James", target: "Where is the pool?", native: "Onde fica a piscina?" },
    { speaker: "Receptionist", target: "It is near the beach.", native: "Ela fica perto da praia." },
  ],
  [
    { speaker: "Student", target: "Who is she?", native: "Quem é ela?" },
    { speaker: "Friend", target: "She is my friend. She studies English.", native: "Ela é minha amiga. Ela estuda inglês." },
  ],
  [
    { speaker: "Student", target: "What time is the class?", native: "Que horas é a aula?" },
    { speaker: "Teacher", target: "It starts at seven today.", native: "Ela começa às sete hoje." },
  ],
  [
    { speaker: "Student", target: "Whose bag is this?", native: "De quem é esta bolsa?" },
    { speaker: "Maria", target: "It is my bag. My phone is in the room.", native: "É minha bolsa. Meu telefone está no cômodo." },
  ],
  [
    { speaker: "Teacher", target: "Do you study in the morning?", native: "Você estuda de manhã?" },
    { speaker: "Student", target: "Yes. I practice every day because I want confidence.", native: "Sim. Eu pratico todos os dias porque quero confiança." },
  ],
  [
    { speaker: "Server", target: "Would you like still or sparkling water?", native: "Você gostaria de água sem gás ou com gás?" },
    { speaker: "Student", target: "Still water, please. Thank you.", native: "Água sem gás, por favor. Obrigado." },
  ],
  [
    { speaker: "Friend", target: "Which place do you prefer?", native: "De qual lugar você prefere?" },
    { speaker: "Student", target: "I prefer the library because it is quiet.", native: "Eu prefiro a biblioteca porque ela é silenciosa." },
  ],
  [
    { speaker: "Student", target: "Can you repeat that slowly, please?", native: "Você pode repetir isso devagar, por favor?" },
    { speaker: "Teacher", target: "Of course. First read, then write, and finally speak.", native: "Claro. Primeiro leia, depois escreva e por fim fale." },
  ],
];

const A1_CHAPTERS: ABCBookChapter[] = STRUCTURED_A1_UNITS.map((unit, index) => ({
  title: unit.unit,
  objective: unit.objective,
  reading: unit.reading,
  translation: unit.readingTranslation,
  guidedDialogue: A1_GUIDED_DIALOGUES[index] ?? A1_GUIDED_DIALOGUES[0],
  comprehensionQuestions: unit.questions,
  grammarTitle: unit.grammarTitle,
  grammarExplanation: unit.grammarExplanation,
  writingPrompt: unit.writingPrompt,
  orderingExercise: A1_ORDERING_EXERCISES[index] ?? A1_ORDERING_EXERCISES[0],
  paretoContext: A1_PARETO_CONTEXTS[index] ?? "foundation",
  paretoChapter: index + 1,
}));

const PORTUGUESE_ENGLISH_BOOK: ABCBookDelivery = {
  available: true,
  edition: "Português → Inglês",
  nativeLabel: "Português",
  targetLabel: "Inglês",
  introduction: "Quando uma frase, uma palavra ou uma resposta parecer difícil, use este livro como um caderno de apoio. Comece pelo sentido, observe o padrão, recupere a palavra sem consultar e aplique-a em uma nova frase. O professor e a cena continuam disponíveis depois que você fechar o livro.",
  manualLeaves: [
    {
      eyebrow: "Manual contínuo · Primeiro passo",
      title: "Estude uma ideia inteira, não uma lista isolada",
      paragraphs: [
        "Uma palavra se torna utilizável quando aparece dentro de uma ideia simples. Por isso, este manual apresenta poucas palavras por vez, mostra o sentido em português e depois pede uma ação: ouvir, organizar, escrever ou responder.",
        "Comece pela frase que você consegue entender. Só depois troque uma parte dela. Assim, o vocabulário cresce dentro de padrões que continuam úteis em conversas, cenas e lições.",
      ],
      model: "I need water. → I need help. → I need a ticket.",
      practice: "Leia o modelo, cubra a última palavra e escreva uma nova necessidade sem consultar.",
    },
    {
      eyebrow: "Manual contínuo · Som e sentido",
      title: "Ouça antes de tentar imitar a escrita",
      paragraphs: [
        "A escrita mostra a forma da palavra, mas a voz nativa mostra o ritmo, a ligação entre sons e o que deve receber mais força. Use o botão de ouvir como referência principal; a comparação com o português serve apenas como apoio inicial.",
        "Repita em blocos curtos. Primeiro escute a palavra, depois a frase inteira e por fim responda com uma informação sua. A meta não é decorar símbolos: é reconhecer e produzir uma fala compreensível.",
      ],
      model: "Please speak slowly. → Sorry, can you say that again?",
      practice: "Ouça uma frase, repita em duas partes e transforme-a em um pedido que você realmente usaria.",
    },
    {
      eyebrow: "Manual contínuo · Construção da frase",
      title: "Escreva por blocos e acrescente uma informação por vez",
      paragraphs: [
        "Em inglês, uma frase inicial costuma começar por quem vive a ideia, segue para a ação e termina com o complemento. Depois que esse núcleo estiver claro, acrescente lugar, tempo, motivo ou companhia sem mudar o que já está certo.",
        "Quando a ordem parecer confusa, volte ao bloco menor. Não tente corrigir todos os pontos de uma vez: reorganize a frase, compare com o modelo e escreva novamente de memória.",
      ],
      model: "I study English. → I study English at home. → I study English at home in the morning.",
      practice: "Monte uma frase com ação, lugar e tempo. Depois retire uma informação e compare os dois sentidos.",
    },
    {
      eyebrow: "Manual contínuo · Recuperação e retorno",
      title: "Use o Pareto para lembrar; use a cena para aplicar",
      paragraphs: [
        "Depois de compreender uma folha, o Pareto ajuda a recuperar palavras e frases sem olhar. Ao acertar, escreva uma frase nova. Ao errar, volte ao exemplo, corrija apenas a parte necessária e tente outra vez mais tarde.",
        "O Livro ABC é uma consulta voluntária. Você pode fechá-lo e retornar exatamente à lição ou cena em que estava para testar a mesma ideia com o Professor, com objetos ou em conversa.",
      ],
      model: "Pareto: water → I would like water, please. → Cena: pedir água em contexto.",
      practice: "Escolha uma palavra desta folha, forme uma frase sem olhar e use a mesma ideia na próxima conversa.",
    },
    {
      eyebrow: "Manual contínuo · Vocabulário em contexto",
      title: "Agrupe palavras que vivem na mesma situação",
      paragraphs: [
        "Palavras de família, casa, cidade, alimentação e viagem ficam mais fáceis de recuperar quando aparecem próximas e desempenham uma função clara. Em vez de misturar uma lista longa, observe quem participa, onde a ação acontece e o que a pessoa precisa dizer.",
        "Depois de aprender o grupo, contraste palavras parecidas. Home fala da ideia de lar; house fala da construção. Friend fala da relação; classmate fala da pessoa que estuda com você. O contraste evita traduções automáticas e torna a escolha mais precisa.",
      ],
      model: "At home: table, water, book. / In the city: station, bank, pharmacy.",
      practice: "Escolha um contexto, separe cinco palavras úteis e forme uma frase que inclua pessoa, lugar ou finalidade.",
    },
    {
      eyebrow: "Manual contínuo · Pergunta e resposta",
      title: "Pergunte para abrir uma conversa e responda com uma informação útil",
      paragraphs: [
        "Uma pergunta bem construída cria espaço para a outra pessoa responder. Comece com uma palavra de pergunta quando precisar de uma informação específica, como who, what, where, when ou how. Use do ou does em muitas perguntas sobre hábitos e ações no presente.",
        "A resposta não precisa repetir toda a pergunta. Diga primeiro a informação principal e acrescente somente um detalhe que ajude a pessoa: lugar, tempo, quantidade ou razão. Esse movimento de perguntar e responder é a base de uma conversa clara.",
      ],
      model: "Where is the station? — It is near the park. / Do you study at night? — Yes, I do.",
      practice: "Escreva uma pergunta sobre lugar e outra sobre rotina. Responda cada uma com uma frase completa e curta.",
    },
    {
      eyebrow: "Manual contínuo · Gramática aplicada",
      title: "Use a gramática para esclarecer a ideia, não para interromper a prática",
      paragraphs: [
        "A gramática mostra como as partes da frase trabalham juntas. Ao estudar uma regra, encontre-a primeiro em uma frase útil. Veja quem é o sujeito, qual é a ação e o que completa o sentido. Só então compare a ordem com o português.",
        "Pratique uma mudança por vez. Transforme afirmação em pergunta, depois em negação ou em uma frase com tempo e lugar. Pequenas transformações mostram que você entende o padrão e não apenas memorizou uma frase pronta.",
      ],
      model: "She works here. → Does she work here? → She does not work here.",
      practice: "Escolha uma afirmação do livro e reescreva-a como pergunta e como negação, mantendo a mesma ideia principal.",
    },
    {
      eyebrow: "Manual contínuo · Revisão cumulativa",
      title: "Volte ao que aprendeu para tornar a nova frase estável",
      paragraphs: [
        "No fim de cada bloco, reveja uma palavra, uma frase e uma pergunta anterior antes de começar uma atividade nova. A revisão curta mostra quais ideias já estão disponíveis e quais ainda precisam de uma nova tentativa.",
        "Quando encontrar dificuldade, retorne apenas ao trecho necessário. Ouça, compare, escreva e recupere de novo. Depois siga para o Pareto ou para a cena. Avançar com uma dúvida resolvida é mais útil do que acumular páginas lidas sem recuperação.",
      ],
      model: "Hoje: I study English at home. / Depois: Do you study English at home? / Amanhã: I do not study English at home.",
      practice: "Escolha uma frase antiga, transforme-a de duas maneiras e marque uma palavra para revisar no próximo intervalo do Pareto.",
    },
    {
      eyebrow: "Manual contínuo · Leitura consciente",
      title: "Leia para encontrar uma ideia, depois observe como ela foi montada",
      paragraphs: [
        "Uma leitura curta não exige que você entenda todas as palavras de imediato. Primeiro localize quem aparece, o que acontece e onde ou quando a ação acontece. Depois use a tradução para confirmar somente o que ainda não ficou claro.",
        "Na segunda leitura, observe uma estrutura útil e uma palavra que você poderá reutilizar. Feche o texto por alguns segundos e conte a ideia com frases menores. Essa reconstrução mostra o que você compreendeu de verdade.",
      ],
      model: "My friend studies English at home every morning. → pessoa, ação, idioma, lugar, tempo.",
      practice: "Leia uma frase do capítulo, destaque mentalmente os cinco blocos e reescreva a ideia com uma mudança pessoal.",
    },
    {
      eyebrow: "Manual contínuo · Referência nativa",
      title: "A voz nativa guia a pronúncia; a escrita ajuda a registrar",
      paragraphs: [
        "Use a fala nativa para perceber o ritmo da frase, a parte que recebe força e a ligação entre palavras. Evite transformar a pronúncia em uma grafia inventada em português. A referência auditiva deve conduzir a repetição desde o começo.",
        "Quando uma palavra parecer difícil, reduza a velocidade sem alterar a ordem. Escute, repita a palavra dentro de uma frase e grave mentalmente o som junto com o sentido. A escrita vem depois como registro para a próxima recuperação.",
      ],
      model: "I would like water, please. → ouça a frase inteira, repita em partes e diga-a sem olhar.",
      practice: "Clique em ouvir uma palavra e uma frase. Repita três vezes e use a palavra em uma nova frase curta.",
    },
    {
      eyebrow: "Manual contínuo · Consulta útil",
      title: "Volte ao livro quando houver uma dúvida concreta",
      paragraphs: [
        "O Livro ABC não substitui a lição ou a cena. Ele funciona como uma consulta para resolver uma dúvida pontual: uma palavra, uma ordem de frase, uma pergunta, uma forma de pedir ajuda ou um contexto que precisa ser revisto.",
        "Encontre a folha relacionada, leia um único modelo, faça a prática proposta e retorne à atividade de origem. Essa ida e volta mantém a consulta breve e transforma a dúvida em aplicação real com o Professor ou na cena.",
      ],
      model: "Dúvida: how to ask for a place? → Livro: Where is the station? → Cena: pedir uma direção.",
      practice: "Escolha uma dúvida real, localize a folha mais próxima e leve uma frase pronta para usar na atividade de origem.",
    },
    {
      eyebrow: "Manual contínuo · Produção final",
      title: "Junte vocabulário, estrutura e intenção em uma pequena conversa",
      paragraphs: [
        "Ao concluir um bloco, produza algo seu: uma apresentação, um pedido, uma pergunta, uma descrição ou uma resposta. Comece com duas frases que você controla e adicione uma terceira somente depois de conferir a ordem e o sentido.",
        "A produção final não precisa ser longa. O mais importante é usar palavras recuperadas, uma estrutura conhecida e uma intenção clara. Depois, leve a mesma ideia para o Professor, para a cena ou para a revisão Pareto.",
      ],
      model: "Hello. My name is Ana. I study English at home. Can you help me with this word?",
      practice: "Escreva uma conversa de quatro linhas com saudação, informação pessoal, pergunta e resposta. Depois releia e escolha uma linha para falar.",
    },
  ],
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
      title: "Demonstrativos: this, that, these e those",
      explanation: "Use this e that para uma coisa; use these e those para mais de uma. This/these apontam para algo perto no contexto; that/those apontam para algo mais distante. A imagem ou o gesto ajuda, mas a palavra seguinte confirma se é singular ou plural.",
      languageFocus: "This is my book. / That is a tree. / These are my keys. / Those are her shoes.",
      examples: [
        { target: "This is my bicycle.", native: "Esta é minha bicicleta.", note: "uma coisa perto" },
        { target: "Those are trees.", native: "Aquelas são árvores.", note: "várias coisas distantes" },
        { target: "These books are new.", native: "Estes livros são novos.", note: "várias coisas perto" },
      ],
      writingPrompt: "Escolha um objeto perto e um objeto distante. Escreva uma frase com this ou these e outra com that ou those.",
      scrambled: ["This", "is", "my", "bicycle"],
      answer: "This is my bicycle.",
      paretoPrompt: "No Pareto, recupere this, that, these, those e bicycle; alterne singular, plural, perto e distante sem consultar.",
    },
    {
      section: "Palavras que constroem frases",
      title: "Possessivos antes do nome: de quem é?",
      explanation: "My, your, his, her, its, our e their vêm antes do nome para indicar posse ou relação. Eles não recebem apóstrofo e não ficam sozinhos: precisam acompanhar o nome que descrevem.",
      languageFocus: "my book, your car, his shoes, her watch, its food, our house e their school mostram quem se relaciona ao nome.",
      examples: [
        { target: "my name", native: "meu nome", note: "quem fala" },
        { target: "her book", native: "o livro dela", note: "uma mulher ou menina" },
        { target: "their school", native: "a escola deles ou delas", note: "grupo mencionado" },
      ],
      writingPrompt: "Escreva uma frase com my e outra com their. Diga primeiro de quem é a coisa e só depois escolha o possessivo.",
      scrambled: ["is", "My", "this", "book"],
      answer: "This is my book.",
      paretoPrompt: "No Pareto, recupere my, her, their, book e school; troque o dono sem tirar o nome da frase.",
    },
    {
      section: "Palavras que constroem frases",
      title: "Possessivos sem nome: mine, yours, hers e theirs",
      explanation: "Quando o nome já está claro, mine, yours, his, hers, ours e theirs podem ficar sozinhos. Eles substituem o conjunto possessivo + nome: my book vira mine; her watch vira hers.",
      languageFocus: "This book is mine. / Is this your car? It is yours. / That watch is hers.",
      examples: [
        { target: "This book is mine.", native: "Este livro é meu.", note: "mine substitui my book" },
        { target: "The car is yours.", native: "O carro é seu.", note: "yours substitui your car" },
        { target: "Those shoes are theirs.", native: "Aqueles sapatos são deles ou delas.", note: "theirs substitui their shoes" },
      ],
      writingPrompt: "Escreva duas respostas curtas: uma com mine e outra com yours. Não repita o nome quando ele já estiver claro.",
      scrambled: ["book", "This", "is", "mine"],
      answer: "This book is mine.",
      paretoPrompt: "No Pareto, recupere mine, yours, hers e theirs; responda de quem é cada objeto sem repetir o nome.",
    },
    {
      section: "Perguntas e respostas",
      title: "Whose, who, what e which: perguntar com objetivo",
      explanation: "Use whose para perguntar de quem algo é. Who pergunta por pessoa; what pergunta por informação ou coisa; which pede uma escolha entre opções. Cada palavra inicia uma pergunta diferente, por isso a resposta também muda.",
      languageFocus: "Whose coffee is that? / Who is she? / What is this? / Which book is yours?",
      examples: [
        { target: "Whose coffee is that?", native: "De quem é esse café?", note: "pergunta de posse" },
        { target: "Who is she?", native: "Quem é ela?", note: "pergunta por pessoa" },
        { target: "Which book is yours?", native: "Qual livro é seu?", note: "escolha entre livros" },
      ],
      writingPrompt: "Escreva uma pergunta com whose e responda usando mine, yours, his, hers ou theirs.",
      scrambled: ["Whose", "coffee", "is", "that"],
      answer: "Whose coffee is that?",
      paretoPrompt: "No Pareto, recupere whose, who, what, which e yours; faça uma pergunta de cada tipo e compare a resposta esperada.",
    },
    {
      section: "Prática contextual",
      title: "Objetos, donos e perguntas em uma cena",
      explanation: "Agora combine apontar, indicar o dono e perguntar. Observe o objeto, escolha this/that/these/those, diga de quem é e transforme a mesma ideia em uma pergunta. Essa sequência preserva a prática ilustrada do original, mas deixa a regra explícita.",
      languageFocus: "This is my bicycle. / That is my father’s armchair. / Whose coffee is that? / It is hers.",
      examples: [
        { target: "That is my father’s armchair.", native: "Aquela é a poltrona do meu pai.", note: "posse com nome + ’s" },
        { target: "Whose coffee is that? It is hers.", native: "De quem é esse café? É dela.", note: "pergunta e pronome possessivo" },
        { target: "These are our computers.", native: "Estes são nossos computadores.", note: "demonstrativo plural + possessivo" },
      ],
      writingPrompt: "Escolha três objetos de uma cena real ou imaginada. Escreva uma frase de apontar, uma de posse e uma pergunta com whose.",
      scrambled: ["coffee", "Whose", "is", "that"],
      answer: "Whose coffee is that?",
      paretoPrompt: "No Pareto, recupere this, those, my, hers, whose e father’s; descreva uma cena e faça uma pergunta de posse.",
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
      title: "Números de um a dez: contar e reconhecer",
      explanation: "Comece reconhecendo os números em situações curtas: quantidade, páginas, pessoas e objetos. Leia em ordem uma vez; depois mude a ordem para não depender apenas da sequência decorada.",
      languageFocus: "one, two, three, four, five, six, seven, eight, nine e ten aparecem em quantidades reais. A voz nativa é a referência para o ritmo de cada palavra.",
      examples: [
        { target: "one book", native: "um livro", note: "quantidade singular" },
        { target: "two friends", native: "dois amigos", note: "quantidade plural" },
        { target: "ten words", native: "dez palavras", note: "meta de estudo" },
      ],
      writingPrompt: "Escreva três quantidades reais que você vê hoje. Ouça cada número antes de ler em voz alta.",
      scrambled: ["have", "I", "two", "books"],
      answer: "I have two books.",
      paretoPrompt: "No Pareto, recupere one, two, five e ten; misture a ordem e crie duas frases de quantidade sem olhar.",
    },
    {
      section: "Números e quantidade",
      title: "Dezenas, centenas e milhares: formar um número",
      explanation: "Depois dos números básicos, forme grupos. Em inglês, números compostos como twenty-one usam hífen. Centenas e milhares são organizados em blocos; na fala americana comum, two hundred forty-six não precisa de and no meio.",
      languageFocus: "twenty-one, forty-six e two thousand five hundred forty-six mostram a composição por partes. Ouça cada bloco antes de tentar dizer o número inteiro.",
      examples: [
        { target: "twenty-one pages", native: "vinte e uma páginas", note: "dezena composta" },
        { target: "forty-six words", native: "quarenta e seis palavras", note: "grafia correta de forty" },
        { target: "two thousand five hundred forty-six", native: "dois mil quinhentos e quarenta e seis", note: "milhar em blocos" },
      ],
      writingPrompt: "Escreva um número de duas partes e um número acima de mil. Separe as partes antes de ouvir a forma inteira.",
      scrambled: ["forty", "six", "words", "I", "know"],
      answer: "I know forty-six words.",
      paretoPrompt: "No Pareto, recupere twenty, forty, hundred e thousand; monte um número diferente em cada tentativa.",
    },
    {
      section: "Números em uso real",
      title: "Preço, telefone, página e endereço",
      explanation: "O mesmo número muda de função conforme a situação. Em preço, você diz a moeda; em página, usa page; em telefone, costuma dizer grupos menores com calma. Primeiro identifique o contexto e depois fale os números.",
      languageFocus: "five dollars, page ten e my number is… dão ao número uma função clara. Use at somente para horário ou endereço específico, não para todo número.",
      examples: [
        { target: "It is five dollars.", native: "Custa cinco dólares.", note: "preço" },
        { target: "Open page ten.", native: "Abra na página dez.", note: "leitura" },
        { target: "My phone number is 555-204-7810.", native: "Meu número de telefone é 555-204-7810.", note: "fale em grupos e confirme pelo áudio" },
      ],
      writingPrompt: "Escreva um preço, uma página e um número fictício em grupos. Não use dados pessoais.",
      scrambled: ["page", "Open", "ten"],
      answer: "Open page ten.",
      paretoPrompt: "No Pareto, recupere five, ten, page, dollars e phone. Escolha um contexto e diga uma informação completa.",
    },
    {
      section: "Horas e rotina",
      title: "Hora cheia e meia hora",
      explanation: "Para uma hora cheia, use o’clock. Para trinta minutos depois da hora, half past é comum; em conversas, seven thirty também é natural. Acompanhe o relógio, ouça a frase e só depois leia a escrita.",
      languageFocus: "It is seven o’clock. / It is half past seven. / It is seven thirty. As três formas descrevem tempos diferentes ou equivalentes pelo contexto.",
      examples: [
        { target: "It is seven o’clock.", native: "São sete horas.", note: "hora cheia" },
        { target: "It is half past seven.", native: "São sete e meia.", note: "trinta minutos depois" },
        { target: "The class starts at seven thirty.", native: "A aula começa às sete e trinta.", note: "forma digital comum" },
      ],
      writingPrompt: "Escreva uma hora cheia e uma meia hora ligadas a uma atividade real ou imaginada.",
      scrambled: ["at", "The", "starts", "class", "seven", "thirty"],
      answer: "The class starts at seven thirty.",
      paretoPrompt: "No Pareto, recupere seven, o’clock, half past, class e starts; diga uma hora e uma rotina sem consultar.",
    },
    {
      section: "Horas e rotina",
      title: "Minutos passados e minutos para a próxima hora",
      explanation: "Past mostra minutos depois da hora; to mostra minutos que faltam para a próxima hora. Quarter significa quinze minutos. Em agendas digitais, também é natural dizer a hora e os minutos diretamente.",
      languageFocus: "quarter past seven = sete e quinze; twenty to eight = vinte para as oito; eight fifteen é uma forma digital clara.",
      examples: [
        { target: "It is quarter past seven.", native: "São sete e quinze.", note: "quinze minutos depois" },
        { target: "It is twenty to eight.", native: "Faltam vinte minutos para as oito.", note: "minutos antes da próxima hora" },
        { target: "The meeting is at eight fifteen.", native: "A reunião é às oito e quinze.", note: "agenda digital" },
      ],
      writingPrompt: "Escreva uma hora com past ou to e reescreva a mesma informação em formato digital.",
      scrambled: ["is", "It", "quarter", "past", "seven"],
      answer: "It is quarter past seven.",
      paretoPrompt: "No Pareto, recupere quarter, past, to, twenty e meeting; compare uma hora passada e uma hora que ainda falta.",
    },
    {
      section: "Calendário e compromisso",
      title: "Dia, mês e horário em um compromisso",
      explanation: "Depois de aprender a hora, adicione um dia ou mês. Use on com dias e datas; use in com meses. Uma agenda clara informa atividade, dia e horário sem transformar a frase em uma lista.",
      languageFocus: "The class is on Monday at eight. / My trip is in March. / The meeting is on March fifth at ten.",
      examples: [
        { target: "The class is on Monday at eight.", native: "A aula é na segunda-feira às oito.", note: "dia e hora" },
        { target: "My trip is in March.", native: "Minha viagem é em março.", note: "mês" },
        { target: "The meeting is on March fifth at ten.", native: "A reunião é em cinco de março às dez.", note: "data e hora" },
      ],
      writingPrompt: "Escreva um compromisso fictício com atividade, dia ou mês e horário. Use uma situação segura, sem dados pessoais.",
      scrambled: ["on", "The", "is", "class", "Monday", "at", "eight"],
      answer: "The class is on Monday at eight.",
      paretoPrompt: "No Pareto, recupere Monday, March, class, meeting e eight; marque um compromisso fictício completo.",
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
    ...SECOND_BLOCK_PROGRESSIVE_LESSONS,
    ...THIRD_BLOCK_PROGRESSIVE_LESSONS,
    ...FOURTH_BLOCK_PROGRESSIVE_LESSONS,
    ...FIFTH_BLOCK_PROGRESSIVE_LESSONS,
    ...SIXTH_BLOCK_PROGRESSIVE_LESSONS,
    ...SEVENTH_BLOCK_LITERACY_LABS,
    ...EIGHTH_BLOCK_QUANTIFIERS_AND_AUXILIARIES,
    ...NINTH_BLOCK_AUXILIARIES_AND_TENSES,
    ...TENTH_BLOCK_NEGATIONS_AND_SELF,
    ...ELEVENTH_BLOCK_ADVERBS_AND_TRAVEL,
    ...TWELFTH_BLOCK_PREPOSITIONS_PHRASALS_CONJUNCTIONS,
    ...THIRTEENTH_BLOCK_ADJECTIVES_AND_COLORS,
    ...FOURTEENTH_BLOCK_COMPARATIVES_SUPERLATIVES,
    ...FIFTEENTH_BLOCK_GREETINGS_CALENDAR,
    ...SIXTEENTH_BLOCK_PHRASALS_IDIOMS,
    ...SEVENTEENTH_BLOCK_BODY_FIELD_PLANET,
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
  languageBlocks: getLanguageBlocks("A1"),
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
    return {
      ...PORTUGUESE_ENGLISH_BOOK,
      alphabetLetters: PORTUGUESE_ENGLISH_BOOK.alphabetLetters.map(({ letter, name }) => ({
        letter,
        name,
        guide: "Ouça o nome desta letra em inglês nativo.",
      })),
      soundLessons: PORTUGUESE_ENGLISH_BOOK.soundLessons.map((lesson) => ({
        ...lesson,
        explanation: NATIVE_SOUND_LESSON_INTRO,
        nativeBridge: NATIVE_SOUND_REFERENCE[lesson.title] ?? "Ouça a palavra em inglês nativo, repita sem pressa e use a fala como referência principal.",
        paretoPrompt: SOUND_LESSON_PARETO_PROMPTS[lesson.title] ?? "No Pareto, recupere as palavras desta folha, ouça uma vez e use uma delas em uma frase curta.",
        examples: lesson.examples.map(({ target, native }) => ({
          target,
          pronunciation: "Ouça a fala nativa e repita.",
          native,
        })),
      })),
      termCard: {
        ...PORTUGUESE_ENGLISH_BOOK.termCard,
        pronunciation: "Ouça a palavra em inglês nativo e repita antes de ler o exemplo.",
      },
      additionalTermCards: PORTUGUESE_ENGLISH_BOOK.additionalTermCards.map((card) => ({
        ...card,
        pronunciation: "Ouça a palavra em inglês nativo e repita antes de usar o padrão.",
      })),
    };
  }

  return {
    available: false,
    edition: `${input.nativeLanguage} → ${input.targetLanguage}`,
    nativeLabel: input.nativeLanguage,
    targetLabel: input.targetLanguage,
    unavailableMessage: "A edição completa para esta dupla está sendo preparada com conteúdo próprio. Enquanto isso, continue pela Base de Estudos, pelo Pareto e pelas cenas com o seu par de idiomas ativo.",
  };
}
