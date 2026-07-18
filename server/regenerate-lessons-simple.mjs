/**
 * Script Simples de Regeneração de Lições
 * Usa Node.js puro sem TypeScript para evitar problemas de compilação
 */

import mysql from 'mysql2/promise';

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'multilingue',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Tópicos por nível
const TOPICS = {
  beginner: [
    "Greetings", "Numbers", "Colors", "Family", "Food",
    "Animals", "Body Parts", "Clothes", "Weather", "Days"
  ],
  intermediate: [
    "Shopping", "Directions", "Transportation", "Hobbies", "Work",
    "Health", "House", "Technology", "Sports", "Travel"
  ],
  advanced: [
    "Business", "Politics", "Science", "Arts", "Environment",
    "Social Issues", "History", "Philosophy", "Literature", "Media"
  ]
};

async function main() {
  console.log('🚀 Iniciando regeneração de lições...\n');
  
  let connection;
  
  try {
    // Conectar ao banco
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados\n');
    
    // 1. Deletar lições antigas
    console.log('🗑️  Deletando lições antigas...');
    await connection.execute('DELETE FROM exercises');
    await connection.execute('DELETE FROM lessons');
    console.log('✅ Lições antigas deletadas\n');
    
    // 2. Buscar cursos
    const [courses] = await connection.execute(`
      SELECT c.*, l.name as languageName, l.code as languageCode 
      FROM courses c 
      JOIN languages l ON c.languageId = l.id
    `);
    
    console.log(`📚 Total de cursos: ${courses.length}\n`);
    
    let totalLessons = 0;
    let totalExercises = 0;
    
    // 3. Processar cada curso
    for (const course of courses) {
      console.log(`📖 Processando: ${course.title} (${course.languageName})`);
      
      const topics = TOPICS[course.level] || TOPICS.beginner;
      
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        
        // Criar lição simples (sem GPT-4 por enquanto para ser rápido)
        const lessonTitle = `${topic} in ${course.languageName}`;
        const lessonDesc = `Learn essential ${topic.toLowerCase()} vocabulary and phrases`;
        const lessonContent = `This lesson covers basic ${topic.toLowerCase()} in ${course.languageName}.`;
        
        const [lessonResult] = await connection.execute(
          `INSERT INTO lessons (courseId, title, description, content, \`order\`, duration, xpReward, languageCode) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [course.id, lessonTitle, lessonDesc, lessonContent, i + 1, 15, 10, course.languageCode]
        );
        
        const lessonId = lessonResult.insertId;
        totalLessons++;
        
        // Criar 5 exercícios por lição
        for (let j = 0; j < 5; j++) {
          const question = `Question ${j + 1} about ${topic}`;
          const correctAnswer = `Correct answer ${j + 1}`;
          const options = JSON.stringify([
            correctAnswer,
            `Wrong answer ${j + 1}A`,
            `Wrong answer ${j + 1}B`,
            `Wrong answer ${j + 1}C`
          ]);
          
          await connection.execute(
            `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, explanation, \`order\`, points)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [lessonId, 'multiple_choice', question, correctAnswer, options, `Explanation for question ${j + 1}`, j + 1, 10]
          );
          
          totalExercises++;
        }
      }
      
      console.log(`   ✅ ${topics.length} lições criadas`);
    }
    
    console.log(`\n🎉 REGENERAÇÃO CONCLUÍDA!`);
    console.log(`📊 Lições criadas: ${totalLessons}`);
    console.log(`📊 Exercícios criados: ${totalExercises}\n`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
