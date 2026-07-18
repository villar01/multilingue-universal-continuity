import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { lessons, exercises, courses } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';

const DATABASE_URL = process.env.DATABASE_URL!;

// ============================================================
// CONFIGURAÇÃO DE GERAÇÃO MASSIVA
// ============================================================

const LESSON_TOPICS = [
  // A1 - Beginner
  { level: 'A1', topic: 'Greetings and Introductions', description: 'Learn basic greetings and how to introduce yourself' },
  { level: 'A1', topic: 'My Family', description: 'Talk about family members and relationships' },
  { level: 'A1', topic: 'At the Restaurant', description: 'Order food and interact with waiters' },
  { level: 'A1', topic: 'Daily Routine', description: 'Describe your daily activities and schedule' },
  { level: 'A1', topic: 'Shopping for Clothes', description: 'Buy clothes and ask about sizes and prices' },
  { level: 'A1', topic: 'At the Doctor', description: 'Describe symptoms and understand medical advice' },
  { level: 'A1', topic: 'Asking for Directions', description: 'Navigate and ask for help finding places' },
  { level: 'A1', topic: 'Weather and Seasons', description: 'Talk about weather conditions and seasons' },
  { level: 'A1', topic: 'Hobbies and Free Time', description: 'Discuss leisure activities and interests' },
  { level: 'A1', topic: 'At the Hotel', description: 'Check in, make requests, and solve problems' },
  
  // A2 - Elementary
  { level: 'A2', topic: 'Planning a Trip', description: 'Organize travel plans and discuss destinations' },
  { level: 'A2', topic: 'At the Airport', description: 'Navigate airport procedures and boarding' },
  { level: 'A2', topic: 'Making Friends', description: 'Start conversations and build relationships' },
  { level: 'A2', topic: 'Job Interview', description: 'Prepare for and conduct a job interview' },
  { level: 'A2', topic: 'Renting an Apartment', description: 'Find and rent accommodation' },
  { level: 'A2', topic: 'At the Bank', description: 'Open accounts and manage finances' },
  { level: 'A2', topic: 'Celebrating Holidays', description: 'Learn about cultural celebrations' },
  { level: 'A2', topic: 'Sports and Exercise', description: 'Discuss fitness and sports activities' },
  { level: 'A2', topic: 'Technology and Gadgets', description: 'Talk about devices and digital life' },
  { level: 'A2', topic: 'Cooking and Recipes', description: 'Follow recipes and cooking instructions' },
  
  // B1 - Intermediate
  { level: 'B1', topic: 'Environmental Issues', description: 'Discuss climate change and sustainability' },
  { level: 'B1', topic: 'Education System', description: 'Compare educational approaches' },
  { level: 'B1', topic: 'Health and Wellness', description: 'Maintain healthy lifestyle habits' },
  { level: 'B1', topic: 'Social Media Impact', description: 'Analyze digital communication effects' },
  { level: 'B1', topic: 'Career Development', description: 'Plan professional growth strategies' },
  { level: 'B1', topic: 'Cultural Differences', description: 'Navigate cross-cultural situations' },
  { level: 'B1', topic: 'News and Current Events', description: 'Discuss global happenings' },
  { level: 'B1', topic: 'Art and Literature', description: 'Appreciate creative works' },
  { level: 'B1', topic: 'Transportation Systems', description: 'Compare urban mobility solutions' },
  { level: 'B1', topic: 'Consumer Rights', description: 'Handle complaints and returns' },
  
  // B2 - Upper Intermediate
  { level: 'B2', topic: 'Business Negotiations', description: 'Conduct professional discussions' },
  { level: 'B2', topic: 'Scientific Discoveries', description: 'Understand research breakthroughs' },
  { level: 'B2', topic: 'Political Systems', description: 'Compare governance structures' },
  { level: 'B2', topic: 'Economic Trends', description: 'Analyze market developments' },
  { level: 'B2', topic: 'Legal Procedures', description: 'Navigate legal situations' },
  { level: 'B2', topic: 'Psychological Concepts', description: 'Discuss human behavior patterns' },
  { level: 'B2', topic: 'Historical Events', description: 'Analyze past influences on present' },
  { level: 'B2', topic: 'Philosophical Debates', description: 'Explore ethical questions' },
  { level: 'B2', topic: 'Artificial Intelligence', description: 'Discuss AI implications' },
  { level: 'B2', topic: 'Global Trade', description: 'Understand international commerce' },
  
  // C1 - Advanced
  { level: 'C1', topic: 'Academic Research Methods', description: 'Conduct scholarly investigations' },
  { level: 'C1', topic: 'Literary Analysis', description: 'Critique complex texts' },
  { level: 'C1', topic: 'Advanced Negotiations', description: 'Handle high-stakes discussions' },
  { level: 'C1', topic: 'Technical Documentation', description: 'Write precise specifications' },
  { level: 'C1', topic: 'Public Speaking', description: 'Deliver persuasive presentations' },
  
  // C2 - Proficiency
  { level: 'C2', topic: 'Diplomatic Communication', description: 'Navigate sensitive international relations' },
  { level: 'C2', topic: 'Complex Legal Arguments', description: 'Construct sophisticated legal reasoning' },
  { level: 'C2', topic: 'Advanced Scientific Discourse', description: 'Discuss cutting-edge research' },
  { level: 'C2', topic: 'Cultural Critique', description: 'Analyze societal phenomena deeply' },
  { level: 'C2', topic: 'Strategic Leadership', description: 'Guide organizational transformation' },
];

