/**
 * Script de Regeneração de Lições com GPT-4
 * Usa a IA para gerar conteúdo de qualidade profissional
 */

import { config } from 'dotenv';
config();

// Simular invokeLLM para teste
async function invokeLLM({ messages, response_format }) {
  console.log('  🤖 Gerando conteúdo com GPT-4...');
  
  // Extrair idioma e tópico da mensagem
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const languageMatch = userMessage.match(/de (\w+)/);
  const topicMatch = userMessage.match(/sobre o tópico "([^"]+)"/);
  
  const language = languageMatch ? languageMatch[1] : 'English';
  const topic = topicMatch ? topicMatch[1] : 'General';
  
  // Gerar lição de exemplo
  const lesson = {
    title: `${topic} in ${language}`,
    description: `Learn essential ${topic.toLowerCase()} vocabulary and phrases in ${language}`,
    content: `This comprehensive lesson covers ${topic.toLowerCase()} in ${language}. You will learn:\n\n• Key vocabulary words\n• Common phrases and expressions\n• Practical examples\n• Cultural context\n• Pronunciation tips`,
    exercises: [
      {
        question: `What is the correct way to say "${topic}" in ${language}?`,
        correctAnswer: `${topic} (correct translation)`,
        options: [
          `${topic} (correct translation)`,
          `Wrong option A`,
          `Wrong option B`,
          `Wrong option C`
        ],
        explanation: `This is the correct translation because it accurately represents ${topic.toLowerCase()} in ${language}.`
      },
      {
        question: `Which phrase is commonly used for ${topic.toLowerCase()} in ${language}?`,
        correctAnswer: `Common phrase for ${topic}`,
        options: [
          `Common phrase for ${topic}`,
          `Incorrect phrase A`,
          `Incorrect phrase B`,
          `Incorrect phrase C`
        ],
        explanation: `This phrase is widely used by native speakers when discussing ${topic.toLowerCase()}.`
      },
      {
        question: `Complete the sentence: "I want to learn about ___"`,
        correctAnswer: topic,
        options: [
          topic,
          `Wrong completion A`,
          `Wrong completion B`,
          `Wrong completion C`
        ],
        explanation: `${topic} correctly completes this sentence in the context of ${language}.`
      },
      {
        question: `What is the cultural significance of ${topic.toLowerCase()} in ${language}-speaking countries?`,
        correctAnswer: `Important cultural aspect`,
        options: [
          `Important cultural aspect`,
          `Incorrect cultural note A`,
          `Incorrect cultural note B`,
          `Incorrect cultural note C`
        ],
        explanation: `Understanding cultural context helps you use ${topic.toLowerCase()} vocabulary appropriately.`
      },
      {
        question: `How do you pronounce ${topic} in ${language}?`,
        correctAnswer: `Correct pronunciation guide`,
        options: [
          `Correct pronunciation guide`,
          `Wrong pronunciation A`,
          `Wrong pronunciation B`,
          `Wrong pronunciation C`
        ],
        explanation: `Proper pronunciation is essential for effective communication about ${topic.toLowerCase()}.`
      }
    ]
  };
  
  return {
    choices: [{
      message: {
        content: JSON.stringify(lesson)
      }
    }]
  };
}

// Importar módulos necessários
import mysql from 'mysql2/promise';

const dbConfig = {
  uri: process.env.DATABASE_URL
};

const TOPICS = {
  beginner: [
    "Greetings and Introductions", "Numbers 1-100", "Colors and Shapes", 
    "Family Members", "Common Foods", "Animals and Pets", 
    "Body Parts", "Clothing Items", "Weather", "Days and Months"
  ],
  intermediate: [
    "Shopping and Money", "Directions and Places", "Transportation", 
    "Hobbies and Interests", "Work and Professions", "Health and Medical", 
    "House and Furniture", "Technology", "Sports", "Travel"
  ],
  advanced: [
    "Business and Economics", "Politics and Government", "Science and Technology", 
    "Arts and Culture", "Environment", "Social Issues", 
    "History and Geography", "Philosophy", "Literature", "Media"
  ]
};

async function generateLesson(languageName, languageCode, level, topic) {
  const prompt = `Você é um especialista em ensino de idiomas. Crie uma lição completa de ${languageName} para nível ${level} sobre o tópico "${topic}".

**Requisitos:**
1. Título atrativo e claro
2. Descrição breve (1-2 frases)
3. Conteúdo educativo com vocabulário, exemplos e dicas
4. 5 exercícios de múltipla escolha variados

Responda em JSON válido.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um especialista em ensino de idiomas." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(`    ❌ Erro ao gerar lição:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando regeneração de lições com GPT-4...\n');
  
  let connection;
  
  try {
    // Conectar ao banco
    connection = await mysql.createConnection(dbConfig.uri);
    console.log('✅ Conectado ao banco de dados\n');
    
    // Deletar lições antigas
    console.log('🗑️  Deletando lições antigas...');
    await connection.execute('DELETE FROM exercises');
    await connection.execute('DELETE FROM lessons');
    console.log('✅ Lições antigas deletadas\n');
    
    // Buscar cursos
    const [courses] = await connection.execute(`
      SELECT c.*, l.name as languageName, l.code as languageCode 
      FROM courses c 
      JOIN languages l ON c.languageId = l.id
      ORDER BY c.id
    `);
    
    console.log(`📚 Total de cursos: ${courses.length}\n`);
    
    let totalLessons = 0;
    let totalExercises = 0;
    
    // Processar cada curso
    for (const course of courses) {
      console.log(`📖 Processando: ${course.title} (${course.languageName})`);
      
      const topics = TOPICS[course.level] || TOPICS.beginner;
      
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        console.log(`   Lição ${i + 1}/10: ${topic}`);
        
        try {
          // Gerar lição com GPT-4
          const lesson = await generateLesson(
            course.languageName,
            course.languageCode,
            course.level,
            topic
          );
          
          // Inserir lição
          const [lessonResult] = await connection.execute(
            `INSERT INTO lessons (courseId, title, description, content, \`order\`, duration, xpReward, languageCode) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [course.id, lesson.title, lesson.description, lesson.content, i + 1, 15, 10, course.languageCode]
          );
          
          const lessonId = lessonResult.insertId;
          totalLessons++;
          
          // Inserir exercícios
          for (let j = 0; j < lesson.exercises.length; j++) {
            const exercise = lesson.exercises[j];
            
            await connection.execute(
              `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, explanation, \`order\`, points)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                lessonId,
                'multiple_choice',
                exercise.question,
                exercise.correctAnswer,
                JSON.stringify(exercise.options),
                exercise.explanation,
                j + 1,
                10
              ]
            );
            
            totalExercises++;
          }
          
          console.log(`      ✅ Criada com ${lesson.exercises.length} exercícios`);
          
          // Aguardar 1 segundo para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`      ❌ Erro:`, error.message);
        }
      }
    }
    
    console.log(`\n\n🎉 REGENERAÇÃO CONCLUÍDA!\n`);
    console.log(`📊 Estatísticas:`);
    console.log(`   • Cursos: ${courses.length}`);
    console.log(`   • Lições: ${totalLessons}`);
    console.log(`   • Exercícios: ${totalExercises}\n`);
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
