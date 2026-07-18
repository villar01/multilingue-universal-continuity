/**
 * languageLogic.ts
 * Sistema de lógica linguística para todos os idiomas da plataforma.
 *
 * Estratégia:
 * - PT + EN: regras hardcodadas com máximo detalhe pedagógico
 * - Outros 67+ idiomas: gerados dinamicamente pela IA com base na família linguística
 * - Idiomas perdidos/raros (Latim, Sânscrito, Aramaico, etc.): suportados via IA
 * - Escalável para qualquer idioma futuro (70º, 80º, 100º+)
 */

export interface LanguageRule {
  code: string;
  name: string;
  family: string;
  script: string;
  direction: 'ltr' | 'rtl' | 'ttb';
  status: 'living' | 'extinct' | 'rare' | 'constructed';
  wordOrder: string;         // SVO, SOV, VSO, etc.
  adjectivePosition: string; // before/after noun
  hasGender: boolean;
  genderCount: number;       // 0, 2, 3, etc.
  hasCases: boolean;
  caseCount: number;
  hasTones: boolean;
  toneCount: number;
  hasArticles: boolean;
  articleType: string;       // definite/indefinite/none/both
  verbConjugation: string;   // rich/moderate/minimal/none
  keyRules: LanguageKeyRule[];
  contrastWithPortuguese: string[];
  memorySystems: string[];   // mnemonic strategies for this language
  phases: Record<string, PhaseLinguisticFocus>;
}

export interface LanguageKeyRule {
  name: string;
  explanation: string;       // in Portuguese
  pattern: string;
  example: { target: string; portuguese: string; phonetic: string };
  commonMistake: string;     // mistake Portuguese speakers make
}

export interface PhaseLinguisticFocus {
  structures: string[];
  avoidStructures: string[];
  teachingTip: string;
}

// ============================================================
// PORTUGUÊS BRASILEIRO — Regras completas
// ============================================================
const PORTUGUESE_BR: LanguageRule = {
  code: 'pt-BR',
  name: 'Português Brasileiro',
  family: 'Indo-Europeia > Romance > Ibérico',
  script: 'Latino',
  direction: 'ltr',
  status: 'living',
  wordOrder: 'SVO (Sujeito-Verbo-Objeto) com flexibilidade',
  adjectivePosition: 'Geralmente APÓS o substantivo (gato grande), mas pode vir antes para ênfase (grande gato)',
  hasGender: true,
  genderCount: 2,
  hasCases: false,
  caseCount: 0,
  hasTones: false,
  toneCount: 0,
  hasArticles: true,
  articleType: 'definite (o/a/os/as) + indefinite (um/uma/uns/umas)',
  verbConjugation: 'rich',
  keyRules: [
    {
      name: 'Gênero dos substantivos',
      explanation: 'Todo substantivo em português tem gênero: masculino ou feminino. O artigo concorda: o gato (masc.) / a gata (fem.)',
      pattern: '[artigo masc./fem.] + [substantivo masc./fem.]',
      example: { target: 'O menino e a menina', portuguese: 'O menino e a menina', phonetic: 'u mi-NI-nu i a mi-NI-na' },
      commonMistake: 'Esquecer de concordar o artigo com o gênero do substantivo'
    },
    {
      name: 'Adjetivo após o substantivo',
      explanation: 'Em português, o adjetivo geralmente vem DEPOIS do substantivo. Diferente do inglês onde vem antes.',
      pattern: '[Substantivo] + [Adjetivo]: carro vermelho (não: vermelho carro)',
      example: { target: 'Casa bonita', portuguese: 'Casa bonita', phonetic: 'KA-za bo-NI-ta' },
      commonMistake: 'Colocar o adjetivo antes do substantivo (influência do inglês)'
    },
    {
      name: 'Concordância verbal',
      explanation: 'O verbo concorda com o sujeito em pessoa e número: eu corro, você corre, nós corremos',
      pattern: '[Sujeito] + [Verbo conjugado]: Eu como, Ele come, Nós comemos',
      example: { target: 'Eles falam português', portuguese: 'Eles falam português', phonetic: 'E-leis FA-lão por-tu-GUEIS' },
      commonMistake: 'Usar a forma infinitiva em vez da conjugada'
    },
    {
      name: 'Contrações obrigatórias',
      explanation: 'Em português, preposição + artigo formam contrações obrigatórias: de + o = do, em + a = na',
      pattern: 'de + o = do | de + a = da | em + o = no | em + a = na | a + o = ao',
      example: { target: 'Vou ao mercado', portuguese: 'Vou ao mercado (a + o = ao)', phonetic: 'vô ao mer-KA-du' },
      commonMistake: 'Não contrair: "Vou a o mercado" (errado)'
    }
  ],
  contrastWithPortuguese: ['É a língua nativa — serve como base de comparação para todos os outros idiomas'],
  memorySystems: [
    'Associe o gênero com a terminação: palavras em -o geralmente são masculinas, em -a femininas',
    'Lembre: em português o adjetivo vem DEPOIS (casa bonita), em inglês vem ANTES (beautiful house)',
    'Contrações: pense em "do/da/no/na/ao" como palavras únicas, não como duas'
  ],
  phases: {
    infancia: {
      structures: ['Substantivos com artigo: o gato, a casa', 'Números: um, dois, três'],
      avoidStructures: ['Subjuntivo', 'Condicional', 'Voz passiva'],
      teachingTip: 'Use objetos concretos e visíveis. Ensine o artigo junto com o substantivo desde o início.'
    },
    crianca: {
      structures: ['Sujeito + Verbo + Objeto: Eu tenho um gato', 'Adjetivo após substantivo: gato preto'],
      avoidStructures: ['Tempos compostos', 'Subjuntivo'],
      teachingTip: 'Mostre sempre o adjetivo APÓS o substantivo para criar o padrão correto.'
    },
    adolescencia: {
      structures: ['Pretérito perfeito: eu fui, ele comeu', 'Futuro: vou fazer, vou comer', 'Conectores: porque, então, mas'],
      avoidStructures: ['Subjuntivo imperfeito', 'Futuro do pretérito complexo'],
      teachingTip: 'Use situações reais do cotidiano do adolescente: redes sociais, música, amigos.'
    },
    adulto: {
      structures: ['Subjuntivo: espero que você venha', 'Condicional: se eu tivesse dinheiro', 'Voz passiva: foi feito por'],
      avoidStructures: [],
      teachingTip: 'Foque em situações profissionais e formais. Contraste formal vs informal.'
    },
    fluente: {
      structures: ['Expressões idiomáticas: chutar o balde, dar um jeitinho', 'Gírias regionais', 'Nuances de registro'],
      avoidStructures: [],
      teachingTip: 'Exponha a variação regional: carioca, paulistano, nordestino, gaúcho.'
    }
  }
};

