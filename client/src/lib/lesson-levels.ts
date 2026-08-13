/**
 * lesson-levels.ts
 * Sistema de aprendizado progressivo CEFR: A1 → A2 → B1 → B2 → C1 → C2
 * Cada nível tem: vocabulário permitido, complexidade gramatical, tipos de perguntas.
 * Integrado com vocab-pareto.ts (palavras de alta frequência primeiro).
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuestionType =
  | 'yes_no'           // A1: Sim/Não
  | 'identify_object'  // A1: O que é isso?
  | 'simple_phrase'    // A2: Frases simples
  | 'fill_blank'       // A2/B1: Complete a frase
  | 'multiple_choice'  // Todos os níveis
  | 'translate'        // A1-B1: Traduzir palavra/frase
  | 'describe'         // B1: Descrever imagem/situação
  | 'compare'          // B1/B2: Comparar dois objetos/situações
  | 'argue'            // B2: Argumentar posição
  | 'correct_error'    // B2/C1: Encontrar e corrigir erro
  | 'open_conversation'// C1/C2: Conversa livre
  | 'debate'           // C2: Debate com nuance
  | 'paraphrase'       // C1/C2: Reformular com outras palavras
  | 'pronunciation'    // Todos: Praticar pronúncia
  | 'listening';       // Todos: Ouvir e responder

export interface LevelConfig {
  level: CEFRLevel;
  label: string;
  description: string;
  /** Número de lição onde este nível começa (1-based) */
  startsAtLesson: number;
  /** Vocabulário máximo (palavras conhecidas esperadas) */
  vocabSize: number;
  /** Comprimento máximo de frase (palavras) */
  maxSentenceLength: number;
  /** Tipos de perguntas disponíveis neste nível */
  questionTypes: QuestionType[];
  /** Estruturas gramaticais introduzidas */
  grammarStructures: string[];
  /** Tópicos abordados */
  topics: string[];
  /** Cor do badge do nível */
  color: string;
  /** Ícone do nível */
  icon: string;
  /** XP necessário para avançar ao próximo nível */
  xpToAdvance: number;
}

