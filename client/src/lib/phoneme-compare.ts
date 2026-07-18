/**
 * phoneme-compare.ts
 * Mapeamento comparativo de fonemas entre idiomas.
 * Foco principal: pt-BR (nativo) → en-US / en-GB (alvo)
 * Para cada fonema do idioma alvo: existe no nativo? Como produzir?
 * Guia de articulação: posição de língua, lábios, dentes, fluxo de ar.
 */

export type PhonemeCategory =
  | 'vowel_short'
  | 'vowel_long'
  | 'diphthong'
  | 'consonant_fricative'
  | 'consonant_plosive'
  | 'consonant_nasal'
  | 'consonant_liquid'
  | 'consonant_approximant'
  | 'consonant_affricate';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very_hard';

export interface ArticulationGuide {
  /** Posição da língua */
  tongue: string;
  /** Posição dos lábios */
  lips: string;
  /** Posição dos dentes */
  teeth: string;
  /** Fluxo de ar */
  airflow: string;
  /** Vibração das cordas vocais */
  voicing: 'voiced' | 'voiceless';
  /** Dica prática em português */
  tip: string;
}

export interface PhonemeEntry {
  /** Símbolo IPA do fonema no idioma alvo */
  ipa: string;
  /** Nome descritivo do fonema */
  name: string;
  /** Categoria do fonema */
  category: PhonemeCategory;
  /** Nível de dificuldade para falantes de pt-BR */
  difficulty: DifficultyLevel;
  /** Existe em pt-BR? */
  existsInNative: boolean;
  /** Fonema equivalente mais próximo em pt-BR (se existir) */
  nativeEquivalent?: string;
  /** Descrição da diferença em relação ao pt-BR */
  differenceFromNative: string;
  /** Guia de articulação */
  articulation: ArticulationGuide;
  /** Exemplos de palavras em inglês com o fonema */
  examplesTarget: Array<{ word: string; ipa: string; translation: string }>;
  /** Exemplos de palavras em pt-BR com som similar (se houver) */
  examplesNative?: Array<{ word: string; note: string }>;
  /** Diferença entre en-US e en-GB para este fonema (se houver) */
  usVsBritish?: string;
  /** Erros comuns de falantes de pt-BR */
  commonMistakes: string[];
  /** Exercício de prática */
  practicePhrase: string;
}

export interface PhonemeCompareData {
  nativeLang: string;
  targetLang: string;
  phonemes: PhonemeEntry[];
}

// ============================================================
// MAPEAMENTO PRINCIPAL: pt-BR → en-US / en-GB
// ============================================================