// ============================================================
// INGLÊS AMERICANO — Regras completas
// ============================================================
const ENGLISH_US: LanguageRule = {
  code: 'en-US',
  name: 'English (American)',
  family: 'Indo-Europeia > Germânica > Anglo-Frisian',
  script: 'Latino',
  direction: 'ltr',
  status: 'living',
  wordOrder: 'SVO estrito (Sujeito-Verbo-Objeto) — muito rígido, sem flexibilidade',
  adjectivePosition: 'SEMPRE ANTES do substantivo: big cat (nunca: cat big)',
  hasGender: false,
  genderCount: 0,
  hasCases: false,
  caseCount: 0,
  hasTones: false,
  toneCount: 0,
  hasArticles: true,
  articleType: 'definite (the) + indefinite (a/an)',
  verbConjugation: 'minimal',
  keyRules: [
    {
      name: 'Adjetivo ANTES do substantivo',
      explanation: 'Em inglês, o adjetivo SEMPRE vem antes do substantivo. O oposto do português! "big cat" não "cat big".',
      pattern: '[Adjetivo] + [Substantivo]: big cat, red house, cold water',
      example: { target: 'The big red dog', portuguese: 'O cachorro grande e vermelho', phonetic: 'di big red dog' },
      commonMistake: 'Colocar o adjetivo depois: "the dog big" (errado em inglês)'
    },
    {
      name: 'Caso genitivo com apostrofe-s',
      explanation: 'Para indicar posse, use apostrofe + s após o dono: "the cat\'s house" = a casa do gato',
      pattern: '[Dono]\'s + [Coisa]: John\'s car, my friend\'s house, the cat\'s tail',
      example: { target: "Sarah's book", portuguese: 'O livro da Sarah', phonetic: "SÊ-ras buk" },
      commonMistake: 'Usar "of" em vez de \'s: "the book of Sarah" (possível mas formal/incomum)'
    },
    {
      name: 'Sem gênero gramatical',
      explanation: 'Em inglês NÃO existe gênero para objetos. "the table" e "the chair" — ambos usam "the". Só pessoas/animais têm he/she.',
      pattern: 'the [qualquer substantivo] — sem masculino/feminino',
      example: { target: 'The table is big. The chair is small.', portuguese: 'A mesa é grande. A cadeira é pequena.', phonetic: 'di TÊI-bol iz big. di tchêr iz smol.' },
      commonMistake: 'Tentar usar "la/le" ou concordar gênero como no português'
    },
    {
      name: 'Phrasal verbs — verbos compostos',
      explanation: 'Inglês usa muito verbo + partícula com significado novo: wake UP (acordar), give UP (desistir), look FOR (procurar)',
      pattern: '[Verbo] + [Partícula]: wake up, give up, look for, turn on, break down',
      example: { target: 'I wake up at 7am', portuguese: 'Eu acordo às 7h', phonetic: 'ai uêik ap et sêvn êi-êm' },
      commonMistake: 'Traduzir literalmente: "wake up" não é "acordar para cima"'
    },
    {
      name: 'Ordem rígida SVO',
      explanation: 'Em inglês a ordem é FIXA: Sujeito + Verbo + Objeto. Não pode mudar como em português.',
      pattern: '[Sujeito] + [Verbo] + [Objeto]: I eat pizza (nunca: Pizza I eat)',
      example: { target: 'She loves coffee', portuguese: 'Ela ama café', phonetic: 'chi lavz KÓ-fi' },
      commonMistake: 'Inverter a ordem para dar ênfase (funciona em português, não em inglês)'
    },
    {
      name: 'Auxiliares para perguntas e negações',
      explanation: 'Em inglês, perguntas e negações usam auxiliares (do/does/did). Não se inverte o verbo principal.',
      pattern: 'Do you [verbo]? / Does she [verbo]? / I don\'t [verbo].',
      example: { target: 'Do you like pizza? / I don\'t like pizza.', portuguese: 'Você gosta de pizza? / Eu não gosto de pizza.', phonetic: 'du iu laik pí-za? / ai dont laik pí-za.' },
      commonMistake: 'Dizer "You like pizza?" sem o auxiliar "do" (soa como pergunta de confirmação, não genuína)'
    },
    {
      name: 'Ligações naturais de fala (connected speech)',
      explanation: 'Na fala natural, palavras se ligam: "going to" vira "gonna", "want to" vira "wanna", "got to" vira "gotta"',
      pattern: 'going to → gonna | want to → wanna | got to → gotta | kind of → kinda',
      example: { target: "I'm gonna eat pizza", portuguese: 'Vou comer pizza', phonetic: 'aim GÂ-na it PÍ-za' },
      commonMistake: 'Falar muito formalmente e soar robótico na conversa casual'
    }
  ],
  contrastWithPortuguese: [
    'PT: adjetivo DEPOIS (gato preto) | EN: adjetivo ANTES (black cat)',
    'PT: gênero em tudo (o carro, a mesa) | EN: sem gênero (the car, the table)',
    'PT: verbo concorda muito (eu como, ele come, nós comemos) | EN: quase sem conjugação (I eat, he eats)',
    'PT: ordem flexível (Pizza eu como) | EN: ordem rígida (I eat pizza)',
    'PT: posse com "de" (o carro do João) | EN: posse com \'s (João\'s car)',
    'PT: negação direta (não como) | EN: negação com auxiliar (I don\'t eat)',
  ],
  memorySystems: [
    'Adjetivo antes: pense "descreva primeiro, nomeie depois" — big (descrição) cat (nome)',
    'Genitivo: pense "dono + \'s + coisa" — John\'s (dono) car (coisa)',
    'Phrasal verbs: aprenda como expressões únicas, não traduza palavra por palavra',
    'Gonna/wanna: ouça músicas e filmes para internalizar a fala natural',
    'Sem gênero: liberdade! Não precisa memorizar se "table" é masculino ou feminino'
  ],
  phases: {
    infancia: {
      structures: [
        'Substantivos com artigo: a cat, the house',
        'Números: one, two, three',
        'Cores: red, blue, green (sem substantivo ainda)',
      ],
      avoidStructures: ['Phrasal verbs', 'Auxiliares', 'Genitivo'],
      teachingTip: 'Ensine "a/an" vs "the" desde o início. Mostre que não há gênero — isso é uma vantagem!'
    },
    crianca: {
      structures: [
        'Adjetivo + Substantivo: big cat, red house',
        'Sujeito + Verbo + Objeto: I have a cat',
        'Possessivos: my cat, your house, his book',
      ],
      avoidStructures: ['Phrasal verbs complexos', 'Tempos compostos'],
      teachingTip: 'Repita constantemente: adjetivo ANTES do substantivo. Use cartões com imagens.'
    },
    adolescencia: {
      structures: [
        'Genitivo: John\'s car, my friend\'s house',
        'Phrasal verbs básicos: wake up, go out, look for',
        'Compound nouns: traffic light, fire station',
        'Past simple: I went, she ate, they played',
      ],
      avoidStructures: ['Subjuntivo', 'Voz passiva complexa'],
      teachingTip: 'Phrasal verbs são essenciais — ensine os 20 mais comuns como expressões únicas.'
    },
    adulto: {
      structures: [
        'Conditionals: If I had money, I would travel',
        'Passive voice: The letter was written',
        'Collocations: make a decision, take a shower',
        'Formal vs informal: I would like vs I want',
      ],
      avoidStructures: [],
      teachingTip: 'Foque em collocations — combinações naturais que soam como nativo.'
    },
    fluente: {
      structures: [
        'Idioms: it\'s raining cats and dogs, break the ice',
        'Connected speech: gonna, wanna, gotta, kinda',
        'Inversion: Never have I seen...',
        'Regional: British vs American vs Australian',
      ],
      avoidStructures: [],
      teachingTip: 'Exponha a variação: "lift" (UK) vs "elevator" (US), "rubbish" vs "trash".'
    }
  }
};

