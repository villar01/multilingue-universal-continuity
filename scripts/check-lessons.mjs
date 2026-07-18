import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const languages = await db.select().from(schema.languages);
const courses = await db.select().from(schema.courses);
const lessons = await db.select().from(schema.lessons);
const exercises = await db.select().from(schema.exercises);

console.log('\n📊 ESTATÍSTICAS DO BANCO DE DADOS:\n');
console.log(`✅ Idiomas: ${languages.length}`);
console.log(`✅ Cursos: ${courses.length}`);
console.log(`✅ Lições: ${lessons.length}`);
console.log(`✅ Exercícios: ${exercises.length}`);

console.log('\n🌍 IDIOMAS DISPONÍVEIS:\n');
for (const lang of languages) {
  console.log(`  ${lang.flag} ${lang.name} (${lang.code})`);
}

process.exit(0);
