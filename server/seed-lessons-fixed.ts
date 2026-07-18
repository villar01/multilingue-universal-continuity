/**
 * Script para popular lições vinculadas aos cursos existentes
 */

import { getDb } from "./db.js";
import { sql } from "drizzle-orm";

async function seedLessons() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Erro ao conectar ao banco de dados");
    return;
  }

  console.log("🚀 Iniciando seed de lições...\n");

  // 1. Buscar cursos existentes
  const coursesResult = await db.execute(sql`SELECT id, languageId, title, level FROM courses ORDER BY id`);
  const courses = (coursesResult[0] as unknown || []) as Array<{id: number, languageId: number, title: string, level: string}>;
  
  console.log(`📚 Cursos encontrados: ${courses.length}`);
  
  if (courses.length === 0) {
    console.error("❌ Nenhum curso encontrado!");
    return;
  }

  // 2. Tópicos de lições por nível
  const lessonTopics = {
    beginner: [
      "Greetings and Introductions",
      "Numbers 1-20",
      "Colors and Shapes",
      "Family Members",
      "Common Verbs - Part 1",
      "Food and Drinks - Basics",
      "Days of the Week",
      "Basic Questions",
      "Simple Present Tense",
      "Personal Pronouns"
    ],
    intermediate: [
      "Past Tense Introduction",
      "Future Tense Basics",
      "Prepositions of Place",
      "Describing People",
      "Shopping and Money",
      "Directions and Places",
      "Weather and Seasons",
      "Hobbies and Free Time",
      "Making Suggestions",
      "Comparatives and Superlatives"
    ],
    advanced: [
      "Conditional Sentences",
      "Passive Voice",
      "Reported Speech",
      "Phrasal Verbs",
      "Idioms and Expressions",
      "Business Vocabulary",
      "Academic Writing",
      "Debate and Discussion",
      "Cultural Topics",
      "Advanced Grammar Review"
    ]
  };

  let totalLessons = 0;
  let totalExercises = 0;

  // 3. Criar lições para cada curso
  for (const course of courses) {
    const topics = lessonTopics[course.level as keyof typeof lessonTopics] || lessonTopics.beginner;
    
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const title = topic;
      const description = `Learn ${topic.toLowerCase()} with interactive exercises`;
      const orderIndex = i + 1;
      
      // Inserir lição
      const lessonResult = await db.execute(sql`
        INSERT INTO lessons (courseId, title, description, orderIndex, durationMinutes, xpReward, isPublished, languageCode)
        VALUES (${course.id}, ${title}, ${description}, ${orderIndex}, 15, 50, true, 'en')
      `);
      
      totalLessons++;
      
      // Pegar ID da lição inserida
      const lessonIdResult = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const lessonId = ((lessonIdResult[0] as any)[0] as any).id;
      
      // Criar 4 exercícios para cada lição
      const exerciseTypes = ["multiple_choice", "fill_blank", "listening", "speaking"];
      
      for (let j = 0; j < exerciseTypes.length; j++) {
        const type = exerciseTypes[j];
        const question = `${type.replace('_', ' ')} exercise for ${topic}`;
        const correctAnswer = "correct_answer";
        const options = JSON.stringify(["option_a", "option_b", "correct_answer", "option_d"]);
        
        await db.execute(sql`
          INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, xpReward)
          VALUES (${lessonId}, ${type}, ${question}, ${correctAnswer}, ${options}, ${j + 1}, 10)
        `);
        
        totalExercises++;
      }
    }
    
    console.log(`✅ Curso ${course.id} (${course.level}): ${topics.length} lições criadas`);
  }

  console.log(`\n🎉 SEED COMPLETO!`);
  console.log(`📖 Total de lições: ${totalLessons}`);
  console.log(`✏️ Total de exercícios: ${totalExercises}`);
  
  // 4. Verificar totais finais
  const finalStats = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM languages) as languages,
      (SELECT COUNT(*) FROM courses) as courses,
      (SELECT COUNT(*) FROM lessons) as lessons,
      (SELECT COUNT(*) FROM exercises) as exercises
  `);
  
  const statsRows = (finalStats[0] as unknown || []) as any[];
  const stats = statsRows[0];
  
  console.log(`\n📊 ESTATÍSTICAS FINAIS:`);
  console.log(`   Idiomas: ${stats?.languages || 0}`);
  console.log(`   Cursos: ${stats?.courses || 0}`);
  console.log(`   Lições: ${stats?.lessons || 0}`);
  console.log(`   Exercícios: ${stats?.exercises || 0}`);
  
  process.exit(0);
}

seedLessons().catch(console.error);