export const CEFR_LEVELS: Record<CEFRLevel, LevelConfig> = {
  A1: {
    level: 'A1',
    label: 'Iniciante',
    description: 'Palavras e frases básicas do cotidiano',
    startsAtLesson: 1,
    vocabSize: 150,
    maxSentenceLength: 6,
    questionTypes: ['yes_no', 'identify_object', 'multiple_choice', 'translate', 'pronunciation'],
    grammarStructures: [
      'Presente simples (to be)',
      'Artigos definidos e indefinidos',
      'Pronomes pessoais (I, you, he, she)',
      'Números 1-100',
      'Cores, animais, família',
      'Perguntas simples: What is this? Is this a...?',
    ],
    topics: [
      'Saudações e despedidas',
      'Números e cores',
      'Família e pessoas',
      'Objetos do cotidiano',
      'Alimentos e bebidas',
      'Dias da semana e meses',
    ],
    color: '#22c55e',
    icon: '🌱',
    xpToAdvance: 500,
  },

  A2: {
    level: 'A2',
    label: 'Básico',
    description: 'Comunicação em situações cotidianas simples',
    startsAtLesson: 15,
    vocabSize: 500,
    maxSentenceLength: 10,
    questionTypes: ['yes_no', 'simple_phrase', 'fill_blank', 'multiple_choice', 'translate', 'pronunciation', 'listening'],
    grammarStructures: [
      'Presente simples (verbos regulares)',
      'Presente contínuo (to be + -ing)',
      'Passado simples (was/were, had)',
      'Futuro com "going to"',
      'Preposições de lugar e tempo',
      'Adjetivos comparativos simples',
      'Perguntas com Where, When, Who',
    ],
    topics: [
      'Rotina diária',
      'Compras e preços',
      'Transporte e direções',
      'Clima e tempo',
      'Saúde e corpo',
      'Trabalho e profissões',
      'Casa e mobília',
    ],
    color: '#84cc16',
    icon: '🌿',
    xpToAdvance: 1200,
  },

  B1: {
    level: 'B1',
    label: 'Intermediário',
    description: 'Comunicação em temas familiares com certa fluência',
    startsAtLesson: 40,
    vocabSize: 1500,
    maxSentenceLength: 18,
    questionTypes: ['fill_blank', 'multiple_choice', 'translate', 'describe', 'compare', 'pronunciation', 'listening', 'open_conversation'],
    grammarStructures: [
      'Passado simples (verbos irregulares)',
      'Presente perfeito (have/has + past participle)',
      'Futuro simples (will)',
      'Condicionais tipo 1 (If + present, will)',
      'Verbos modais (can, could, should, must)',
      'Voz passiva simples',
      'Conectivos (because, although, however)',
    ],
    topics: [
      'Viagens e turismo',
      'Cultura e entretenimento',
      'Meio ambiente',
      'Tecnologia básica',
      'Relacionamentos',
      'Experiências pessoais',
      'Planos e projetos',
    ],
    color: '#eab308',
    icon: '🌻',
    xpToAdvance: 2500,
  },

  B2: {
    level: 'B2',
    label: 'Intermediário Avançado',
    description: 'Comunicação fluente sobre temas abstratos e técnicos',
    startsAtLesson: 80,
    vocabSize: 3500,
    maxSentenceLength: 25,
    questionTypes: ['fill_blank', 'multiple_choice', 'describe', 'compare', 'argue', 'correct_error', 'pronunciation', 'listening', 'open_conversation'],
    grammarStructures: [
      'Condicionais tipo 2 e 3',
      'Discurso indireto (reported speech)',
      'Voz passiva complexa',
      'Gerúndios e infinitivos',
      'Phrasal verbs comuns',
      'Artigos com nomes abstratos',
      'Inversão para ênfase',
    ],
    topics: [
      'Política e sociedade',
      'Economia e negócios',
      'Ciência e tecnologia',
      'Arte e literatura',
      'Questões ambientais',
      'Saúde e bem-estar',
      'Ética e filosofia básica',
    ],
    color: '#f97316',
    icon: '🌳',
    xpToAdvance: 5000,
  },

  C1: {
    level: 'C1',
    label: 'Avançado',
    description: 'Expressão fluente e espontânea com precisão',
    startsAtLesson: 130,
    vocabSize: 8000,
    maxSentenceLength: 35,
    questionTypes: ['correct_error', 'open_conversation', 'paraphrase', 'argue', 'pronunciation', 'listening', 'debate'],
    grammarStructures: [
      'Estruturas complexas de ênfase (cleft sentences)',
      'Subjuntivo e formas hipotéticas',
      'Coesão textual avançada',
      'Registro formal e informal',
      'Expressões idiomáticas',
      'Nuances de modalidade',
      'Estruturas de nominalização',
    ],
    topics: [
      'Filosofia e ética',
      'Literatura e análise crítica',
      'Política internacional',
      'Ciência avançada',
      'Humor e ironia cultural',
      'Linguagem acadêmica',
      'Negociação e persuasão',
    ],
    color: '#8b5cf6',
    icon: '🦅',
    xpToAdvance: 10000,
  },

  C2: {
    level: 'C2',
    label: 'Proficiente / Nativo',
    description: 'Domínio completo — equivalente a um falante nativo culto',
    startsAtLesson: 180,
    vocabSize: 20000,
    maxSentenceLength: 50,
    questionTypes: ['open_conversation', 'debate', 'paraphrase', 'correct_error', 'pronunciation', 'listening'],
    grammarStructures: [
      'Todas as estruturas gramaticais',
      'Variações dialetais e regionais',
      'Linguagem literária e poética',
      'Gírias e linguagem coloquial',
      'Linguagem técnica especializada',
      'Sutilezas pragmáticas',
    ],
    topics: [
      'Qualquer tema sem restrição',
      'Debates filosóficos complexos',
      'Análise literária profunda',
      'Política e diplomacia',
      'Humor sofisticado e ironia',
      'Linguagem de especialidade',
    ],
    color: '#ec4899',
    icon: '👑',
    xpToAdvance: 0, // Nível máximo
  },
};

