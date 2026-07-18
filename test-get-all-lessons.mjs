import { drizzle } from "drizzle-orm/mysql2";
import { lessons } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

console.log('Testando getAllLessons()...');

const result = await db.select().from(lessons)
  .orderBy(lessons.orderIndex)
  .limit(100);

console.log(`Total de lições retornadas: ${result.length}`);
console.log('Primeiras 5 lições:');
result.slice(0, 5).forEach(l => console.log(`  ${l.id}: ${l.title}`));

process.exit(0);