// ============================================================
// ESPERANTO — Idioma Universal Construído
// ============================================================
const ESPERANTO: LanguageRule = {
  code: 'eo',
  name: 'Esperanto',
  family: 'Construído (base Indo-Europeia)',
  script: 'Latino (com 6 letras especiais: ĉ ĝ ĥ ĵ ŝ ŭ)',
  direction: 'ltr',
  status: 'constructed',
  wordOrder: 'SVO flexível — a ordem pode mudar para ênfase sem mudar o significado (graças às terminações)',
  adjectivePosition: 'ANTES do substantivo: granda kato (gato grande)',
  hasGender: false,
  genderCount: 0,
  hasCases: true,
  caseCount: 2,
  hasTones: false,
  toneCount: 0,
  hasArticles: true,
  articleType: 'only definite article: la (no indefinite — just omit)',
  verbConjugation: 'minimal and completely regular',
  keyRules: [
    {
      name: 'Terminações fixas por função gramatical',
      explanation: 'Em Esperanto, cada tipo de palavra tem uma terminação fixa: substantivos terminam em -o, adjetivos em -a, verbos em -i (infinitivo), advérbios em -e. Isso elimina exceções!',
      pattern: 'Substantivo: kato (gato) | Adjetivo: granda (grande) | Verbo: manĝi (comer) | Advérbio: rapide (rapidamente)',
      example: { target: 'La granda kato manĝas rapide', portuguese: 'O gato grande come rapidamente', phonetic: 'la GRAN-da KA-to man-DJAS RA-pi-de' },
      commonMistake: 'Esquecer de adicionar a terminação correta (-o, -a, -i, -e)'
    },
    {
      name: 'Plural com -j',
      explanation: 'Para fazer o plural, adicione -j ao substantivo E ao adjetivo: kato → katoj (gatos), granda → grandaj (grandes)',
      pattern: '[palavra] + j = plural: kato → katoj | granda → grandaj katoj',
      example: { target: 'Grandaj katoj', portuguese: 'Gatos grandes', phonetic: 'GRAN-dai KA-toi' },
      commonMistake: 'Esquecer de pluralizar o adjetivo também'
    },
    {
      name: 'Acusativo com -n (objeto direto)',
      explanation: 'O objeto direto recebe -n: Mi vidas katon (Eu vejo um gato). Isso permite mudar a ordem sem perder o significado!',
      pattern: 'Sujeito + Verbo + [Objeto + n]: Mi manĝas pomon (Eu como uma maçã)',
      example: { target: 'Mi amas vin', portuguese: 'Eu te amo', phonetic: 'mi A-mas vin' },
      commonMistake: 'Esquecer o -n no objeto direto'
    },
    {
      name: 'Verbos completamente regulares',
      explanation: 'Esperanto tem ZERO verbos irregulares. Presente: -as | Passado: -is | Futuro: -os | Condicional: -us | Imperativo: -u',
      pattern: 'manĝ- + as = manĝas (come) | manĝ- + is = manĝis (comeu) | manĝ- + os = manĝos (comerá)',
      example: { target: 'Mi manĝas, mi manĝis, mi manĝos', portuguese: 'Eu como, eu comi, eu comerei', phonetic: 'mi man-DJAS, mi man-DJIS, mi man-DJOS' },
      commonMistake: 'Tentar conjugar como em português — não precisa! É sempre a raiz + terminação de tempo'
    },
    {
      name: 'Prefixos e sufixos para criar palavras novas',
      explanation: 'Esperanto usa um sistema de blocos para criar palavras: mal- = oposto, -ejo = lugar, -isto = profissional, re- = de novo',
      pattern: 'bona (bom) → malbona (mau) | lerni (aprender) → lernejo (escola) | kuiri (cozinhar) → kuiristo (cozinheiro)',
      example: { target: 'La lernejo estas granda', portuguese: 'A escola é grande', phonetic: 'la ler-NÊ-io ES-tas GRAN-da' },
      commonMistake: 'Memorizar palavras separadas quando podem ser construídas com prefixos/sufixos'
    },
    {
      name: 'Sem gênero gramatical',
      explanation: 'Como o inglês, Esperanto não tem gênero para objetos. "La tablo" (a mesa) — sem masculino/feminino. Para pessoas: -in- indica feminino: patro (pai) → patrino (mãe)',
      pattern: 'la [qualquer substantivo] — sem gênero | patro (pai) → patrino (mãe) com sufixo -in-',
      example: { target: 'La patrino kaj la patro', portuguese: 'A mãe e o pai', phonetic: 'la pa-TRI-no kai la PA-tro' },
      commonMistake: 'Tentar atribuir gênero a objetos como no português'
    }
  ],
  contrastWithPortuguese: [
    'PT: gênero em tudo (o carro, a mesa) | EO: sem gênero (la aŭto, la tablo)',
    'PT: verbos irregulares (fui, fiz, vim) | EO: ZERO irregulares (iris, faris, venis — sempre a raiz + terminação)',
    'PT: adjetivo DEPOIS (gato preto) | EO: adjetivo ANTES (nigra kato)',
    'PT: plural só no substantivo (gatos grandes) | EO: plural em tudo (grandaj katoj)',
    'PT: muitas exceções | EO: ZERO exceções — 100% regular',
    'PT: 16 regras de ortografia | EO: 1 regra — cada letra tem sempre o mesmo som',
  ],
  memorySystems: [
    'Terminações: pense em -o=coisa, -a=qualidade, -i=ação, -e=modo',
    'Plural: sempre adicione -j em tudo que precisa concordar',
    'Verbos: raiz + -as (agora) / -is (antes) / -os (depois) — nunca muda!',
    'Mal- = oposto de tudo: bona→malbona, granda→malgranda, rapida→malrapida',
    'Esperanto é a língua mais fácil do mundo — aprende-se em 1/10 do tempo do inglês'
  ],
  phases: {
    infancia: {
      structures: ['Substantivos: kato, domo, akvo', 'Artigo: la kato', 'Números: unu, du, tri'],
      avoidStructures: ['Acusativo -n', 'Prefixos complexos'],
      teachingTip: 'Mostre que cada letra tem sempre o mesmo som — isso é uma vantagem enorme! K sempre soa como K.'
    },
    crianca: {
      structures: ['Adjetivo + Substantivo: granda kato', 'Sujeito + Verbo + Objeto: Mi havas katon', 'Plural: katoj, grandaj'],
      avoidStructures: ['Acusativo complexo', 'Verbos compostos'],
      teachingTip: 'Ensine o sistema de terminações como um jogo: -o=coisa, -a=qualidade. Deixe o aluno criar palavras novas!'
    },
    adolescencia: {
      structures: ['Acusativo -n: Mi vidas katon', 'Prefixos: mal-, re-, mis-', 'Sufixos: -ejo, -isto, -ino', 'Tempos: -as/-is/-os'],
      avoidStructures: ['Estruturas muito complexas'],
      teachingTip: 'Mostre como criar palavras novas com prefixos/sufixos — o aluno pode inventar vocabulário!'
    },
    adulto: {
      structures: ['Condicional: -us', 'Particípios: -anta/-inta/-onta', 'Correlatives: kio, tio, ĉio, nenio', 'Preposições: por, pri, per, pro'],
      avoidStructures: [],
      teachingTip: 'Esperanto tem uma tabela de correlativos (45 palavras) que cobre toda a gramática de pronomes/advérbios.'
    },
    fluente: {
      structures: ['Estilo literário', 'Poesia e música em Esperanto', 'Dialetos e variações', 'Comunidade global (Esperantistoj)'],
      avoidStructures: [],
      teachingTip: 'Conecte o aluno à comunidade global de Esperantistas — há eventos, livros, músicas e filmes.'
    }
  }
};