// ============================================================
// BANCO DE PERGUNTAS PROGRESSIVAS
// ============================================================

export interface LessonQuestion {
  id: string;
  level: CEFRLevel;
  type: QuestionType;
  topic: string;
  /** Pergunta em inglês (idioma alvo) */
  question: string;
  /** Contexto/instrução em pt-BR (idioma nativo) */
  instruction: string;
  /** Resposta correta */
  correctAnswer: string;
  /** Respostas alternativas (para múltipla escolha) */
  options?: string[];
  /** Explicação da resposta */
  explanation: string;
  /** Dica se o aluno errar */
  hint: string;
  /** Pontos XP por acerto */
  xp: number;
}

export const LESSON_QUESTIONS: LessonQuestion[] = [

  // ─── A1: SIM/NÃO ─────────────────────────────────────────
  {
    id: 'a1_yn_001',
    level: 'A1',
    type: 'yes_no',
    topic: 'Objetos',
    question: 'Is this a book?',
    instruction: 'Olhe para a imagem. Responda sim ou não.',
    correctAnswer: 'Yes, it is.',
    options: ['Yes, it is.', 'No, it isn\'t.'],
    explanation: 'Para responder sim: "Yes, it is." Para não: "No, it isn\'t."',
    hint: 'Use "Yes, it is" para confirmar ou "No, it isn\'t" para negar.',
    xp: 10,
  },
  {
    id: 'a1_yn_002',
    level: 'A1',
    type: 'yes_no',
    topic: 'Família',
    question: 'Is she your mother?',
    instruction: 'Responda sobre a pessoa na imagem.',
    correctAnswer: 'Yes, she is.',
    options: ['Yes, she is.', 'No, she isn\'t.'],
    explanation: '"She" é usado para mulheres. "Yes, she is" confirma.',
    hint: 'Para mulheres use "she". Para homens use "he".',
    xp: 10,
  },

  // ─── A1: IDENTIFICAR OBJETO ───────────────────────────────
  {
    id: 'a1_id_001',
    level: 'A1',
    type: 'identify_object',
    topic: 'Objetos do cotidiano',
    question: 'What is this?',
    instruction: 'O que é este objeto? Escolha a resposta correta.',
    correctAnswer: 'It is a pen.',
    options: ['It is a pen.', 'It is a book.', 'It is a chair.', 'It is a table.'],
    explanation: '"Pen" = caneta. "It is a pen" = É uma caneta.',
    hint: 'Use "It is a..." para identificar objetos.',
    xp: 15,
  },
  {
    id: 'a1_id_002',
    level: 'A1',
    type: 'identify_object',
    topic: 'Cores',
    question: 'What color is this?',
    instruction: 'Qual é a cor? Escolha a resposta.',
    correctAnswer: 'It is red.',
    options: ['It is red.', 'It is blue.', 'It is green.', 'It is yellow.'],
    explanation: '"Red" = vermelho. As cores em inglês não têm artigo.',
    hint: 'As cores: red, blue, green, yellow, white, black, orange, purple.',
    xp: 15,
  },

  // ─── A1: TRADUÇÃO ─────────────────────────────────────────
  {
    id: 'a1_tr_001',
    level: 'A1',
    type: 'translate',
    topic: 'Saudações',
    question: 'Como se diz "Bom dia" em inglês?',
    instruction: 'Escolha a tradução correta.',
    correctAnswer: 'Good morning',
    options: ['Good morning', 'Good night', 'Good afternoon', 'Good evening'],
    explanation: '"Good morning" = Bom dia (até ao meio-dia). "Good afternoon" = Boa tarde. "Good evening" = Boa noite (ao chegar). "Good night" = Boa noite (ao ir dormir).',
    hint: '"Morning" = manhã. Então "Good morning" = Bom dia.',
    xp: 10,
  },
  {
    id: 'a1_tr_002',
    level: 'A1',
    type: 'translate',
    topic: 'Números',
    question: 'What is "quinze" in English?',
    instruction: 'Traduza o número.',
    correctAnswer: 'fifteen',
    options: ['thirteen', 'fourteen', 'fifteen', 'sixteen'],
    explanation: '13=thirteen, 14=fourteen, 15=fifteen, 16=sixteen.',
    hint: 'Os números de 13 a 19 terminam em "-teen".',
    xp: 10,
  },

  // ─── A2: FRASES SIMPLES ───────────────────────────────────
  {
    id: 'a2_sp_001',
    level: 'A2',
    type: 'simple_phrase',
    topic: 'Rotina diária',
    question: 'Tell me about your morning routine.',
    instruction: 'Descreva sua rotina matinal com frases simples.',
    correctAnswer: 'I wake up at seven. I brush my teeth. I have breakfast.',
    options: [
      'I wake up at seven. I brush my teeth. I have breakfast.',
      'I woke up at seven. I brushed my teeth. I had breakfast.',
      'I am waking up at seven. I am brushing my teeth.',
      'Wake up seven. Brush teeth. Have breakfast.',
    ],
    explanation: 'Para rotinas use o presente simples: I wake up, I brush, I have.',
    hint: 'Rotinas = presente simples. Não use "-ing" para hábitos.',
    xp: 20,
  },
  {
    id: 'a2_fb_001',
    level: 'A2',
    type: 'fill_blank',
    topic: 'Presente contínuo',
    question: 'She ___ (read) a book right now.',
    instruction: 'Complete com a forma correta do verbo.',
    correctAnswer: 'is reading',
    options: ['reads', 'is reading', 'read', 'was reading'],
    explanation: '"Right now" indica presente contínuo: to be + verbo-ing. She IS READING.',
    hint: '"Right now" = agora mesmo → presente contínuo (is/am/are + -ing).',
    xp: 20,
  },

  // ─── B1: DESCREVER ────────────────────────────────────────
  {
    id: 'b1_desc_001',
    level: 'B1',
    type: 'describe',
    topic: 'Viagens',
    question: 'Describe your ideal vacation. Where would you go and what would you do?',
    instruction: 'Descreva suas férias ideais em 3-4 frases.',
    correctAnswer: 'I would go to Japan. I would visit Tokyo and Kyoto. I would try traditional food and see the temples.',
    options: [
      'I would go to Japan. I would visit Tokyo and Kyoto. I would try traditional food.',
      'I will go to Japan. I visit Tokyo. I try food.',
      'I went to Japan. I visited Tokyo. I tried food.',
      'Japan is my favorite. Tokyo is big. Food is good.',
    ],
    explanation: 'Para situações hipotéticas/ideais use "would + infinitive".',
    hint: 'Férias ideais = situação hipotética → use "would" (I would go, I would visit).',
    xp: 35,
  },

  // ─── B1: COMPARAR ─────────────────────────────────────────
  {
    id: 'b1_comp_001',
    level: 'B1',
    type: 'compare',
    topic: 'Tecnologia',
    question: 'Compare living in a city and living in the countryside.',
    instruction: 'Compare as duas opções usando "while", "whereas" ou "on the other hand".',
    correctAnswer: 'Cities offer more job opportunities, while the countryside is quieter and more peaceful.',
    options: [
      'Cities offer more job opportunities, while the countryside is quieter and more peaceful.',
      'City is good. Countryside is also good.',
      'I like city more than countryside because it is bigger.',
      'The city has many things. The countryside has nature.',
    ],
    explanation: '"While" e "whereas" conectam contrastes. Use adjetivos comparativos: quieter, more peaceful.',
    hint: 'Use "while" ou "whereas" para contrastar: "Cities are busy, while the countryside is calm."',
    xp: 40,
  },

  // ─── B2: ARGUMENTAR ──────────────────────────────────────
  {
    id: 'b2_arg_001',
    level: 'B2',
    type: 'argue',
    topic: 'Sociedade',
    question: 'Do you think social media has a positive or negative effect on society? Give reasons.',
    instruction: 'Argumente sua posição com pelo menos 2 razões.',
    correctAnswer: 'Social media has both positive and negative effects. On one hand, it connects people globally. On the other hand, it can lead to addiction and misinformation.',
    options: [
      'Social media has both positive and negative effects. On one hand, it connects people globally. On the other hand, it can lead to addiction and misinformation.',
      'Social media is bad because people use it too much.',
      'I think social media is good. People can talk to friends.',
      'Social media has effects on society. Some are good, some are bad.',
    ],
    explanation: 'Use "on one hand... on the other hand" para argumentos balanceados. Apresente evidências.',
    hint: 'Estrutura: "On one hand... On the other hand..." Dê exemplos concretos.',
    xp: 50,
  },

  // ─── B2: CORRIGIR ERRO ────────────────────────────────────
  {
    id: 'b2_err_001',
    level: 'B2',
    type: 'correct_error',
    topic: 'Gramática',
    question: 'Find and correct the error: "If I would have more time, I will learn piano."',
    instruction: 'Encontre o erro e corrija a frase.',
    correctAnswer: 'If I had more time, I would learn piano.',
    options: [
      'If I had more time, I would learn piano.',
      'If I have more time, I will learn piano.',
      'If I would have more time, I would learn piano.',
      'If I had more time, I will learn piano.',
    ],
    explanation: 'Condicional tipo 2: "If + past simple, would + infinitive". Nunca use "would" na cláusula "if".',
    hint: 'Tipo 2: If + PAST SIMPLE, WOULD + infinitive. Nunca "would" no "if".',
    xp: 55,
  },

  // ─── C1: PARAFRASEAR ─────────────────────────────────────
  {
    id: 'c1_par_001',
    level: 'C1',
    type: 'paraphrase',
    topic: 'Linguagem formal',
    question: 'Paraphrase this sentence using a more formal register: "The boss fired a lot of people."',
    instruction: 'Reformule a frase em linguagem formal/acadêmica.',
    correctAnswer: 'The company underwent significant workforce reductions, resulting in numerous redundancies.',
    options: [
      'The company underwent significant workforce reductions, resulting in numerous redundancies.',
      'The manager dismissed many employees.',
      'A lot of workers lost their jobs.',
      'The company let go of many staff members.',
    ],
    explanation: '"Fired" (informal) → "dismissed/made redundant" (formal). "A lot of" → "numerous/significant".',
    hint: 'Substitua palavras informais por formais: fired→dismissed, a lot→numerous, boss→management.',
    xp: 70,
  },

  // ─── C2: DEBATE ───────────────────────────────────────────
  {
    id: 'c2_deb_001',
    level: 'C2',
    type: 'debate',
    topic: 'Filosofia',
    question: 'Discuss the ethical implications of artificial intelligence replacing human workers. Consider economic, social, and philosophical dimensions.',
    instruction: 'Desenvolva um argumento multidimensional com nuance e precisão linguística.',
    correctAnswer: 'The displacement of human labor by AI raises profound ethical questions that transcend mere economic considerations. While proponents argue that automation liberates humanity from drudgery, critics contend that it fundamentally undermines human dignity and social cohesion.',
    options: [
      'The displacement of human labor by AI raises profound ethical questions that transcend mere economic considerations.',
      'AI replacing workers is bad because people need jobs.',
      'Artificial intelligence is good and bad for workers.',
      'We should think carefully about AI and jobs.',
    ],
    explanation: 'C2 requer: vocabulário sofisticado, estruturas complexas, nuance argumentativa, coesão textual avançada.',
    hint: 'Use: "raises profound questions", "transcend mere", "proponents argue... critics contend".',
    xp: 100,
  },
];

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/** Retorna o nível CEFR baseado no número da lição */
export function getLevelByLesson(lessonNumber: number): CEFRLevel {
  if (lessonNumber >= 180) return 'C2';
  if (lessonNumber >= 130) return 'C1';
  if (lessonNumber >= 80) return 'B2';
  if (lessonNumber >= 40) return 'B1';
  if (lessonNumber >= 15) return 'A2';
  return 'A1';
}