// ============================================================
// FUNÇÃO DE GERAÇÃO COM IA
// ============================================================

async function generateLessonWithAI(topic: typeof LESSON_TOPICS[0], languageCode: string = 'en-US') {
  console.log(`\n🤖 Gerando lição: "${topic.topic}" (${topic.level})...`);
  
  const prompt = `You are an expert language teacher creating a ${topic.level} level lesson on "${topic.topic}".

Generate a complete INTERMEDIATE level lesson (B1/B2) with:

1. **Story** (350-450 words): Write a sophisticated, engaging story with complex narrative structure. Use intermediate vocabulary, idioms, and natural expressions. Include dialogue, descriptions, and varied sentence structures appropriate for B1/B2 level.

2. **Vocabulary** (10 words): Select 10 intermediate/advanced words from the story with:
   - Word
   - Translation to Portuguese
   - IPA phonetic notation
   - Part of speech
   - Example sentence

3. **Grammar** (3 points): Explain 3 INTERMEDIATE grammar concepts used in the story with:
   - Title
   - Clear explanation in Portuguese
   - 4 example sentences with translations
   - Detailed rule summary
   - Common mistakes to avoid
   
   Focus on B1/B2 grammar: passive voice, conditionals (2nd/3rd), perfect tenses, reported speech, relative clauses, modal verbs for deduction.

4. **Exercises** (7 questions): Create 7 CHALLENGING contextual exercises based on the story:
   - 4 multiple_choice (type: "multiple_choice", 4 options each) - require inference and critical thinking
   - 2 fill_blank (type: "fill_blank", no options array) - test grammar and vocabulary
   - 1 multiple_choice (type: "multiple_choice") - comprehension question requiring analysis
   
Each exercise must reference specific details from the story.
IMPORTANT: Use ONLY these exact type values: "multiple_choice" or "fill_blank"

Return ONLY valid JSON (no markdown, no code blocks):
{
  "story": "...",
  "vocabulary": [
    {
      "word": "...",
      "translation": "...",
      "phonetic": "/ˈfæməli/",
      "partOfSpeech": "noun",
      "example": "..."
    }
  ],
  "grammar": [
    {
      "title": "...",
      "explanation": "...",
      "examples": ["...", "...", "..."],
      "rule": "..."
    }
  ],
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "..."
    },
    {
      "type": "fill_blank",
      "question": "Complete: The ___ is very important.",
      "correctAnswer": "family"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are an expert language teacher. Always return valid JSON without markdown code blocks.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'lesson_content',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              story: { type: 'string' },
              vocabulary: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: { type: 'string' },
                    translation: { type: 'string' },
                    phonetic: { type: 'string' },
                    partOfSpeech: { type: 'string' },
                    example: { type: 'string' }
                  },
                  required: ['word', 'translation', 'phonetic', 'partOfSpeech', 'example'],
                  additionalProperties: false
                }
              },
              grammar: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    explanation: { type: 'string' },
                    examples: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    rule: { type: 'string' }
                  },
                  required: ['title', 'explanation', 'examples', 'rule'],
                  additionalProperties: false
                }
              },
              exercises: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    question: { type: 'string' },
                    options: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    correctAnswer: { type: 'string' }
                  },
                  required: ['type', 'question', 'correctAnswer'],
                  additionalProperties: false
                }
              }
            },
            required: ['story', 'vocabulary', 'grammar', 'exercises'],
            additionalProperties: false
          }
        }
      }
    });

    const content = (response.choices[0].message.content as string);
    if (!content) throw new Error('Resposta vazia da IA');
    
    const lessonData = JSON.parse(content);
    console.log(`✅ Lição gerada com sucesso!`);
    
    return {
      title: topic.topic,
      description: topic.description,
      level: topic.level,
      ...lessonData
    };
    
  } catch (error) {
    console.error(`❌ Erro ao gerar lição:`, error);
    throw error;
  }
}

// ============================================================
// FUNÇÃO PRINCIPAL - GERAÇÃO MASSIVA
// ============================================================

async function generateMassiveLessons(count: number = 50) {
  console.log(`🚀 Iniciando geração massiva de ${count} lições com IA...\n`);
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // 1. Buscar curso de inglês
    const [englishCourse] = await db.select()
      .from(courses)
      .where(eq(courses.languageId, 1))
      .limit(1);
    
    if (!englishCourse) {
      throw new Error('Curso de inglês não encontrado');
    }
    
    console.log(`✅ Curso: ${englishCourse.title} (ID: ${englishCourse.id})\n`);
    
    // 2. Selecionar tópicos para gerar
    const topicsToGenerate = LESSON_TOPICS.slice(0, count);
    let successCount = 0;
    let errorCount = 0;
    
    // 3. Gerar lições em lote
    for (let i = 0; i < topicsToGenerate.length; i++) {
      const topic = topicsToGenerate[i];
      
      try {
        console.log(`\n[${i + 1}/${topicsToGenerate.length}] Gerando: ${topic.topic} (${topic.level})`);
        
        // FIXED BUG #3: Check if lesson already exists before generating (saves tokens + cost)
        const existingLesson = await db.select({ id: lessons.id })
          .from(lessons)
          .where(eq(lessons.title, topic.topic))
          .limit(1);
        if (existingLesson.length > 0) {
          console.log(`[Lesson] Skipping '${topic.topic}' - already exists (id=${existingLesson[0].id})`);
          successCount++;
          continue;
        }
        
        // Gerar conteúdo com IA (only if lesson doesn't exist)
        const lessonData = await generateLessonWithAI(topic);
        
        // Calcular difficultyScore baseado no nível
        const difficultyMap: Record<string, number> = {
          'A1': 0.2, 'A2': 0.4, 'B1': 0.6, 'B2': 0.75, 'C1': 0.9, 'C2': 1.0
        };
        const difficultyScore = difficultyMap[topic.level] || 0.5;
        
        // Inserir lição no banco
        const [lessonResult] = await connection.execute(`INSERT INTO lessons (
            courseId, title, description, orderIndex, content,
            vocabulary, grammar, estimatedMinutes, difficultyScore,
            languageCode, storyText, vocabularyDetailed, grammarDetailed
          ) VALUES (${englishCourse.id}, ${lessonData.title}, ${lessonData.description}, ${i + 1}, ${lessonData.story}, ${JSON.stringify(lessonData.vocabulary.map((v: any) => v.word))}, ${JSON.stringify(lessonData.grammar.map((g: any) => g.title))}, ${20}, ${difficultyScore}, ${'en-US'}, ${lessonData.story}, ${JSON.stringify(lessonData.vocabulary)}, ${JSON.stringify(lessonData.grammar)})`);
        
        const lessonId = (lessonResult as any).insertId;
        
        // Inserir exercícios
        for (let j = 0; j < lessonData.exercises.length; j++) {
          const exercise = lessonData.exercises[j];
          const opts = JSON.stringify(exercise.options || []).replace(/'/g, "''");
          const q = (exercise.question || '').replace(/'/g, "''");
          const ca = (exercise.correctAnswer || '').replace(/'/g, "''");
          await connection.execute(`INSERT INTO exercises (
              lessonId, type, question, options, correctAnswer, orderIndex
            ) VALUES (${lessonId}, '${exercise.type}', '${q}', '${opts}', '${ca}', ${j + 1})`
          );
        }
        
        console.log(`✅ Lição ${lessonId} criada com ${lessonData.exercises.length} exercícios`);
        successCount++;
        
        // Aguardar 2 segundos entre gerações para não sobrecarregar a API
        if (i < topicsToGenerate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Erro ao gerar "${topic.topic}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 GERAÇÃO MASSIVA CONCLUÍDA!`);
    console.log(`   ✅ Sucesso: ${successCount} lições`);
    console.log(`   ❌ Erros: ${errorCount} lições`);
    console.log(`   📊 Taxa de sucesso: ${Math.round((successCount / topicsToGenerate.length) * 100)}%\n`);
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO FATAL:', error);
    await connection.end();
    process.exit(1);
  }
}

// Executar geração massiva
const lessonCount = parseInt(process.argv[2] || '50');
generateMassiveLessons(lessonCount);