// ============================================================
// MAPEAMENTO DE FAMÍLIAS LINGUÍSTICAS
// Para idiomas sem regras hardcodadas, a IA usa a família
// como base para gerar as regras dinamicamente
// ============================================================
export const LANGUAGE_FAMILIES: Record<string, {
  description: string;
  typicalWordOrder: string;
  typicalAdjectivePosition: string;
  typicalFeatures: string[];
  examples: string[];
}> = {
  'Romance': {
    description: 'Derivadas do Latim. Similar ao Português.',
    typicalWordOrder: 'SVO',
    typicalAdjectivePosition: 'after noun (like Portuguese)',
    typicalFeatures: ['grammatical gender (2)', 'verb conjugation', 'definite/indefinite articles', 'no cases'],
    examples: ['Espanhol', 'Francês', 'Italiano', 'Romeno', 'Catalão', 'Galego']
  },
  'Germanic': {
    description: 'Germânicas. Inglês, Alemão, Holandês.',
    typicalWordOrder: 'SVO (V2 in German)',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['strong/weak verbs', 'compound nouns', 'cases in German'],
    examples: ['Inglês', 'Alemão', 'Holandês', 'Sueco', 'Norueguês', 'Dinamarquês']
  },
  'Slavic': {
    description: 'Eslavas. Rico sistema de casos.',
    typicalWordOrder: 'flexible (SOV/SVO)',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['6-7 grammatical cases', 'no articles', 'aspect (perfective/imperfective)', 'grammatical gender (3)'],
    examples: ['Russo', 'Polonês', 'Tcheco', 'Ucraniano', 'Sérvio', 'Croata']
  },
  'Semitic': {
    description: 'Semíticas. Raízes trilíteras, escrita RTL.',
    typicalWordOrder: 'VSO or SVO',
    typicalAdjectivePosition: 'after noun',
    typicalFeatures: ['root-and-pattern morphology', 'RTL script', 'grammatical gender (2)', 'dual number'],
    examples: ['Árabe', 'Hebraico', 'Aramaico', 'Amárico']
  },
  'Sino-Tibetan': {
    description: 'Sino-Tibetanas. Tons, sem conjugação.',
    typicalWordOrder: 'SVO',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['tonal language (4-9 tones)', 'no conjugation', 'no articles', 'no plural markers', 'classifiers'],
    examples: ['Mandarim', 'Cantonês', 'Tibetano', 'Birmânico']
  },
  'Japonic': {
    description: 'Japonesas. Verbo no final, partículas.',
    typicalWordOrder: 'SOV (verb at end)',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['particles (は が を に)', 'verb at end', 'honorifics (keigo)', '3 writing systems', 'no plural'],
    examples: ['Japonês', 'Ryukyuan']
  },
  'Koreanic': {
    description: 'Coreanas. Similar ao Japonês em estrutura.',
    typicalWordOrder: 'SOV (verb at end)',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['particles', 'verb at end', 'honorifics', 'Hangul alphabet', 'no plural'],
    examples: ['Coreano']
  },
  'Dravidian': {
    description: 'Dravídicas. Sul da Índia.',
    typicalWordOrder: 'SOV',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['agglutinative', 'verb at end', 'no articles', 'retroflex consonants'],
    examples: ['Tamil', 'Telugu', 'Kannada', 'Malayalam']
  },
  'Indo-Iranian': {
    description: 'Indo-Iranianas. Hindi, Persa.',
    typicalWordOrder: 'SOV',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['grammatical gender', 'postpositions', 'verb at end', 'honorifics'],
    examples: ['Hindi', 'Urdu', 'Persa/Farsi', 'Bengali', 'Punjabi']
  },
  'Turkic': {
    description: 'Turcas. Aglutinadoras, sem gênero.',
    typicalWordOrder: 'SOV',
    typicalAdjectivePosition: 'before noun',
    typicalFeatures: ['agglutinative', 'vowel harmony', 'no grammatical gender', 'postpositions', 'verb at end'],
    examples: ['Turco', 'Azerbaijano', 'Uzbeque', 'Cazaque']
  },
  'Classical': {
    description: 'Idiomas clássicos/extintos. Fins acadêmicos e históricos.',
    typicalWordOrder: 'flexible (SOV preferred)',
    typicalAdjectivePosition: 'flexible',
    typicalFeatures: ['rich case system', 'no living native speakers', 'historical texts', 'academic use'],
    examples: ['Latim', 'Grego Antigo', 'Sânscrito', 'Aramaico', 'Sumério', 'Egípcio Antigo']
  },
  'Constructed': {
    description: 'Idiomas construídos artificialmente.',
    typicalWordOrder: 'SVO',
    typicalAdjectivePosition: 'after noun (Esperanto)',
    typicalFeatures: ['regular grammar', 'no exceptions', 'designed for easy learning'],
    examples: ['Esperanto', 'Interlingua', 'Ido']
  }
};

