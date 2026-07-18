import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Populando TODOS os idiomas...\n');

const [languages] = await conn.query('SELECT id, code, name FROM languages ORDER BY code');
console.log(`📚 Total de idiomas: ${languages.length}\n`);

const levels = ['beginner', 'intermediate', 'advanced'];
const lessonTopics = [
  'Greetings and Introductions',
  'Numbers and Counting',
  'Colors and Descriptions',
  'Family Members',
  'Food and Drinks',
  'Animals and Pets',
  'Body Parts',
  'Clothes and Fashion',
  'Weather and Seasons',
  'Days and Time'
];

let courseCount = 0;
let lessonCount = 0;
let exerciseCount = 0;

for (const lang of languages) {
  console.log(`📖 ${lang.name} (${lang.code})`);
  
  for (const level of levels) {
    try {
      const [courseResult] = await conn.query(`
        INSERT INTO courses (languageId, language_id, title, level, description, isPublished)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [
        lang.id,
        lang.id,
        `${lang.name} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
        level,
        `Learn ${lang.name} from ${level} level.`
      ]);
      
      const courseId = courseResult.insertId;
      courseCount++;
      
      for (let i = 0; i < lessonTopics.length; i++) {
        const topic = lessonTopics[i];
        
        const [lessonResult] = await conn.query(`
          INSERT INTO lessons (courseId, title, description, orderIndex, content, estimatedMinutes, languageCode)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          courseId,
          `Lesson ${i + 1}: ${topic}`,
          `Learn about ${topic.toLowerCase()} in ${lang.name}.`,
          i + 1,
          `# ${topic}\n\nIn this lesson, you will learn essential vocabulary and grammar related to ${topic.toLowerCase()}.`,
          15,
          lang.code
        ]);
        
        const lessonId = lessonResult.insertId;
        lessonCount++;
        
        for (let j = 0; j < 5; j++) {
          await conn.query(`
            INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, points)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            lessonId,
            'multiple_choice',
            `Question ${j + 1} about ${topic}`,
            'Correct answer',
            JSON.stringify(['Correct answer', 'Option 2', 'Option 3', 'Option 4']),
            j + 1,
            20
          ]);
          exerciseCount++;
        }
      }
      
    } catch (error) {
      console.error(`  ❌ Erro no curso ${level}:`, error.message);
    }
  }
}

console.log(`\n🎉 CONCLUÍDO!`);
console.log(`📊 Cursos: ${courseCount}`);
console.log(`📝 Lições: ${lessonCount}`);
console.log(`✏️  Exercícios: ${exerciseCount}`);

await conn.end();
