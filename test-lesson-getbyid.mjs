import { getLessonById, getExercisesByLesson } from './server/db.ts';

console.log('=== TESTE getLessonById e getExercisesByLesson ===\n');

try {
  // Testar lição 150991
  const lesson = await getLessonById(150991);
  
  if (lesson) {
    console.log('✅ Lição encontrada:');
    console.log(`  ID: ${lesson.id}`);
    console.log(`  Title: ${lesson.title}`);
    console.log(`  CourseID: ${lesson.courseId}`);
    console.log(`  Description: ${lesson.description?.substring(0, 50)}...`);
  } else {
    console.log('❌ Lição NÃO encontrada (retornou undefined)');
  }
  
  console.log('\n--- Buscando exercícios ---\n');
  
  const exercises = await getExercisesByLesson(150991);
  
  console.log(`Total de exercícios: ${exercises.length}`);
  
  if (exercises.length > 0) {
    console.log('\nPrimeiros 3 exercícios:');
    exercises.slice(0, 3).forEach((ex, i) => {
      console.log(`  ${i + 1}. ID: ${ex.id}, Type: ${ex.type}, Question: ${ex.question?.substring(0, 40)}...`);
    });
  } else {
    console.log('❌ Nenhum exercício encontrado');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ ERRO:', error.message);
  console.error(error);
  process.exit(1);
}