// ============================================================
// MAPEAMENTO IDIOMA → FAMÍLIA
// ============================================================
export const LANGUAGE_TO_FAMILY: Record<string, string> = {
  // Romance
  'es': 'Romance', 'fr': 'Romance', 'it': 'Romance', 'ro': 'Romance',
  'ca': 'Romance', 'gl': 'Romance', 'oc': 'Romance',
  // Germanic
  'de': 'Germanic', 'nl': 'Germanic', 'sv': 'Germanic', 'no': 'Germanic',
  'da': 'Germanic', 'af': 'Germanic', 'yi': 'Germanic',
  // Slavic
  'ru': 'Slavic', 'pl': 'Slavic', 'cs': 'Slavic', 'uk': 'Slavic',
  'sr': 'Slavic', 'hr': 'Slavic', 'sk': 'Slavic', 'bg': 'Slavic',
  // Semitic
  'ar': 'Semitic', 'he': 'Semitic', 'am': 'Semitic',
  // Sino-Tibetan
  'zh': 'Sino-Tibetan', 'yue': 'Sino-Tibetan', 'bo': 'Sino-Tibetan',
  // Japonic
  'ja': 'Japonic',
  // Koreanic
  'ko': 'Koreanic',
  // Dravidian
  'ta': 'Dravidian', 'te': 'Dravidian', 'kn': 'Dravidian', 'ml': 'Dravidian',
  // Indo-Iranian
  'hi': 'Indo-Iranian', 'ur': 'Indo-Iranian', 'fa': 'Indo-Iranian',
  'bn': 'Indo-Iranian', 'pa': 'Indo-Iranian',
  // Turkic
  'tr': 'Turkic', 'az': 'Turkic', 'uz': 'Turkic', 'kk': 'Turkic',
  // Classical/Extinct
  'la': 'Classical', 'grc': 'Classical', 'sa': 'Classical',
  'arc': 'Classical', 'sux': 'Classical', 'egy': 'Classical',
  // Constructed
  'eo': 'Constructed',
};

