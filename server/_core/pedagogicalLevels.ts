/**
 * pedagogicalLevels.ts
 * Sistema de progressão pedagógica baseado na vida real
 * Infância → Criança → Adolescência → Adulto → Fluente
 */

export type LifePhase = 'infancia' | 'crianca' | 'adolescencia' | 'adulto' | 'fluente';

export interface PhaseConfig {
  id: LifePhase;
  label: string;
  cefr: string;
  ageRange: string;
  emoji: string;
  color: string;
  description: string;
  exerciseTypes: ExerciseType[];
  wordCount: number;       // palavras por lição
  sentenceComplexity: string;
  topics: string[];
  grammarFocus: string[];  // estruturas gramaticais ensinadas nesta fase
  wordStructures: string; // como as palavras se combinam
}

export type ExerciseType =
  | 'word_image'        // Palavra + imagem + áudio (infância)
  | 'listen_repeat'     // Ouça e repita
  | 'match_pairs'       // Associar palavra ↔ imagem
  | 'tap_word'          // Toque a palavra que ouviu
  | 'simple_sentence'   // Frase simples com imagem
  | 'fill_blank'        // Complete a frase
  | 'word_order'        // Ordene as palavras
  | 'multiple_choice'   // Múltipla escolha
  | 'memory_game'       // Jogo da memória (gamificação)
  | 'drag_drop'         // Arraste a palavra para o lugar
  | 'dialogue'          // Diálogo completo
  | 'real_situation'    // Situação real (restaurante, banco, etc.)
  | 'pronunciation'     // Correção de pronúncia
  | 'idioms'            // Expressões idiomáticas
  | 'debate'            // Debate / opinião

