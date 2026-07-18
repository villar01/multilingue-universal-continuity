import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute(`
  SELECT vt.id, vt.name, vt.gender, vt.voice_id, vt.voice_language_code, vt.voice_gender,
         l.name as lang_name, l.code as lang_code
  FROM virtual_teachers vt
  LEFT JOIN languages l ON l.id = vt.language_id
  ORDER BY vt.id
`);

const problems = [];

for (const r of rows) {
  const issues = [];

  // Sem voz
  if (!r.voice_id) {
    issues.push('SEM VOZ');
  }

  // Voz no idioma errado
  if (r.voice_id && r.voice_language_code && r.lang_code) {
    const vl = r.voice_language_code.toLowerCase();
    const lc = r.lang_code.toLowerCase().substring(0, 2);
    if (!vl.startsWith(lc)) {
      issues.push(`VOZ ERRADA: voz ${r.voice_language_code} para idioma ${r.lang_name}(${r.lang_code})`);
    }
  }

  // Gênero da voz diferente do gênero do professor
  if (r.voice_id && r.voice_gender && r.gender) {
    const vg = r.voice_gender.toLowerCase();
    const g = r.gender.toLowerCase();
    if (vg !== g && vg !== 'neutral' && g !== 'neutral') {
      issues.push(`GÊNERO VOZ ERRADO: professor ${g} mas voz ${vg}`);
    }
  }

  if (issues.length > 0) {
    problems.push({ ...r, issues });
    console.log(`❌ ID:${r.id} | ${r.name} | ${r.gender} | ${r.lang_name}(${r.lang_code}) | voice:${r.voice_id || 'NULL'} | voiceLang:${r.voice_language_code || 'NULL'} | voiceGender:${r.voice_gender || 'NULL'}`);
    issues.forEach(i => console.log(`   → ${i}`));
  }
}

console.log(`\n=== RESUMO ===`);
console.log(`Total professores: ${rows.length}`);
console.log(`Com problemas: ${problems.length}`);
console.log(`Sem voz: ${problems.filter(p => p.issues.some(i => i.includes('SEM VOZ'))).length}`);
console.log(`Voz errada: ${problems.filter(p => p.issues.some(i => i.includes('VOZ ERRADA'))).length}`);
console.log(`Gênero voz errado: ${problems.filter(p => p.issues.some(i => i.includes('GÊNERO VOZ'))).length}`);

// Mostrar professores com voz configurada corretamente
const ok = rows.filter(r => r.voice_id);
console.log(`\nCom voz configurada: ${ok.length}`);
ok.forEach(r => console.log(`  ✅ ID:${r.id} ${r.name} | ${r.lang_name} | ${r.voice_id} | ${r.voice_language_code} | ${r.voice_gender}`));

await conn.end();
