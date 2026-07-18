import { invokeLLM } from "./_core/llm";

/**
 * Sistema de Frases Vivas - Modelo Base do Documento Mestre
 * Mínimo 5.000 frases por idioma com microlearning
 */

export interface LivePhrase {
  id: string;
  text: string;
  translation: string;
  audioUrl: string;
  context: string;
  register: 'formal' | 'informal' | 'neutral';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'daily' | 'professional' | 'technical' | 'cultural';
  targetAge: 'children' | 'teens' | 'adults' | 'all';
  semanticVector?: number[]; // Para busca semântica
  relatedPhrases?: string[]; // IDs de frases relacionadas
  difficulty: number; // 1-10
  frequency: number; // Frequência de uso na língua
}

export interface MicroLesson {
  id: string;
  title: string;
  duration: number; // 3-5 minutos
  phrases: LivePhrase[];
  exercises: {
    type: 'listen' | 'speak' | 'translate' | 'complete';
    phraseId: string;
    question: string;
    answer: string;
  }[];
  nextReviewDate?: Date; // Para repetição espaçada (SRS)
}

/**
 * Gera 5.000+ frases para um idioma
 */
export async function generateMassivePhrases(params: {
  languageCode: string;
  targetCount?: number;
}): Promise<LivePhrase[]> {
  const { languageCode, targetCount = 5000 } = params;

  const categories = [
    { name: 'daily', count: 2000, description: 'Frases cotidianas' },
    { name: 'professional', count: 1500, description: 'Ambiente profissional' },
    { name: 'technical', count: 1000, description: 'Termos técnicos' },
    { name: 'cultural', count: 500, description: 'Expressões culturais' },
  ];

  const allPhrases: LivePhrase[] = [];

  for (const category of categories) {
    console.log(`Gerando ${category.count} frases de ${category.name}...`);

    const batchSize = 100; // Gerar 100 frases por vez
    const batches = Math.ceil(category.count / batchSize);

    for (let i = 0; i < batches; i++) {
      const phrases = await generatePhraseBatch({
        languageCode,
        category: category.name as any,
        count: Math.min(batchSize, category.count - i * batchSize),
        description: category.description,
      });

      allPhrases.push(...phrases);
      console.log(`✅ ${allPhrases.length}/${targetCount} frases geradas`);
    }
  }

  return allPhrases;
}

/**
 * Gera um lote de frases com IA
 */
async function generatePhraseBatch(params: {
  languageCode: string;
  category: 'daily' | 'professional' | 'technical' | 'cultural';
  count: number;
  description: string;
}): Promise<LivePhrase[]> {
  const { languageCode, category, count, description } = params;

  const prompt = `Generate ${count} practical phrases in ${languageCode} for ${description}.

Requirements:
- Natural, commonly used phrases
- Mix of formal and informal register
- Cover all CEFR levels (A1 to C2)
- Include context for each phrase
- Provide Portuguese translation
- Indicate difficulty (1-10) and frequency (1-10)

Return JSON array with this structure:
[
  {
    "text": "Phrase in target language",
    "translation": "Tradução em português",
    "context": "When/where to use this phrase",
    "register": "formal|informal|neutral",
    "level": "A1|A2|B1|B2|C1|C2",
    "category": "${category}",
    "targetAge": "children|teens|adults|all",
    "difficulty": 5,
    "frequency": 8
  }
]`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert linguist creating practical language learning content. Generate diverse, authentic phrases that native speakers actually use."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0].message.content || "[]";
  const phrasesData = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

  return phrasesData.map((p: any, idx: number) => ({
    id: `phrase_${languageCode}_${category}_${Date.now()}_${idx}`,
    text: p.text,
    translation: p.translation,
    audioUrl: `/audio/phrases/${languageCode}/${p.text.toLowerCase().replace(/\s+/g, '_')}.mp3`,
    context: p.context,
    register: p.register,
    level: p.level,
    category: p.category,
    targetAge: p.targetAge,
    difficulty: p.difficulty,
    frequency: p.frequency,
  }));
}

/**
 * Cria micro-lição de 3-5 minutos
 */
export async function createMicroLesson(params: {
  languageCode: string;
  level: string;
  topic?: string;
}): Promise<MicroLesson> {
  const { languageCode, level, topic } = params;

  // Selecionar 5-7 frases relacionadas
  // TODO: Buscar do banco de dados
  const phrases: LivePhrase[] = [];

  // Gerar exercícios baseados nas frases
  const exercises = phrases.flatMap(phrase => [
    {
      type: 'listen' as const,
      phraseId: phrase.id,
      question: `Ouça e repita: "${phrase.text}"`,
      answer: phrase.text,
    },
    {
      type: 'translate' as const,
      phraseId: phrase.id,
      question: `Traduza: "${phrase.text}"`,
      answer: phrase.translation,
    },
  ]);

  return {
    id: `micro_${Date.now()}`,
    title: topic || `${level} - Prática Rápida`,
    duration: 4, // 4 minutos
    phrases,
    exercises,
  };
}

/**
 * Algoritmo de Repetição Espaçada (SRS)
 * Baseado no algoritmo SuperMemo/Anki
 */
export function calculateNextReview(params: {
  currentInterval: number; // dias
  ease: number; // fator de facilidade (1.3 - 2.5)
  quality: number; // qualidade da resposta (0-5)
}): { nextInterval: number; newEase: number } {
  const { currentInterval, ease, quality } = params;

  // Fórmula SuperMemo SM-2
  let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (newEase < 1.3) newEase = 1.3;
  if (newEase > 2.5) newEase = 2.5;

  let nextInterval: number;

  if (quality < 3) {
    // Resposta ruim - reiniciar
    nextInterval = 1;
  } else {
    // Resposta boa - aumentar intervalo
    if (currentInterval === 0) {
      nextInterval = 1;
    } else if (currentInterval === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(currentInterval * newEase);
    }
  }

  return { nextInterval, newEase };
}

/**
 * Obter próximas frases para revisão
 */
export async function getPhrasesForReview(params: {
  userId: number;
  languageCode: string;
  limit?: number;
}): Promise<LivePhrase[]> {
  // TODO: Buscar do banco de dados frases que precisam revisão
  // Ordenar por: 1) Vencidas, 2) Dificuldade, 3) Frequência
  return [];
}