export const ptBR_to_enUS: PhonemeCompareData = {
  nativeLang: 'pt-BR',
  targetLang: 'en-US',
  phonemes: [

    // ─── VOGAIS CURTAS ───────────────────────────────────────

    {
      ipa: '/ɪ/',
      name: 'I curto (bit)',
      category: 'vowel_short',
      difficulty: 'hard',
      existsInNative: false,
      nativeEquivalent: '/i/',
      differenceFromNative: 'Em pt-BR usamos /i/ longo e tenso. O /ɪ/ inglês é mais curto, relaxado e centralizado — a língua não sobe tanto.',
      articulation: {
        tongue: 'Língua levantada, mas menos que no /i/ do português. Posição intermediária entre /i/ e /e/.',
        lips: 'Lábios levemente esticados, sem tensão.',
        teeth: 'Dentes ligeiramente separados.',
        airflow: 'Fluxo de ar suave e contínuo.',
        voicing: 'voiced',
        tip: 'Diga "i" em português e RELAXE a língua — não force. O som fica mais "frouxo" e curto.',
      },
      examplesTarget: [
        { word: 'bit', ipa: '/bɪt/', translation: 'pedaço' },
        { word: 'sit', ipa: '/sɪt/', translation: 'sentar' },
        { word: 'ship', ipa: '/ʃɪp/', translation: 'navio' },
        { word: 'fish', ipa: '/fɪʃ/', translation: 'peixe' },
        { word: 'big', ipa: '/bɪɡ/', translation: 'grande' },
      ],
      examplesNative: [
        { word: 'abrir', note: 'O "i" de "abrir" dito rapidamente se aproxima do /ɪ/' },
      ],
      usVsBritish: 'Praticamente igual em en-US e en-GB.',
      commonMistakes: [
        'Trocar /ɪ/ por /i/ longo: "sheep" em vez de "ship"',
        'Tensionar demais a língua',
      ],
      practicePhrase: 'The big ship is in the river.',
    },

    {
      ipa: '/ʊ/',
      name: 'U curto (book)',
      category: 'vowel_short',
      difficulty: 'hard',
      existsInNative: false,
      nativeEquivalent: '/u/',
      differenceFromNative: 'O /ʊ/ é mais curto e relaxado que o /u/ do português. Lábios menos arredondados.',
      articulation: {
        tongue: 'Língua levantada e recuada, mas sem tensão.',
        lips: 'Levemente arredondados, mas sem forçar.',
        teeth: 'Dentes separados.',
        airflow: 'Fluxo curto e suave.',
        voicing: 'voiced',
        tip: 'Diga "u" em português e imediatamente relaxe — não prolongue. É quase um "u" preguiçoso.',
      },
      examplesTarget: [
        { word: 'book', ipa: '/bʊk/', translation: 'livro' },
        { word: 'good', ipa: '/ɡʊd/', translation: 'bom' },
        { word: 'foot', ipa: '/fʊt/', translation: 'pé' },
        { word: 'cook', ipa: '/kʊk/', translation: 'cozinhar' },
        { word: 'look', ipa: '/lʊk/', translation: 'olhar' },
      ],
      commonMistakes: [
        'Usar /u/ longo: "fool" em vez de "full"',
        'Arredondar demais os lábios',
      ],
      practicePhrase: 'Look at the good book on the foot of the bed.',
    },

    {
      ipa: '/æ/',
      name: 'A aberto (cat)',
      category: 'vowel_short',
      difficulty: 'very_hard',
      existsInNative: false,
      differenceFromNative: 'Este som NÃO existe em pt-BR. É mais aberto que o /a/ português, com a boca bem aberta e a língua baixa e avançada.',
      articulation: {
        tongue: 'Língua bem baixa e empurrada para frente, quase tocando os dentes inferiores.',
        lips: 'Boca bem aberta, lábios levemente esticados para os lados.',
        teeth: 'Dentes bem separados.',
        airflow: 'Fluxo de ar forte e aberto.',
        voicing: 'voiced',
        tip: 'Abra a boca como se fosse dizer "a" e empurre a língua para frente. Parece um "a" exagerado com sorriso.',
      },
      examplesTarget: [
        { word: 'cat', ipa: '/kæt/', translation: 'gato' },
        { word: 'bad', ipa: '/bæd/', translation: 'ruim' },
        { word: 'man', ipa: '/mæn/', translation: 'homem' },
        { word: 'hand', ipa: '/hænd/', translation: 'mão' },
        { word: 'apple', ipa: '/ˈæpəl/', translation: 'maçã' },
      ],
      usVsBritish: 'DIFERENÇA IMPORTANTE: en-GB usa /a:/ (mais longo e posterior) em palavras como "bath", "path", "can\'t" — o chamado "trap-bath split". En-US usa /æ/ em todas essas palavras.',
      commonMistakes: [
        'Usar /a/ do português: soa como sotaque forte',
        'Não abrir suficientemente a boca',
        'Não avançar a língua',
      ],
      practicePhrase: 'The black cat sat on the flat mat.',
    },

    {
      ipa: '/ʌ/',
      name: 'A central (cup)',
      category: 'vowel_short',
      difficulty: 'very_hard',
      existsInNative: false,
      differenceFromNative: 'NÃO existe em pt-BR. É uma vogal central, nem /a/ nem /ə/. Boca meio aberta, língua no centro.',
      articulation: {
        tongue: 'Língua no centro da boca, posição neutra, levemente baixa.',
        lips: 'Boca meio aberta, lábios relaxados sem arredondamento.',
        teeth: 'Dentes moderadamente separados.',
        airflow: 'Fluxo curto e neutro.',
        voicing: 'voiced',
        tip: 'Imagine dizer "a" mas com a boca menos aberta e a língua no meio. É o som de surpresa: "uh!"',
      },
      examplesTarget: [
        { word: 'cup', ipa: '/kʌp/', translation: 'xícara' },
        { word: 'bus', ipa: '/bʌs/', translation: 'ônibus' },
        { word: 'love', ipa: '/lʌv/', translation: 'amor' },
        { word: 'sun', ipa: '/sʌn/', translation: 'sol' },
        { word: 'money', ipa: '/ˈmʌni/', translation: 'dinheiro' },
      ],
      usVsBritish: 'Praticamente igual em ambos os dialetos.',
      commonMistakes: [
        'Usar /a/ do português (muito aberto)',
        'Confundir com /ə/ (schwa) — /ʌ/ é mais forte e tônico',
      ],
      practicePhrase: 'The sun above us shines with love.',
    },

    {
      ipa: '/e/',
      name: 'E curto (bed)',
      category: 'vowel_short',
      difficulty: 'medium',
      existsInNative: true,
      nativeEquivalent: '/ɛ/',
      differenceFromNative: 'Muito similar ao /ɛ/ aberto do português (como em "pé", "mel"). Praticamente o mesmo som.',
      articulation: {
        tongue: 'Língua na posição média, levemente baixa.',
        lips: 'Lábios levemente esticados.',
        teeth: 'Dentes moderadamente separados.',
        airflow: 'Fluxo suave.',
        voicing: 'voiced',
        tip: 'É igual ao "é" aberto do português. Diga "pé" e use esse som.',
      },
      examplesTarget: [
        { word: 'bed', ipa: '/bed/', translation: 'cama' },
        { word: 'red', ipa: '/red/', translation: 'vermelho' },
        { word: 'ten', ipa: '/ten/', translation: 'dez' },
        { word: 'yes', ipa: '/jes/', translation: 'sim' },
      ],
      examplesNative: [
        { word: 'pé', note: 'O "é" de "pé" é praticamente idêntico' },
        { word: 'mel', note: 'O "e" de "mel" é muito próximo' },
      ],
      commonMistakes: [
        'Usar /i/ em vez de /e/: "bid" em vez de "bed"',
      ],
      practicePhrase: 'Get ready for bed at ten.',
    },

    {
      ipa: '/ə/',
      name: 'Schwa (about)',
      category: 'vowel_short',
      difficulty: 'medium',
      existsInNative: false,
      differenceFromNative: 'O schwa é a vogal mais comum do inglês. É um som neutro, reduzido, sem tensão. Em pt-BR tendemos a pronunciar todas as vogais claramente.',
      articulation: {
        tongue: 'Língua completamente relaxada no centro da boca.',
        lips: 'Lábios relaxados, boca levemente aberta.',
        teeth: 'Dentes levemente separados.',
        airflow: 'Fluxo mínimo, quase sem esforço.',
        voicing: 'voiced',
        tip: 'É o som que fazemos quando hesitamos: "ã..." em português. Completamente relaxado.',
      },
      examplesTarget: [
        { word: 'about', ipa: '/əˈbaʊt/', translation: 'sobre' },
        { word: 'the', ipa: '/ðə/', translation: 'o/a' },
        { word: 'sofa', ipa: '/ˈsoʊfə/', translation: 'sofá' },
        { word: 'banana', ipa: '/bəˈnænə/', translation: 'banana' },
        { word: 'ago', ipa: '/əˈɡoʊ/', translation: 'atrás' },
      ],
      commonMistakes: [
        'Pronunciar a vogal claramente em sílabas átonas',
        'Dizer "about" como /a-baut/ em vez de /ə-baut/',
      ],
      practicePhrase: 'About a banana ago, the sofa was here.',
    },

    // ─── VOGAIS LONGAS ───────────────────────────────────────

    {
      ipa: '/iː/',
      name: 'I longo (see)',
      category: 'vowel_long',
      difficulty: 'easy',
      existsInNative: true,
      nativeEquivalent: '/i/',
      differenceFromNative: 'Muito similar ao /i/ do português, mas mais longo e tenso. Fácil para falantes de pt-BR.',
      articulation: {
        tongue: 'Língua bem alta e avançada.',
        lips: 'Lábios esticados como num sorriso.',
        teeth: 'Dentes quase fechados.',
        airflow: 'Fluxo contínuo e tenso.',
        voicing: 'voiced',
        tip: 'É o "i" do português, mas prolongado. Diga "si" e estique o som.',
      },
      examplesTarget: [
        { word: 'see', ipa: '/siː/', translation: 'ver' },
        { word: 'tree', ipa: '/triː/', translation: 'árvore' },
        { word: 'green', ipa: '/ɡriːn/', translation: 'verde' },
        { word: 'feet', ipa: '/fiːt/', translation: 'pés' },
      ],
      examplesNative: [
        { word: 'vi', note: 'O "i" de "vi" é muito próximo' },
      ],
      commonMistakes: [
        'Não prolongar suficientemente: confundir com /ɪ/',
      ],
      practicePhrase: 'I can see the green tree.',
    },

    {
      ipa: '/uː/',
      name: 'U longo (food)',
      category: 'vowel_long',
      difficulty: 'easy',
      existsInNative: true,
      nativeEquivalent: '/u/',
      differenceFromNative: 'Similar ao /u/ do português, mas mais longo. Fácil para falantes de pt-BR.',
      articulation: {
        tongue: 'Língua alta e recuada.',
        lips: 'Lábios bem arredondados e projetados.',
        teeth: 'Dentes separados.',
        airflow: 'Fluxo contínuo.',
        voicing: 'voiced',
        tip: 'É o "u" do português prolongado. Diga "tu" e estique o som.',
      },
      examplesTarget: [
        { word: 'food', ipa: '/fuːd/', translation: 'comida' },
        { word: 'moon', ipa: '/muːn/', translation: 'lua' },
        { word: 'blue', ipa: '/bluː/', translation: 'azul' },
        { word: 'school', ipa: '/skuːl/', translation: 'escola' },
      ],
      commonMistakes: [
        'Confundir com /ʊ/ (book) — este é mais longo e tenso',
      ],
      practicePhrase: 'The blue moon is cool and beautiful.',
    },

    {
      ipa: '/ɑː/',
      name: 'A longo (father)',
      category: 'vowel_long',
      difficulty: 'medium',
      existsInNative: true,
      nativeEquivalent: '/a/',
      differenceFromNative: 'Similar ao /a/ do português, mas mais longo e posterior (língua mais recuada).',
      articulation: {
        tongue: 'Língua baixa e recuada.',
        lips: 'Boca bem aberta, lábios relaxados.',
        teeth: 'Dentes bem separados.',
        airflow: 'Fluxo aberto e longo.',
        voicing: 'voiced',
        tip: 'Diga "a" como em "cama" e recue levemente a língua. Prolongue o som.',
      },
      examplesTarget: [
        { word: 'father', ipa: '/ˈfɑːðər/', translation: 'pai' },
        { word: 'car', ipa: '/kɑːr/', translation: 'carro' },
        { word: 'arm', ipa: '/ɑːrm/', translation: 'braço' },
        { word: 'heart', ipa: '/hɑːrt/', translation: 'coração' },
      ],
      usVsBritish: 'En-GB: /ɑː/ em "bath", "path", "can\'t" (sem /r/ no final). En-US: /ɑːr/ com /r/ retroflexo em "car", "arm".',
      commonMistakes: [
        'Não prolongar o som',
        'En-US: esquecer o /r/ retroflexo no final',
      ],
      practicePhrase: 'My father parked the car far from the farm.',
    },

    // ─── CONSOANTES FRICATIVAS ────────────────────────────────

    {
      ipa: '/θ/',
      name: 'TH surdo (think)',
      category: 'consonant_fricative',
      difficulty: 'very_hard',
      existsInNative: false,
      differenceFromNative: 'NÃO existe em pt-BR. É o "th" de "think", "three". Produzido com a língua entre os dentes.',
      articulation: {
        tongue: 'Ponta da língua levemente entre os dentes superiores e inferiores, ou tocando a parte de trás dos dentes superiores.',
        lips: 'Lábios abertos, sem tensão.',
        teeth: 'Dentes levemente separados com a língua entre eles.',
        airflow: 'Ar passa entre a língua e os dentes superiores, criando fricção.',
        voicing: 'voiceless',
        tip: 'Coloque a ponta da língua entre os dentes e sopre. Parece que está "mordendo" levemente a língua enquanto fala.',
      },
      examplesTarget: [
        { word: 'think', ipa: '/θɪŋk/', translation: 'pensar' },
        { word: 'three', ipa: '/θriː/', translation: 'três' },
        { word: 'thank', ipa: '/θæŋk/', translation: 'agradecer' },
        { word: 'thin', ipa: '/θɪn/', translation: 'fino' },
        { word: 'tooth', ipa: '/tuːθ/', translation: 'dente' },
      ],
      usVsBritish: 'Idêntico em en-US e en-GB.',
      commonMistakes: [
        'Trocar por /f/: "fink" em vez de "think"',
        'Trocar por /t/: "tink" em vez de "think"',
        'Trocar por /s/: "sink" em vez de "think"',
      ],
      practicePhrase: 'I think three thousand thoughts on Thursday.',
    },

    {
      ipa: '/ð/',
      name: 'TH sonoro (this)',
      category: 'consonant_fricative',
      difficulty: 'very_hard',
      existsInNative: false,
      differenceFromNative: 'NÃO existe em pt-BR. É o "th" de "this", "the", "mother". Igual ao /θ/ mas com vibração das cordas vocais.',
      articulation: {
        tongue: 'Ponta da língua entre os dentes, igual ao /θ/.',
        lips: 'Lábios abertos.',
        teeth: 'Dentes levemente separados com língua entre eles.',
        airflow: 'Ar passa com fricção, mas com vibração.',
        voicing: 'voiced',
        tip: 'Igual ao /θ/ mas "ligue" a voz. Coloque a mão na garganta — deve vibrar. É como um "d" com língua entre os dentes.',
      },
      examplesTarget: [
        { word: 'this', ipa: '/ðɪs/', translation: 'este/esta' },
        { word: 'the', ipa: '/ðə/', translation: 'o/a' },
        { word: 'mother', ipa: '/ˈmʌðər/', translation: 'mãe' },
        { word: 'father', ipa: '/ˈfɑːðər/', translation: 'pai' },
        { word: 'breathe', ipa: '/briːð/', translation: 'respirar' },
      ],
      usVsBritish: 'Idêntico em ambos.',
      commonMistakes: [
        'Trocar por /d/: "dis" em vez de "this"',
        'Trocar por /v/: "vat" em vez de "that"',
        'Confundir com /θ/ (sem voz)',
      ],
      practicePhrase: 'This is the mother and father of the problem.',
    },

    {
      ipa: '/v/',
      name: 'V (voice)',
      category: 'consonant_fricative',
      difficulty: 'medium',
      existsInNative: false,
      nativeEquivalent: '/v/ (existe em algumas variantes)',
      differenceFromNative: 'Em pt-BR o /v/ existe mas muitos falantes o pronunciam como /b/ ou /β/. No inglês o /v/ é sempre labiodental (lábio inferior + dentes superiores).',
      articulation: {
        tongue: 'Língua relaxada.',
        lips: 'Lábio inferior toca levemente os dentes superiores.',
        teeth: 'Dentes superiores sobre o lábio inferior.',
        airflow: 'Ar passa entre o lábio e os dentes com fricção.',
        voicing: 'voiced',
        tip: 'Morda levemente o lábio inferior com os dentes superiores e vibre a voz. Nunca use os dois lábios juntos.',
      },
      examplesTarget: [
        { word: 'voice', ipa: '/vɔɪs/', translation: 'voz' },
        { word: 'very', ipa: '/ˈveri/', translation: 'muito' },
        { word: 'love', ipa: '/lʌv/', translation: 'amor' },
        { word: 'live', ipa: '/lɪv/', translation: 'viver' },
      ],
      commonMistakes: [
        'Usar /b/ em vez de /v/: "berry" em vez de "very"',
        'Usar os dois lábios em vez de lábio+dente',
      ],
      practicePhrase: 'I very much love the vivid view.',
    },

    {
      ipa: '/w/',
      name: 'W (water)',
      category: 'consonant_approximant',
      difficulty: 'medium',
      existsInNative: false,
      nativeEquivalent: '/u/ semivogal',
      differenceFromNative: 'Em pt-BR temos a semivogal /u/ em ditongos (como "mau"), mas o /w/ inglês é mais forte e labializado.',
      articulation: {
        tongue: 'Língua alta e recuada, como para /uː/.',
        lips: 'Lábios bem arredondados e projetados para frente.',
        teeth: 'Dentes separados.',
        airflow: 'Fluxo rápido que se abre para a vogal seguinte.',
        voicing: 'voiced',
        tip: 'Faça bico com os lábios como para assobiar e depois abra rapidamente para a vogal. É um /u/ que vira outra vogal.',
      },
      examplesTarget: [
        { word: 'water', ipa: '/ˈwɔːtər/', translation: 'água' },
        { word: 'word', ipa: '/wɜːrd/', translation: 'palavra' },
        { word: 'win', ipa: '/wɪn/', translation: 'ganhar' },
        { word: 'woman', ipa: '/ˈwʊmən/', translation: 'mulher' },
      ],
      commonMistakes: [
        'Usar /v/ em vez de /w/: erro clássico de falantes de pt-BR',
        'Não arredondar suficientemente os lábios',
      ],
      practicePhrase: 'We want water and wine with our meal.',
    },

    {
      ipa: '/h/',
      name: 'H aspirado (house)',
      category: 'consonant_fricative',
      difficulty: 'medium',
      existsInNative: false,
      differenceFromNative: 'Em pt-BR o "h" é mudo. No inglês é aspirado — um sopro de ar da glote.',
      articulation: {
        tongue: 'Língua na posição da vogal seguinte.',
        lips: 'Abertos na posição da vogal seguinte.',
        teeth: 'Separados.',
        airflow: 'Sopro de ar da garganta sem fricção forte.',
        voicing: 'voiceless',
        tip: 'É como um suspiro antes da vogal. Sopre ar da garganta como quando embaça um espelho. "Haaaa".',
      },
      examplesTarget: [
        { word: 'house', ipa: '/haʊs/', translation: 'casa' },
        { word: 'hello', ipa: '/həˈloʊ/', translation: 'olá' },
        { word: 'happy', ipa: '/ˈhæpi/', translation: 'feliz' },
        { word: 'hot', ipa: '/hɑːt/', translation: 'quente' },
      ],
      commonMistakes: [
        'Omitir o /h/ completamente: "ello" em vez de "hello"',
        'Usar /r/ do português no lugar do /h/: erro de falantes do interior',
      ],
      practicePhrase: 'He is happy in his house on the hill.',
    },

    // ─── CONSOANTES NASAIS ────────────────────────────────────

    {
      ipa: '/ŋ/',
      name: 'NG velar (sing)',
      category: 'consonant_nasal',
      difficulty: 'hard',
      existsInNative: false,
      nativeEquivalent: '/n/ ou /nh/',
      differenceFromNative: 'Em pt-BR nasalizamos vogais mas não temos o /ŋ/ isolado. No inglês "sing" termina com /ŋ/ — nasal velar, produzida no fundo da boca.',
      articulation: {
        tongue: 'Parte posterior da língua toca o véu palatino (parte mole do céu da boca), bloqueando o ar.',
        lips: 'Relaxados.',
        teeth: 'Levemente separados.',
        airflow: 'Ar sai pelo nariz.',
        voicing: 'voiced',
        tip: 'Diga "banco" e sinta onde a língua toca no fundo do céu da boca no "n" de "banco". Esse é o ponto. Agora faça só esse nasal.',
      },
      examplesTarget: [
        { word: 'sing', ipa: '/sɪŋ/', translation: 'cantar' },
        { word: 'ring', ipa: '/rɪŋ/', translation: 'anel' },
        { word: 'king', ipa: '/kɪŋ/', translation: 'rei' },
        { word: 'long', ipa: '/lɔːŋ/', translation: 'longo' },
        { word: 'thing', ipa: '/θɪŋ/', translation: 'coisa' },
      ],
      usVsBritish: 'Idêntico em ambos.',
      commonMistakes: [
        'Adicionar /g/ no final: "sing-g" em vez de "sing"',
        'Usar /n/ em vez de /ŋ/: "sin" em vez de "sing"',
      ],
      practicePhrase: 'The king can sing a long, strong song.',
    },

    // ─── CONSOANTES LÍQUIDAS / R ──────────────────────────────

    {
      ipa: '/r/',
      name: 'R retroflexo americano (red)',
      category: 'consonant_liquid',
      difficulty: 'very_hard',
      existsInNative: false,
      nativeEquivalent: '/r/ ou /ʁ/',
      differenceFromNative: 'O /r/ americano é retroflexo: a ponta da língua se curva para trás sem tocar nada. Completamente diferente do /r/ vibrante do português.',
      articulation: {
        tongue: 'Ponta da língua curvada para trás (retroflexa), sem tocar o céu da boca. Ou: língua em "colher" com os lados tocando os molares superiores.',
        lips: 'Levemente arredondados.',
        teeth: 'Separados.',
        airflow: 'Fluxo contínuo com ressonância na garganta.',
        voicing: 'voiced',
        tip: 'Diga "butter" em inglês americano e sinta a língua se curvar para trás. Nunca vibre a língua como no português.',
      },
      examplesTarget: [
        { word: 'red', ipa: '/red/', translation: 'vermelho' },
        { word: 'right', ipa: '/raɪt/', translation: 'certo/direito' },
        { word: 'car', ipa: '/kɑːr/', translation: 'carro' },
        { word: 'water', ipa: '/ˈwɔːtər/', translation: 'água' },
        { word: 'bird', ipa: '/bɜːrd/', translation: 'pássaro' },
      ],
      usVsBritish: 'GRANDE DIFERENÇA: En-US é rhotico (pronuncia o /r/ em todas as posições, inclusive no final). En-GB (RP) é não-rhotico: o /r/ final e pré-consonantal não é pronunciado — "car" = /kɑː/, "bird" = /bɜːd/.',
      commonMistakes: [
        'Usar /r/ vibrante do português',
        'Usar /h/ (como no carioca): "hio" em vez de "rio"',
        'En-US: esquecer o /r/ em posição final',
      ],
      practicePhrase: 'The red bird flew over the river near the car.',
    },

    {
      ipa: '/l/',
      name: 'L claro e L escuro (light/milk)',
      category: 'consonant_liquid',
      difficulty: 'hard',
      existsInNative: true,
      nativeEquivalent: '/l/',
      differenceFromNative: 'Em inglês há dois /l/: o "clear l" (antes de vogal: "light") e o "dark l" (antes de consoante ou no final: "milk", "ball"). O dark l tem ressonância posterior que não existe em pt-BR.',
      articulation: {
        tongue: 'Clear l: ponta toca os alvéolos (atrás dos dentes superiores). Dark l: mesma posição mas a parte posterior da língua se levanta em direção ao véu palatino.',
        lips: 'Relaxados.',
        teeth: 'Separados.',
        airflow: 'Ar passa pelos lados da língua.',
        voicing: 'voiced',
        tip: 'Para o dark l: diga "milk" e sinta a língua "engrossar" no final. É como um "l" com ressonância de /u/ ao fundo.',
      },
      examplesTarget: [
        { word: 'light', ipa: '/laɪt/', translation: 'luz/leve' },
        { word: 'milk', ipa: '/mɪlk/', translation: 'leite' },
        { word: 'ball', ipa: '/bɔːl/', translation: 'bola' },
        { word: 'feel', ipa: '/fiːl/', translation: 'sentir' },
      ],
      commonMistakes: [
        'Usar sempre o mesmo /l/ do português',
        'Vocalizar o dark l como /u/: "miwk" em vez de "milk"',
      ],
      practicePhrase: 'Fill the tall glass with cold milk.',
    },

    // ─── CONSOANTES AFRICADAS ─────────────────────────────────

    {
      ipa: '/dʒ/',
      name: 'DJ (judge)',
      category: 'consonant_affricate',
      difficulty: 'medium',
      existsInNative: true,
      nativeEquivalent: '/dʒ/ (existe no pt-BR)',
      differenceFromNative: 'Existe em pt-BR como em "dia" (em algumas variantes) ou "djinn". Relativamente fácil.',
      articulation: {
        tongue: 'Ponta toca os alvéolos, depois se afasta criando fricção.',
        lips: 'Levemente arredondados.',
        teeth: 'Próximos.',
        airflow: 'Explosão seguida de fricção.',
        voicing: 'voiced',
        tip: 'É o som de "dj" como em "DJ". Diga "d" e imediatamente "j" — eles se fundem.',
      },
      examplesTarget: [
        { word: 'judge', ipa: '/dʒʌdʒ/', translation: 'juiz' },
        { word: 'job', ipa: '/dʒɑːb/', translation: 'trabalho' },
        { word: 'just', ipa: '/dʒʌst/', translation: 'apenas' },
        { word: 'jump', ipa: '/dʒʌmp/', translation: 'pular' },
      ],
      commonMistakes: [
        'Usar /ʒ/ puro sem a oclusiva inicial',
      ],
      practicePhrase: 'Just jump and enjoy the journey.',
    },

    {
      ipa: '/tʃ/',
      name: 'TCH (church)',
      category: 'consonant_affricate',
      difficulty: 'easy',
      existsInNative: true,
      nativeEquivalent: '/tʃ/',
      differenceFromNative: 'Existe em pt-BR como em "tchau", "tche". Muito fácil para falantes de pt-BR.',
      articulation: {
        tongue: 'Ponta toca os alvéolos, depois se afasta.',
        lips: 'Levemente arredondados.',
        teeth: 'Próximos.',
        airflow: 'Explosão seguida de fricção, sem voz.',
        voicing: 'voiceless',
        tip: 'É o "tch" de "tchau". Exatamente igual.',
      },
      examplesTarget: [
        { word: 'church', ipa: '/tʃɜːrtʃ/', translation: 'igreja' },
        { word: 'chair', ipa: '/tʃer/', translation: 'cadeira' },
        { word: 'cheese', ipa: '/tʃiːz/', translation: 'queijo' },
        { word: 'watch', ipa: '/wɑːtʃ/', translation: 'assistir/relógio' },
      ],
      examplesNative: [
        { word: 'tchau', note: 'O "tch" de tchau é idêntico' },
      ],
      commonMistakes: [
        'Usar /ʃ/ puro sem a oclusiva: "shurch" em vez de "church"',
      ],
      practicePhrase: 'Choose cheese and chocolate at the church.',
    },

    // ─── DITONGOS ─────────────────────────────────────────────

    {
      ipa: '/eɪ/',
      name: 'EI (face)',
      category: 'diphthong',
      difficulty: 'medium',
      existsInNative: true,
      nativeEquivalent: '/ei/',
      differenceFromNative: 'Similar ao ditongo "ei" do português (como em "lei", "rei"). Relativamente fácil.',
      articulation: {
        tongue: 'Começa em /e/ e desliza para /ɪ/.',
        lips: 'Começa aberto e fecha levemente.',
        teeth: 'Separados.',
        airflow: 'Contínuo com deslizamento.',
        voicing: 'voiced',
        tip: 'Diga "ei" como em "lei" — é praticamente igual.',
      },
      examplesTarget: [
        { word: 'face', ipa: '/feɪs/', translation: 'rosto' },
        { word: 'day', ipa: '/deɪ/', translation: 'dia' },
        { word: 'name', ipa: '/neɪm/', translation: 'nome' },
        { word: 'say', ipa: '/seɪ/', translation: 'dizer' },
      ],
      examplesNative: [
        { word: 'lei', note: 'O ditongo "ei" de "lei" é muito próximo' },
      ],
      commonMistakes: [
        'Usar /e/ puro sem o deslizamento para /ɪ/',
      ],
      practicePhrase: 'Say my name every day.',
    },

    {
      ipa: '/aɪ/',
      name: 'AI (price)',
      category: 'diphthong',
      difficulty: 'easy',
      existsInNative: true,
      nativeEquivalent: '/ai/',
      differenceFromNative: 'Idêntico ao ditongo "ai" do português (como em "pai", "vai").',
      articulation: {
        tongue: 'Começa em /a/ aberto e desliza para /ɪ/.',
        lips: 'Começa bem aberto e fecha.',
        teeth: 'Bem separados no início.',
        airflow: 'Contínuo.',
        voicing: 'voiced',
        tip: 'É o "ai" de "pai" em português. Idêntico.',
      },
      examplesTarget: [
        { word: 'price', ipa: '/praɪs/', translation: 'preço' },
        { word: 'time', ipa: '/taɪm/', translation: 'tempo' },
        { word: 'my', ipa: '/maɪ/', translation: 'meu' },
        { word: 'night', ipa: '/naɪt/', translation: 'noite' },
      ],
      examplesNative: [
        { word: 'pai', note: 'O ditongo "ai" de "pai" é idêntico' },
      ],
      commonMistakes: [
        'Usar /a/ puro sem deslizamento',
      ],
      practicePhrase: 'My time to shine is tonight.',
    },

    {
      ipa: '/aʊ/',
      name: 'AU (mouth)',
      category: 'diphthong',
      difficulty: 'easy',
      existsInNative: true,
      nativeEquivalent: '/au/',
      differenceFromNative: 'Similar ao ditongo "au" do português (como em "mau", "pau").',
      articulation: {
        tongue: 'Começa em /a/ e desliza para /ʊ/.',
        lips: 'Começa aberto e arredonda no final.',
        teeth: 'Bem separados no início.',
        airflow: 'Contínuo.',
        voicing: 'voiced',
        tip: 'É o "au" de "mau" em português.',
      },
      examplesTarget: [
        { word: 'mouth', ipa: '/maʊθ/', translation: 'boca' },
        { word: 'house', ipa: '/haʊs/', translation: 'casa' },
        { word: 'now', ipa: '/naʊ/', translation: 'agora' },
        { word: 'out', ipa: '/aʊt/', translation: 'fora' },
      ],
      examplesNative: [
        { word: 'mau', note: 'O ditongo "au" de "mau" é muito próximo' },
      ],
      commonMistakes: [
        'Não arredondar os lábios no final',
      ],
      practicePhrase: 'Get out of the house right now.',
    },

    {
      ipa: '/oʊ/',
      name: 'OU (go)',
      category: 'diphthong',
      difficulty: 'medium',
      existsInNative: false,
      nativeEquivalent: '/o/',
      differenceFromNative: 'Em pt-BR o /o/ é uma vogal simples. Em en-US o "o" em posição tônica é um ditongo /oʊ/ — começa em /o/ e desliza para /ʊ/.',
      articulation: {
        tongue: 'Começa em /o/ médio e sobe para /ʊ/.',
        lips: 'Começa arredondado e aumenta o arredondamento.',
        teeth: 'Moderadamente separados.',
        airflow: 'Contínuo com deslizamento.',
        voicing: 'voiced',
        tip: 'Diga "o" e deslize para "u" no final. É "o-u" fundidos: "ôu".',
      },
      examplesTarget: [
        { word: 'go', ipa: '/ɡoʊ/', translation: 'ir' },
        { word: 'home', ipa: '/hoʊm/', translation: 'casa/lar' },
        { word: 'no', ipa: '/noʊ/', translation: 'não' },
        { word: 'phone', ipa: '/foʊn/', translation: 'telefone' },
      ],
      usVsBritish: 'En-GB usa /əʊ/ (começa com schwa): "go" = /ɡəʊ/. En-US usa /oʊ/.',
      commonMistakes: [
        'Usar /o/ puro sem o deslizamento final',
      ],
      practicePhrase: 'Go home and phone me later.',
    },

  ],
};