export const LIFE_PHASES: PhaseConfig[] = [
  {
    id: 'infancia',
    label: 'Infância',
    cefr: 'A1',
    ageRange: '0–6 anos',
    emoji: '🍼',
    color: '#FF9F43',
    description: 'Palavras básicas com imagem e som — como uma criança aprende sua língua materna',
    exerciseTypes: ['word_image', 'listen_repeat', 'tap_word', 'match_pairs'],
    wordCount: 15,
    sentenceComplexity: 'single words and 2-word combinations only',
    grammarFocus: [
      'Substantivos isolados: cat, house, water',
      'Artigos simples: a cat, the house',
      'Números: one cat, two dogs',
    ],
    wordStructures: 'ONLY isolated nouns and simple noun phrases. NO adjectives before nouns yet. NO verbs yet.',
    topics: [
      'Família (mamãe, papai, bebê)',
      'Corpo humano (olho, nariz, boca)',
      'Animais domésticos (gato, cachorro, pássaro)',
      'Cores (vermelho, azul, verde)',
      'Números 1–10',
      'Frutas (maçã, banana, laranja)',
      'Objetos da casa (cama, mesa, cadeira)',
      'Saudações (olá, tchau, obrigado)',
    ]
  },
  {
    id: 'crianca',
    label: 'Criança',
    cefr: 'A2',
    ageRange: '6–12 anos',
    emoji: '🎒',
    color: '#48DBFB',
    description: 'Frases curtas do cotidiano — escola, família, brinquedos',
    exerciseTypes: ['word_image', 'simple_sentence', 'fill_blank', 'match_pairs', 'memory_game'],
    wordCount: 20,
    sentenceComplexity: 'simple sentences (subject + verb + object), max 6 words',
    grammarFocus: [
      'Adjetivo + Substantivo: big cat, red house, cold water',
      'Sujeito + Verbo: I run, she eats, he sleeps',
      'Sujeito + Verbo + Objeto: I have a cat. She eats an apple.',
      'Possável: my cat, your house, his book',
    ],
    wordStructures: 'Adjective BEFORE noun (English order): big cat, NOT cat big. Subject + verb + object. Possessive pronouns.',
    topics: [
      'Escola (professor, livro, lápis, mochila)',
      'Comida e refeições (café da manhã, almoço, jantar)',
      'Brinquedos e jogos',
      'Dias da semana e meses',
      'Clima (sol, chuva, frio, calor)',
      'Roupas (camisa, calça, sapato)',
      'Ações simples (correr, pular, comer, dormir)',
      'Minha casa (quarto, cozinha, banheiro)',
    ]
  },
  {
    id: 'adolescencia',
    label: 'Adolescência',
    cefr: 'B1',
    ageRange: '12–18 anos',
    emoji: '🎮',
    color: '#A29BFE',
    description: 'Situações do dia a dia — amigos, redes sociais, escola, hobbies',
    exerciseTypes: ['fill_blank', 'word_order', 'multiple_choice', 'drag_drop', 'memory_game', 'dialogue'],
    wordCount: 25,
    sentenceComplexity: 'compound sentences with connectors (and, but, because, so)',
    grammarFocus: [
      'Caso genitivo: the cat\'s house, my friend\'s car, John\'s book',
      'Phrasal verbs: wake up, give up, look for, turn on',
      'Expressões compostas: traffic light, fire station, ice cream',
      'Conectores: and, but, because, so, although, however',
      'Tempos verbais: present, past, future simples',
    ],
    wordStructures: 'Genitive case (apostrophe-s), compound nouns (noun+noun), phrasal verbs (verb+particle). Teach the RULE: in English, adjective comes BEFORE noun (unlike Portuguese).',
    topics: [
      'Redes sociais e tecnologia',
      'Música, filmes e séries',
      'Esportes e hobbies',
      'Amizade e relacionamentos',
      'Escola e estudos',
      'Saúde e corpo',
      'Viagens e lugares',
      'Futuro e sonhos',
    ]
  },
  {
    id: 'adulto',
    label: 'Adulto',
    cefr: 'B2',
    ageRange: '18–60 anos',
    emoji: '💼',
    color: '#55EFC4',
    description: 'Situações reais da vida adulta — trabalho, viagem, saúde, banco, restaurante',
    exerciseTypes: ['dialogue', 'real_situation', 'fill_blank', 'multiple_choice', 'pronunciation', 'word_order'],
    wordCount: 30,
    sentenceComplexity: 'complex sentences with clauses, conditionals, and formal/informal register',
    grammarFocus: [
      'Condicionais: If I had money, I would travel.',
      'Voz passiva: The letter was written by John.',
      'Colocações: make a decision, take a shower, do homework',
      'Expressões em duas palavras: break down, give in, look forward to',
      'Registro formal vs informal: I would like vs I want',
    ],
    wordStructures: 'Multi-word expressions as single units. Collocations (verb+noun pairs that go together). Formal/informal register differences.',
    topics: [
      'Trabalho e carreira (entrevista, reunião, e-mail profissional)',
      'Viagem (aeroporto, hotel, turismo)',
      'Saúde (médico, farmácia, emergência)',
      'Banco e finanças (conta, cartão, transferência)',
      'Restaurante e gastronomia',
      'Moradia (alugar, comprar, reformar)',
      'Compras e consumo',
      'Notícias e atualidades',
    ]
  },
  {
    id: 'fluente',
    label: 'Fluente',
    cefr: 'C1–C2',
    ageRange: 'Adulto avançado',
    emoji: '🎓',
    color: '#FD79A8',
    description: 'Expressões idiomáticas, gírias, debates, literatura e cultura',
    exerciseTypes: ['dialogue', 'real_situation', 'pronunciation', 'idioms', 'debate'],
    wordCount: 35,
    sentenceComplexity: 'native-level complexity with idioms, nuance, humor, and cultural references',
    grammarFocus: [
      'Expressões idiomáticas: it\'s raining cats and dogs, break the ice',
      'Ligações naturais de fala: gonna, wanna, gotta, kinda, sorta',
      'Inversão e ênfase: Never have I seen..., Not only did he...',
      'Nuances culturais: humor, ironia, sarcasmo em contexto',
      'Variações regionais: British vs American vs Australian',
    ],
    wordStructures: 'Native-speed connected speech: gonna=going to, wanna=want to, gotta=got to. Idiomatic multi-word units as single concepts.',
    topics: [
      'Expressões idiomáticas e gírias',
      'Negócios e negociação avançada',
      'Política e sociedade',
      'Arte, literatura e cultura',
      'Ciência e tecnologia',
      'Filosofia e debates',
      'Humor e ironia',
      'Sotaques e variações regionais',
    ]
  }
];

export function getPhaseConfig(phase: LifePhase): PhaseConfig {
  return LIFE_PHASES.find(p => p.id === phase) || LIFE_PHASES[0];
}

export function getPhaseFromCEFR(cefr: string): LifePhase {
  if (cefr === 'A1') return 'infancia';
  if (cefr === 'A2') return 'crianca';
  if (cefr === 'B1') return 'adolescencia';
  if (cefr === 'B2') return 'adulto';
  return 'fluente';
}