// ============================================================
// REGRAS HARDCODADAS (PT + EN)
// ============================================================
const HARDCODED_RULES: Record<string, LanguageRule> = {
  'pt': PORTUGUESE_BR,
  'pt-BR': PORTUGUESE_BR,
  'en': ENGLISH_US,
  'en-US': ENGLISH_US,
  'en-GB': { ...ENGLISH_US, code: 'en-GB', name: 'English (British)' },
  'eo': ESPERANTO,
};

// ============================================================
// FUNÇÃO PRINCIPAL — Obtém regras do idioma
// ============================================================
export function getLanguageRule(langCode: string): LanguageRule | null {
  const code = langCode.split('-')[0].toLowerCase();
  return HARDCODED_RULES[langCode] || HARDCODED_RULES[code] || null;
}

// ============================================================
// PROMPT PARA IA GERAR REGRAS DINAMICAMENTE
// Para idiomas sem regras hardcodadas
// ============================================================
export function buildLanguageLogicPrompt(
  targetLangCode: string,
  targetLangName: string,
  nativeLang: string = 'Portuguese (Brazilian)',
  phase: string = 'infancia'
): string {
  const code = targetLangCode.split('-')[0].toLowerCase();
  const family = LANGUAGE_TO_FAMILY[code] || 'Unknown';
  const familyInfo = LANGUAGE_FAMILIES[family];

  const hardcoded = getLanguageRule(targetLangCode);
  if (hardcoded) {
    // Return structured rules for hardcoded languages
    return buildHardcodedLanguagePrompt(hardcoded, nativeLang, phase);
  }

  // Dynamic generation for other languages
  return `You are an expert linguist and language teacher. Generate the key linguistic rules for teaching ${targetLangName} to a ${nativeLang} speaker.

LANGUAGE FAMILY: ${family}
${familyInfo ? `FAMILY CHARACTERISTICS: ${familyInfo.description}
TYPICAL WORD ORDER: ${familyInfo.typicalWordOrder}
TYPICAL ADJECTIVE POSITION: ${familyInfo.typicalAdjectivePosition}
TYPICAL FEATURES: ${familyInfo.typicalFeatures.join(', ')}` : ''}

TEACHING PHASE: ${phase}

Generate a JSON object with these EXACT fields:
{
  "wordOrder": "describe the word order (SVO/SOV/VSO) with example",
  "adjectivePosition": "before or after noun, with example",
  "hasGender": true/false,
  "genderExplanation": "explain gender system if exists, in ${nativeLang}",
  "hasTones": true/false,
  "toneExplanation": "explain tone system if exists, in ${nativeLang}",
  "hasCases": true/false,
  "caseExplanation": "explain case system if exists, in ${nativeLang}",
  "scriptNote": "explain the writing system if non-Latin, in ${nativeLang}",
  "keyRules": [
    {
      "name": "rule name in ${nativeLang}",
      "explanation": "clear explanation in ${nativeLang} — why and how this works",
      "pattern": "visual pattern showing the structure",
      "example": {
        "target": "example in ${targetLangName}",
        "portuguese": "translation in ${nativeLang}",
        "phonetic": "how it sounds written in ${nativeLang} letters (NOT IPA)"
      },
      "commonMistake": "mistake ${nativeLang} speakers make"
    }
  ],
  "contrastWithPortuguese": ["key difference 1", "key difference 2", "key difference 3"],
  "memorySystems": ["mnemonic tip 1", "mnemonic tip 2"],
  "phaseAdvice": "specific teaching advice for ${phase} phase in ${nativeLang}"
}

CRITICAL: 
- Explain in ${nativeLang} (not English)
- Focus on what's DIFFERENT from Portuguese
- Phonetics must use ${nativeLang} letters, NOT IPA symbols
- Make it practical and memorable`;
}