/** Retorna o nível CEFR baseado no XP total */
export function getLevelByXP(totalXP: number): CEFRLevel {
  if (totalXP >= 19200) return 'C2';
  if (totalXP >= 9200) return 'C1';
  if (totalXP >= 4200) return 'B2';
  if (totalXP >= 1700) return 'B1';
  if (totalXP >= 500) return 'A2';
  return 'A1';
}

/**
 * Converte rótulos usados por modalidades de prática no nível CEFR canônico.
 * Aceita os seis níveis explícitos e os três agrupamentos visíveis ao aluno.
 */
export function resolvePracticeCEFRLevel(level?: string): CEFRLevel {
  const normalized = level?.trim().toUpperCase().replace(/[_\s-]+/g, "_");
  if (normalized === 'A1' || normalized === 'A2' || normalized === 'B1' || normalized === 'B2' || normalized === 'C1' || normalized === 'C2') {
    return normalized;
  }
  if (normalized === 'BASIC' || normalized === 'A2') return 'A2';
  if (normalized === 'INTERMEDIATE' || normalized === 'B1') return 'B1';
  if (normalized === 'UPPER_INTERMEDIATE' || normalized === 'B2') return 'B2';
  if (normalized === 'ADVANCED' || normalized === 'C1') return 'C1';
  if (normalized === 'PROFICIENT' || normalized === 'C2') return 'C2';
  if (normalized === 'SCIENTIFIC') return 'C2'; // compatibilidade com preferência antiga, sem criar nível fora do CEFR
  return 'A1';
}