// ============================================================
// MAPEAMENTO: pt-BR → en-GB (diferenças específicas)
// ============================================================

export const ptBR_to_enGB_differences: Array<{
  feature: string;
  enUS: string;
  enGB: string;
  example: string;
  tip: string;
}> = [
  {
    feature: 'R pós-vocálico (rhotic)',
    enUS: 'Pronunciado sempre: car /kɑːr/, bird /bɜːrd/',
    enGB: 'Não pronunciado antes de consoante ou no final: car /kɑː/, bird /bɜːd/',
    example: '"car", "bird", "water", "butter"',
    tip: 'En-GB: ignore o R no final das palavras e antes de consoantes. En-US: sempre pronuncie.',
  },
  {
    feature: 'Vogal em "bath/path/can\'t" (trap-bath split)',
    enUS: '/æ/ — mesma vogal de "cat": bath /bæθ/',
    enGB: '/ɑː/ — vogal longa posterior: bath /bɑːθ/',
    example: '"bath", "path", "can\'t", "dance", "after"',
    tip: 'En-GB: essas palavras têm o "a" longo como em "father". En-US: têm o "a" curto de "cat".',
  },
  {
    feature: 'Ditongo em "go/home" (goat vowel)',
    enUS: '/oʊ/ — começa em /o/: go /ɡoʊ/',
    enGB: '/əʊ/ — começa com schwa: go /ɡəʊ/',
    example: '"go", "home", "phone", "no", "stone"',
    tip: 'En-GB: o "o" tônico começa com um schwa neutro antes de deslizar para /ʊ/.',
  },
  {
    feature: 'Vogal em "lot/hot" (lot vowel)',
    enUS: '/ɑː/ — não arredondada: hot /hɑːt/',
    enGB: '/ɒ/ — arredondada curta: hot /hɒt/',
    example: '"hot", "lot", "stop", "not", "body"',
    tip: 'En-GB: arredonde os lábios como para /o/ mas mais curto. En-US: boca aberta sem arredondamento.',
  },
  {
    feature: 'T intervocálico (flapping)',
    enUS: 'T entre vogais vira /ɾ/ (flap): water /ˈwɔːɾər/',
    enGB: 'T mantido como /t/ claro: water /ˈwɔːtə/',
    example: '"water", "butter", "better", "city"',
    tip: 'En-US: o T entre vogais soa como um D rápido. En-GB: T sempre claro e nítido.',
  },
  {
    feature: 'Acento em palavras específicas',
    enUS: '"advertisement" = /ˌædvərˈtaɪzmənt/',
    enGB: '"advertisement" = /ədˈvɜːtɪsmənt/',
    example: '"advertisement", "laboratory", "controversy"',
    tip: 'Muitas palavras têm acento diferente entre os dois dialetos. Aprenda as mais comuns.',
  },
];

