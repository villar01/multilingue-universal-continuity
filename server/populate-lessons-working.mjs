import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Iniciando população de lições...\n');

// Buscar todos os cursos
const [courses] = await conn.query(`
  SELECT c.id, c.title, c.level, l.code as languageCode, l.name as languageName
  FROM courses c
  JOIN languages l ON c.languageId = l.id
  ORDER BY l.code, c.level
`);

console.log(`📚 Encontrados ${courses.length} cursos\n`);

let totalLessons = 0;
let totalExercises = 0;

// Para cada curso, criar 10 lições
for (const course of courses) {
  console.log(`\n📖 Curso: ${course.languageName} - ${course.level}`);
  
  const lessonTopics = [
    { title: 'Greetings and Introductions', grammar: ['Present Simple', 'Personal Pronouns'] },
    { title: 'Numbers and Counting', grammar: ['Cardinal Numbers', 'Ordinal Numbers'] },
    { title: 'Colors and Descriptions', grammar: ['Adjectives', 'Verb To Be'] },
    { title: 'Family Members', grammar: ['Possessive Adjectives', 'Plural Forms'] },
    { title: 'Food and Drinks', grammar: ['Countable/Uncountable Nouns', 'Some/Any'] },
    { title: 'Animals and Pets', grammar: ['Present Simple', 'Articles'] },
    { title: 'Body Parts', grammar: ['Singular/Plural', 'Verb To Have'] },
    { title: 'Clothes and Fashion', grammar: ['Colors', 'Sizes', 'Present Continuous'] },
    { title: 'Weather and Seasons', grammar: ['Present Simple', 'Adverbs'] },
    { title: 'Days and Time', grammar: ['Prepositions of Time', 'Present Simple'] }
  ];
  
  for (let i = 0; i < lessonTopics.length; i++) {
    const topic = lessonTopics[i];
    
    try {
      // Inserir lição (SEM especificar ID - deixa o auto_increment funcionar)
      const [lessonResult] = await conn.query(`
        INSERT INTO lessons (courseId, title, description, orderIndex, content, estimatedMinutes, languageCode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        course.id,
        `Lesson ${i + 1}: ${topic.title}`,
        `Learn about ${topic.title.toLowerCase()} in ${course.languageName}. This lesson covers essential vocabulary and grammar points.`,
        i + 1,
        `# ${topic.title}\n\nIn this lesson, you will learn:\n\n- Essential vocabulary related to ${topic.title.toLowerCase()}\n- Grammar: ${topic.grammar.join(', ')}\n- Practical examples and exercises\n\nLet's start learning!`,
        15,
        course.languageCode
      ]);
      
      const lessonId = lessonResult.insertId;
      totalLessons++;
      
      // Criar 5 exercícios para cada lição
      const exercises = [
        {
          type: 'multiple_choice',
          question: `What is the correct translation of "Hello" in ${course.languageName}?`,
          correctAnswer: 'Hello (correct translation)',
          options: JSON.stringify(['Hello (correct translation)', 'Option 2', 'Option 3', 'Option 4'])
        },
        {
          type: 'fill_blank',
          question: `Complete: I ___ a student.`,
          correctAnswer: 'am',
          options: JSON.stringify(['am', 'is', 'are', 'be'])
        },
        {
          type: 'translation',
          question: `Translate to ${course.languageName}: "Good morning"`,
          correctAnswer: 'Good morning (translation)',
          options: null
        },
        {
          type: 'listening',
          question: 'Listen and select the correct word',
          correctAnswer: 'correct word',
          options: JSON.stringify(['correct word', 'word 2', 'word 3', 'word 4'])
        },
        {
          type: 'speaking',
          question: 'Repeat after the teacher: "How are you?"',
          correctAnswer: 'How are you?',
          options: null
        }
      ];
      
      for (let j = 0; j < exercises.length; j++) {
        const ex = exercises[j];
        await conn.query(`
          INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, points)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [lessonId, ex.type, ex.question, ex.correctAnswer, ex.options, j + 1, 20]);
        totalExercises++;
      }
      
      console.log(`  ✅ Lição ${i + 1}: ${topic.title} (${lessonId}) + 5 exercícios`);
      
    } catch (error) {
      console.error(`  ❌ Erro na lição ${i + 1}:`, error.message);
    }
  }
}

console.log(`\n\n🎉 CONCLUÍDO!`);
console.log(`📊 Total de lições criadas: ${totalLessons}`);
console.log(`📝 Total de exercícios criados: ${totalExercises}`);

await conn.end();
