import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [teachers] = await conn.execute(`
  SELECT id, name, gender, language, voice_id, voice_language, personality_type, avatar_style
  FROM virtual_teachers
  ORDER BY id
`);

console.log(`\n=== AUDITORIA DE PROFESSORES (${teachers.length} total) ===\n`);

const problems = [];

for (const t of teachers) {
  const issues = [];

  // 1. voice_id nulo
  if (!t.voice_id) {
    issues.push('SEM VOZ (voice_id null)');
  }

  // 2. voice_language não corresponde ao idioma da lição
  if (t.voice_id && t.voice_language) {
    const voiceLang = t.voice_language.toLowerCase();
    const teacherLang = (t.language || '').toLowerCase();
    
    // Verificar mismatch óbvio
    if (teacherLang.includes('portuguese') || teacherLang.includes('pt-br')) {
      if (!voiceLang.startsWith('pt')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('spanish') || teacherLang.includes('espanhol')) {
      if (!voiceLang.startsWith('es')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('french') || teacherLang.includes('francês')) {
      if (!voiceLang.startsWith('fr')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('german') || teacherLang.includes('alemão')) {
      if (!voiceLang.startsWith('de')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('italian') || teacherLang.includes('italiano')) {
      if (!voiceLang.startsWith('it')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('japanese') || teacherLang.includes('japonês')) {
      if (!voiceLang.startsWith('ja')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
    if (teacherLang.includes('chinese') || teacherLang.includes('chinês')) {
      if (!voiceLang.startsWith('zh')) {
        issues.push(`VOZ ERRADA: professor de ${t.language} tem voz ${t.voice_language}`);
      }
    }
  }

  // 3. Nome masculino com gênero feminino
  const maleNames = ['jean', 'carlos', 'ricardo', 'miguel', 'pierre', 'hans', 'john', 'james', 'michael', 'david', 'robert', 'william', 'joseph', 'thomas', 'charles', 'daniel', 'paul', 'mark', 'donald', 'george', 'ken', 'kevin', 'brian', 'edward', 'ronald', 'anthony', 'steven', 'jason', 'matthew', 'gary', 'timothy', 'jose', 'larry', 'jeffrey', 'frank', 'scott', 'eric', 'stephen', 'andrew', 'raymond', 'gregory', 'joshua', 'jerry', 'dennis', 'walter', 'patrick', 'peter', 'harold', 'douglas', 'henry', 'carl', 'arthur', 'ryan', 'roger', 'joe', 'juan', 'jack', 'albert', 'jonathan', 'justin', 'terry', 'gerald', 'keith', 'samuel', 'willie', 'ralph', 'lawrence', 'nicholas', 'roy', 'benjamin', 'bruce', 'brandon', 'adam', 'harry', 'fred', 'wayne', 'billy', 'steve', 'louis', 'jeremy', 'aaron', 'randy', 'howard', 'eugene', 'carlos', 'russell', 'bobby', 'victor', 'martin', 'ernest', 'phillip', 'todd', 'jesse', 'craig', 'alan', 'shawn', 'clarence', 'sean', 'philip', 'chris', 'johnny', 'earl', 'jimmy', 'antonio', 'danny', 'bryan', 'tony', 'luis', 'mike', 'stanley', 'leonard', 'nathan', 'dale', 'manuel', 'rodney', 'curtis', 'norman', 'allen', 'marvin', 'vincent', 'glen', 'jeffery', 'travis', 'jeff', 'chad', 'jacob', 'lee', 'melvin', 'alfred', 'kyle', 'francis', 'bradley', 'jesus', 'herbert', 'frederick', 'ray', 'joel', 'edwin', 'don', 'eddie', 'ricky', 'troy', 'randall', 'barry', 'alexander', 'bernard', 'mario', 'leroy', 'francisco', 'marcus', 'micheal', 'theodore', 'clifford', 'miguel', 'oscar', 'jay', 'jim', 'tom', 'calvin', 'alex', 'jon', 'ronnie', 'bill', 'lloyd', 'tommy', 'leon', 'derek', 'warren', 'darrell', 'jerome', 'floyd', 'leo', 'alvin', 'tim', 'wesley', 'gordon', 'dean', 'greg', 'jorge', 'dustin', 'pedro', 'derrick', 'dan', 'lewis', 'zachary', 'corey', 'herman', 'maurice', 'vernon', 'roberto', 'clyde', 'glen', 'hector', 'shane', 'ricardo', 'sam', 'rick', 'lester', 'brent', 'ramon', 'charlie', 'tyler', 'gilbert', 'gene', 'marc', 'reginald', 'ruben', 'brett', 'angel', 'nathaniel', 'rafael', 'leslie', 'edgar', 'milton', 'raul', 'ben', 'chester', 'andre', 'elmer', 'brad', 'tanner', 'kwame', 'kofi', 'amara', 'ibrahim', 'omar', 'ali', 'ahmed', 'hassan', 'yusuf', 'abdel', 'hamid', 'tariq', 'malik', 'rashid', 'jamal', 'kareem', 'darius', 'tyrone', 'jerome', 'deshawn', 'devonte', 'marcus', 'andre', 'antoine', 'pierre', 'luc', 'claude', 'rene', 'hugo', 'felix', 'emile', 'leon', 'gaston', 'etienne', 'baptiste', 'theo', 'maxime', 'lucas', 'noah', 'leo', 'gabriel', 'raphael', 'alexandre', 'nicolas', 'julien', 'baptiste', 'romain', 'florian', 'quentin', 'sebastien', 'vincent', 'xavier', 'yannick', 'cedric', 'damien', 'edouard', 'francois', 'guillaume', 'herve', 'igor', 'jerome', 'kevin', 'laurent', 'mathieu', 'olivier', 'pascal', 'renaud', 'stephane', 'thierry', 'ulrich', 'valentin', 'wilfried', 'yves', 'zacharie'];
  const femaleNames = ['jeanne', 'marie', 'sophie', 'emma', 'claire', 'alice', 'isabelle', 'charlotte', 'amelie', 'camille', 'lea', 'julie', 'sarah', 'laura', 'anna', 'maria', 'ana', 'lucia', 'rosa', 'elena', 'sofia', 'valentina', 'natalia', 'carolina', 'isabella', 'fernanda', 'juliana', 'patricia', 'sandra', 'claudia', 'monica', 'diana', 'andrea', 'jessica', 'jennifer', 'ashley', 'amanda', 'melissa', 'stephanie', 'rebecca', 'emily', 'rachel', 'hannah', 'samantha', 'katherine', 'elizabeth', 'megan', 'brittany', 'kayla', 'abigail', 'natalie', 'crystal', 'amber', 'tiffany', 'danielle', 'brittney', 'chelsea', 'vanessa', 'courtney', 'kimberly', 'heather', 'michelle', 'nicole', 'lisa', 'angela', 'brenda', 'amy', 'anna', 'helen', 'deborah', 'donna', 'carol', 'ruth', 'sharon', 'virginia', 'diane', 'alice', 'julie', 'joyce', 'victoria', 'kelly', 'christina', 'joan', 'evelyn', 'lauren', 'judith', 'olivia', 'frances', 'martha', 'cheryl', 'mildred', 'kathleen', 'amy', 'shirley', 'ann', 'jean', 'kathryn', 'lori', 'grace', 'teresa', 'lucy', 'yuki', 'sakura', 'hana', 'aiko', 'mei', 'lin', 'xiao', 'fatima', 'amina', 'aisha', 'zainab', 'khadija', 'mariam', 'nadia', 'layla', 'yasmin', 'rania', 'hana', 'lena', 'nina', 'mia', 'ava', 'zoe', 'chloe', 'lily', 'grace', 'ella', 'scarlett', 'victoria', 'aurora', 'penelope', 'luna', 'hazel', 'violet', 'stella', 'eleanor', 'naomi', 'ingrid', 'astrid', 'freya', 'sigrid', 'helga', 'brigitte', 'greta', 'heidi', 'ursula', 'hildegard', 'lieselotte', 'mechthild', 'waltraud', 'elfriede', 'gertrude', 'hildegard', 'irmgard', 'kunigunde', 'lieselotte', 'mechthild', 'waltraud'];

  const firstName = t.name.toLowerCase().replace(/^(teacher|professor|professora|prof\.?)\s+/i, '').split(' ')[0];
  
  if (t.gender === 'female' && maleNames.includes(firstName) && !femaleNames.includes(firstName)) {
    issues.push(`GÊNERO ERRADO: nome "${t.name}" parece masculino mas gender=female`);
  }
  if (t.gender === 'male' && femaleNames.includes(firstName) && !maleNames.includes(firstName)) {
    issues.push(`GÊNERO ERRADO: nome "${t.name}" parece feminino mas gender=male`);
  }

  if (issues.length > 0) {
    problems.push({ id: t.id, name: t.name, gender: t.gender, language: t.language, voice_id: t.voice_id, voice_language: t.voice_language, issues });
    console.log(`❌ ID ${t.id} | ${t.name} | ${t.gender} | ${t.language} | voz: ${t.voice_id || 'NULL'} (${t.voice_language || 'NULL'})`);
    issues.forEach(i => console.log(`   → ${i}`));
  } else {
    console.log(`✅ ID ${t.id} | ${t.name} | ${t.gender} | ${t.language} | voz: ${t.voice_id}`);
  }
}

console.log(`\n=== RESUMO: ${problems.length} professores com problemas de ${teachers.length} total ===`);
const semVoz = problems.filter(p => p.issues.some(i => i.includes('SEM VOZ')));
const vozErrada = problems.filter(p => p.issues.some(i => i.includes('VOZ ERRADA')));
const generoErrado = problems.filter(p => p.issues.some(i => i.includes('GÊNERO ERRADO')));
console.log(`- Sem voz: ${semVoz.length}`);
console.log(`- Voz errada para idioma: ${vozErrada.length}`);
console.log(`- Gênero/nome inconsistente: ${generoErrado.length}`);

await conn.end();