/** Retorna perguntas filtradas por nível */
export function getQuestionsByLevel(level: CEFRLevel): LessonQuestion[] {
  return LESSON_QUESTIONS.filter(q => q.level === level);
}

/** Retorna perguntas filtradas por tipo */
export function getQuestionsByType(type: QuestionType): LessonQuestion[] {
  return LESSON_QUESTIONS.filter(q => q.type === type);
}

/** Retorna perguntas disponíveis para um nível (inclui níveis anteriores) */
export function getAvailableQuestions(level: CEFRLevel): LessonQuestion[] {
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const maxIndex = order.indexOf(level);
  return LESSON_QUESTIONS.filter(q => order.indexOf(q.level) <= maxIndex);
}

/** Retorna a configuração do nível atual */
export function getLevelConfig(level: CEFRLevel): LevelConfig {
  return CEFR_LEVELS[level];
}

/** Calcula o progresso dentro do nível atual */
export function getLevelProgress(totalXP: number): { level: CEFRLevel; progress: number; xpInLevel: number; xpNeeded: number } {
  const level = getLevelByXP(totalXP);
  const config = CEFR_LEVELS[level];
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const prevIndex = order.indexOf(level) - 1;
  const prevXP = prevIndex >= 0 ? Object.values(CEFR_LEVELS).slice(0, prevIndex + 1).reduce((sum, l) => sum + l.xpToAdvance, 0) : 0;
  const xpInLevel = totalXP - prevXP;
  const xpNeeded = config.xpToAdvance || 1;
  const progress = level === 'C2' ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  return { level, progress, xpInLevel, xpNeeded };
}

/** Retorna perguntas aleatórias para uma sessão de prática */
export function getSessionQuestions(level: CEFRLevel, count: number = 10): LessonQuestion[] {
  const available = getAvailableQuestions(level);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default CEFR_LEVELS;
