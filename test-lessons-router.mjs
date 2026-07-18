import { drizzle } from "drizzle-orm/mysql2";
import { lessons } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

console.log('=== TESTE DO ROUTER lessons.list ===\n');

try {
  const result = await db.select().from(lessons).orderBy(lessons.orderIndex).limit(100);
  
  console.log('Total de lições retornadas:', result.length);
  console.log('\nPrimeiras 3 lições:');
  result.slice(0, 3).forEach(lesson => {
    console.log(`  - ID: ${lesson.id}`);
    console.log(`    Title: ${lesson.title}`);
    console.log(`    CourseID: ${lesson.courseId}`);
    console.log(`    OrderIndex: ${lesson.orderIndex}`);
    console.log('');
  });
  
  process.exit(0);
} catch (error) {
  console.error('ERRO:', error.message);
  process.exit(1);
}
