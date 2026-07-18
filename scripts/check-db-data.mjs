import { getDb } from '../server/db.ts';
import { courses, lessons, languages } from '../drizzle/schema.ts';

async function main() {
  const db = await getDb();
  
  if (!db) {
    console.log('❌ Banco de dados não disponível');
    return;
  }
  
  // Verificar idiomas
  const allLanguages = await db.select().from(languages);
  console.log(`\n📚 Total de idiomas: ${allLanguages.length}`);
  console.log('Primeiros 5:', allLanguages.slice(0, 5).map(l => `${l.flag} ${l.name} (${l.code})`).join(', '));
  
  // Verificar cursos
  const allCourses = await db.select().from(courses);
  console.log(`\n📖 Total de cursos: ${allCourses.length}`);
  console.log('Primeiros 5:');
  allCourses.slice(0, 5).forEach(c => {
    console.log(`  - ${c.title} (${c.level}) - ${c.lessonCount} lições`);
  });
  
  // Verificar lições
  const allLessons = await db.select().from(lessons);
  console.log(`\n✏️ Total de lições: ${allLessons.length}`);
  console.log('Primeiras 5:');
  allLessons.slice(0, 5).forEach(l => {
    console.log(`  - ${l.title} (courseId: ${l.courseId}, order: ${l.orderIndex})`);
  });
  
  // Verificar lições com áudio
  const lessonsWithAudio = allLessons.filter(l => l.audioUrl);
  console.log(`\n🎵 Lições com áudio: ${lessonsWithAudio.length}`);
  
  // Verificar lições por curso
  if (allCourses.length > 0) {
    const firstCourse = allCourses[0];
    const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, firstCourse.id));
    console.log(`\n📝 Lições do curso "${firstCourse.title}": ${courseLessons.length}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
