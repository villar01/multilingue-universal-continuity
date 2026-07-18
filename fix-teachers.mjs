import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Delete Michael Johnson
await conn.execute('DELETE FROM virtual_teachers WHERE name = ?', ['Michael Johnson']);
console.log('✓ Michael Johnson deleted');

// Check teachers for language_id=1
const [teachers] = await conn.execute('SELECT id, name, photoUrl, voiceId, specialty FROM virtual_teachers WHERE languageId = 1');
console.log('\nTeachers for English (languageId=1):');
console.log(JSON.stringify(teachers, null, 2));

await conn.end();