// ============================================================
// FONEMAS MAIS DIFÍCEIS PARA FALANTES DE PT-BR (ranking)
// ============================================================

export const hardestPhonemesForPtBR: Array<{
  rank: number;
  ipa: string;
  name: string;
  whyHard: string;
  quickFix: string;
}> = [
  {
    rank: 1,
    ipa: '/θ/ e /ð/',
    name: 'TH surdo e sonoro',
    whyHard: 'Não existe em pt-BR. Requer colocar a língua entre os dentes — movimento incomum.',
    quickFix: 'Pratique na frente do espelho. Coloque a língua entre os dentes e sopre. 5 minutos por dia.',
  },
  {
    rank: 2,
    ipa: '/æ/',
    name: 'A aberto (cat)',
    whyHard: 'Não existe em pt-BR. Requer boca muito aberta com língua avançada.',
    quickFix: 'Diga "a" exagerado com sorriso forçado. Pratique: cat, bad, man, hand.',
  },
  {
    rank: 3,
    ipa: '/ʌ/',
    name: 'A central (cup)',
    whyHard: 'Não existe em pt-BR. Vogal central sem equivalente.',
    quickFix: 'É o som de surpresa "uh!". Pratique: cup, bus, love, money.',
  },
  {
    rank: 4,
    ipa: '/r/ retroflexo',
    name: 'R americano',
    whyHard: 'Completamente diferente do /r/ do português. Requer curvar a língua para trás.',
    quickFix: 'Não vibre a língua. Curve-a para trás sem tocar nada. Pratique: red, right, water.',
  },
  {
    rank: 5,
    ipa: '/ɪ/ vs /iː/',
    name: 'I curto vs I longo',
    whyHard: 'Em pt-BR temos só /i/. A distinção bit/beat, ship/sheep é crucial.',
    quickFix: '/ɪ/ = i relaxado e curto. /iː/ = i tenso e longo. Pratique os pares mínimos.',
  },
  {
    rank: 6,
    ipa: '/ʊ/ vs /uː/',
    name: 'U curto vs U longo',
    whyHard: 'Em pt-BR temos só /u/. A distinção book/boot, full/fool é crucial.',
    quickFix: '/ʊ/ = u relaxado e curto. /uː/ = u tenso e longo. Pratique: book/boot.',
  },
  {
    rank: 7,
    ipa: '/ŋ/',
    name: 'NG velar (sing)',
    whyHard: 'Em pt-BR nasalizamos vogais mas não temos este nasal isolado no final.',
    quickFix: 'Sinta a parte posterior da língua tocar o fundo do céu da boca. Pratique: sing, ring, king.',
  },
  {
    rank: 8,
    ipa: '/h/',
    name: 'H aspirado',
    whyHard: 'Em pt-BR o H é mudo. Esquecer de aspirar é erro comum.',
    quickFix: 'Sopre ar da garganta antes da vogal. Pratique: hello, happy, house.',
  },
];