export function getPhaseFromLevel(level: string): LifePhase {
  const map: Record<string, LifePhase> = {
    beginner: 'infancia',
    elementary: 'crianca',
    intermediate: 'adolescencia',
    'upper-intermediate': 'adulto',
    advanced: 'fluente',
    proficient: 'fluente',
    basico: 'infancia',
    iniciante: 'infancia',
    intermediario: 'adolescencia',
    avancado: 'fluente',
    A1: 'infancia',
    A2: 'crianca',
    B1: 'adolescencia',
    B2: 'adulto',
    C1: 'fluente',
    C2: 'fluente',
  };
  return map[level] || 'infancia';
}

/**
 * Gera o prompt de sistema para o LLM baseado na fase pedagógica
 */
export function buildPedagogicalPrompt(
  phase: LifePhase,
  targetLang: string,
  nativeLang: string,
  topic: string
): string {
  const config = getPhaseConfig(phase);

  const exerciseDescriptions: Record<ExerciseType, string> = {
    word_image: 'Show a single word with its emoji/image and audio. Student taps to hear pronunciation.',
    listen_repeat: 'Play audio of a word/phrase, student repeats and gets pronunciation score.',
    match_pairs: 'Match word cards to image cards (memory game style).',
    tap_word: 'Hear a word, tap the correct card from 4 options.',
    simple_sentence: 'Show a simple sentence with an illustration.',
    fill_blank: 'Complete the sentence by choosing or typing the missing word.',
    word_order: 'Arrange shuffled words to form a correct sentence.',
    multiple_choice: 'Choose the correct translation or meaning from 4 options.',
    memory_game: 'Flip cards to match word pairs — gamified memorization.',
    drag_drop: 'Drag words to fill blanks in a sentence.',
    dialogue: 'Interactive dialogue with the virtual teacher — student responds.',
    real_situation: 'Real-life scenario (restaurant, airport, doctor) with role-play.',
    pronunciation: 'Record voice, get AI pronunciation feedback and score.',
    idioms: 'Learn idiomatic expressions with context and usage examples.',
    debate: 'Express opinion on a topic, teacher responds and challenges.',
  };

  const exerciseList = config.exerciseTypes
    .map((t, i) => `${i + 1}. ${t}: ${exerciseDescriptions[t]}`)
    .join('\n');

  return `You are a world-class language teacher creating a ${config.label} level lesson (${config.cefr}) for ${targetLang}.

PEDAGOGICAL PHASE: ${config.label} (${config.ageRange})
PHILOSOPHY: ${config.description}
SENTENCE COMPLEXITY: ${config.sentenceComplexity}
WORDS PER LESSON: ${config.wordCount}
TOPIC: ${topic}
STUDENT'S NATIVE LANGUAGE: ${nativeLang}

EXERCISE TYPES FOR THIS PHASE:
${exerciseList}

GRAMMAR STRUCTURES TO TEACH THIS PHASE:
${config.grammarFocus.map((g, i) => `${i + 1}. ${g}`).join('\n')}

WORD COMBINATION RULES FOR THIS PHASE:
${config.wordStructures}

CRITICAL RULES:
- Phase "${config.id}" means: ${config.description}
- NEVER use complex sentences in infancia/crianca phases
- ALWAYS include emoji for every vocabulary word
- ALWAYS include translation in ${nativeLang}
- ALWAYS include a real-life context for every word/phrase
- Exercises must match the phase: ${config.exerciseTypes.join(', ')}
- TEACH grammar rules explicitly: show the pattern, then examples
- For infancia: ONLY nouns. For crianca: introduce adjective+noun order. For adolescencia: teach genitive, phrasal verbs, compound nouns.
- Make it feel natural and progressive — like actually growing up with the language

CARTILHA / ALPHABET RULE (applies when topic is a letter or letter-based):
- If TOPIC is a single letter (A, B, C...) or "Letter X" or "Letra X" or "Words with X": ALL ${config.wordCount} vocabulary words MUST start with that exact letter
- Choose varied categories: 1 animal, 1 food, 1 body part, 1 object, 1 action, 1 place, 1 color/adjective, etc.
- Each word must be common, concrete, and easy to visualize — like a kindergarten primer (cartilha)
- The lesson should feel like a colorful alphabet book page: big letter, many fun words, each with emoji and sound
- For infancia phase with letter lessons: keep words to 1-2 syllables when possible (cat, cup, car, cow...)`;
}
