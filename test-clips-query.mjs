import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn, { schema });

const clips = await db.select().from(schema.videoClips);
console.log('Total de clipes no banco:', clips.length);

if (clips.length > 0) {
  console.log('\nPrimeiro clipe:');
  console.log('- ID:', clips[0].id);
  console.log('- Title:', clips[0].title);
  console.log('- Target Language:', clips[0].targetLanguage);
  console.log('- Difficulty:', clips[0].difficulty);
}

await conn.end();