// ============================================================
// PARES MÍNIMOS (palavras que diferem por 1 fonema)
// Essenciais para treinar distinções difíceis
// ============================================================

export const minimalPairs: Array<{
  phoneme1: string;
  phoneme2: string;
  pairs: Array<[string, string]>;
  tip: string;
}> = [
  {
    phoneme1: '/ɪ/',
    phoneme2: '/iː/',
    pairs: [
      ['bit', 'beat'],
      ['ship', 'sheep'],
      ['sit', 'seat'],
      ['fill', 'feel'],
      ['live', 'leave'],
    ],
    tip: 'O primeiro é curto e relaxado, o segundo é longo e tenso.',
  },
  {
    phoneme1: '/ʊ/',
    phoneme2: '/uː/',
    pairs: [
      ['book', 'boot'],
      ['full', 'fool'],
      ['pull', 'pool'],
      ['look', 'Luke'],
    ],
    tip: 'O primeiro é curto e relaxado, o segundo é longo e tenso.',
  },
  {
    phoneme1: '/æ/',
    phoneme2: '/e/',
    pairs: [
      ['bad', 'bed'],
      ['man', 'men'],
      ['sad', 'said'],
      ['bat', 'bet'],
    ],
    tip: '/æ/ tem a boca mais aberta e a língua mais avançada.',
  },
  {
    phoneme1: '/θ/',
    phoneme2: '/s/',
    pairs: [
      ['think', 'sink'],
      ['three', 'free'],
      ['thank', 'sank'],
      ['thin', 'sin'],
    ],
    tip: '/θ/ requer a língua entre os dentes. /s/ usa os dentes fechados.',
  },
  {
    phoneme1: '/ð/',
    phoneme2: '/d/',
    pairs: [
      ['this', 'dis'],
      ['they', 'day'],
      ['then', 'den'],
      ['though', 'dough'],
    ],
    tip: '/ð/ requer a língua entre os dentes com vibração.',
  },
  {
    phoneme1: '/v/',
    phoneme2: '/b/',
    pairs: [
      ['very', 'berry'],
      ['vest', 'best'],
      ['vat', 'bat'],
      ['vine', 'bine'],
    ],
    tip: '/v/ usa lábio inferior + dentes superiores. /b/ usa os dois lábios.',
  },
  {
    phoneme1: '/w/',
    phoneme2: '/v/',
    pairs: [
      ['wine', 'vine'],
      ['west', 'vest'],
      ['wet', 'vet'],
      ['worse', 'verse'],
    ],
    tip: '/w/ usa os dois lábios arredondados. /v/ usa lábio + dentes.',
  },
];

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/** Retorna todos os fonemas de uma categoria */
export function getPhonemesByCategory(
  data: PhonemeCompareData,
  category: PhonemeCategory
): PhonemeEntry[] {
  return data.phonemes.filter(p => p.category === category);
}