// ============================================================
// PROMPT PARA IDIOMAS HARDCODADOS
// ============================================================
function buildHardcodedLanguagePrompt(
  rule: LanguageRule,
  nativeLang: string,
  phase: string
): string {
  const phaseData = rule.phases[phase] || rule.phases['infancia'];
  const keyRulesText = rule.keyRules
    .map((r, i) => `${i + 1}. ${r.name}: ${r.explanation}\n   Padrão: ${r.pattern}\n   Exemplo: "${r.example.target}" = "${r.example.portuguese}" (soa como: "${r.example.phonetic}")\n   Erro comum: ${r.commonMistake}`)
    .join('\n\n');

  return `LANGUAGE LOGIC FOR ${rule.name.toUpperCase()}:

FAMILY: ${rule.family}
WORD ORDER: ${rule.wordOrder}
ADJECTIVE POSITION: ${rule.adjectivePosition}
GENDER: ${rule.hasGender ? `Yes — ${rule.genderCount} genders` : 'No grammatical gender'}
CASES: ${rule.hasCases ? `Yes — ${rule.caseCount} cases` : 'No cases'}
TONES: ${rule.hasTones ? `Yes — ${rule.toneCount} tones` : 'No tones'}
ARTICLES: ${rule.hasArticles ? rule.articleType : 'No articles'}
VERB CONJUGATION: ${rule.verbConjugation}

KEY GRAMMAR RULES:
${keyRulesText}

CONTRAST WITH PORTUGUESE:
${rule.contrastWithPortuguese.map((c, i) => `${i + 1}. ${c}`).join('\n')}

MEMORY SYSTEMS:
${rule.memorySystems.map((m, i) => `${i + 1}. ${m}`).join('\n')}

PHASE ${phase.toUpperCase()} — WHAT TO TEACH:
Structures: ${phaseData.structures.join(', ')}
Avoid: ${phaseData.avoidStructures.join(', ') || 'nothing'}
Teaching tip: ${phaseData.teachingTip}`;
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================
export { PORTUGUESE_BR, ENGLISH_US, ESPERANTO };