/** Retorna fonemas por nível de dificuldade */
export function getPhonemesByDifficulty(
  data: PhonemeCompareData,
  difficulty: DifficultyLevel
): PhonemeEntry[] {
  return data.phonemes.filter(p => p.difficulty === difficulty);
}

/** Retorna apenas fonemas que NÃO existem no idioma nativo */
export function getNewPhonemes(data: PhonemeCompareData): PhonemeEntry[] {
  return data.phonemes.filter(p => !p.existsInNative);
}

/** Busca fonema por símbolo IPA */
export function getPhonemeByIPA(
  data: PhonemeCompareData,
  ipa: string
): PhonemeEntry | undefined {
  return data.phonemes.find(p => p.ipa === ipa);
}

/** Busca fonemas que contêm uma palavra de exemplo */
export function searchPhonemeByWord(
  data: PhonemeCompareData,
  word: string
): PhonemeEntry[] {
  const lower = word.toLowerCase();
  return data.phonemes.filter(p =>
    p.examplesTarget.some(e => e.word.toLowerCase().includes(lower))
  );
}

/** Retorna o mapeamento correto baseado no idioma nativo e alvo */
export function getPhonemeData(
  nativeLang: string,
  targetLang: string
): PhonemeCompareData {
  // Por enquanto suportamos pt-BR → en-US/en-GB
  if (
    (nativeLang === 'pt-BR' || nativeLang === 'pt') &&
    (targetLang === 'en-US' || targetLang === 'en-GB' || targetLang === 'en')
  ) {
    return ptBR_to_enUS;
  }
  // Fallback: retorna o mapeamento padrão
  return ptBR_to_enUS;
}

/** Retorna as diferenças en-US vs en-GB */
export function getUSvsBritishDifferences() {
  return ptBR_to_enGB_differences;
}

/** Retorna os fonemas mais difíceis para o idioma nativo */
export function getHardestPhonemes(nativeLang: string) {
  if (nativeLang === 'pt-BR' || nativeLang === 'pt') {
    return hardestPhonemesForPtBR;
  }
  return hardestPhonemesForPtBR; // fallback
}

/** Retorna pares mínimos para praticar */
export function getMinimalPairs() {
  return minimalPairs;
}

export default ptBR_to_enUS;
