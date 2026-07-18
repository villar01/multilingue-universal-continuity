import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
console.log('🚀 SEED COMPLETO — idiomas + cursos + lições\n');

// ── 1. IDIOMAS ──────────────────────────────────────────────
const LANGS = [
  { code:'en', name:'English',    nativeName:'English',    flag:'🇺🇸' },
  { code:'es', name:'Spanish',    nativeName:'Español',    flag:'🇪🇸' },
  { code:'fr', name:'French',     nativeName:'Français',   flag:'🇫🇷' },
  { code:'de', name:'German',     nativeName:'Deutsch',    flag:'🇩🇪' },
  { code:'it', name:'Italian',    nativeName:'Italiano',   flag:'🇮🇹' },
  { code:'pt', name:'Portuguese', nativeName:'Português',  flag:'🇧🇷' },
  { code:'ru', name:'Russian',    nativeName:'Русский',    flag:'🇷🇺' },
  { code:'ja', name:'Japanese',   nativeName:'日本語',      flag:'🇯🇵' },
  { code:'ko', name:'Korean',     nativeName:'한국어',      flag:'🇰🇷' },
  { code:'zh', name:'Chinese',    nativeName:'中文',        flag:'🇨🇳' },
  { code:'ar', name:'Arabic',     nativeName:'العربية',    flag:'🇸🇦' },
  { code:'hi', name:'Hindi',      nativeName:'हिन्दी',     flag:'🇮🇳' },
  { code:'tr', name:'Turkish',    nativeName:'Türkçe',     flag:'🇹🇷' },
  { code:'pl', name:'Polish',     nativeName:'Polski',     flag:'🇵🇱' },
  { code:'nl', name:'Dutch',      nativeName:'Nederlands', flag:'🇳🇱' },
  { code:'sv', name:'Swedish',    nativeName:'Svenska',    flag:'🇸🇪' },
  { code:'no', name:'Norwegian',  nativeName:'Norsk',      flag:'🇳🇴' },
  { code:'da', name:'Danish',     nativeName:'Dansk',      flag:'🇩🇰' },
  { code:'fi', name:'Finnish',    nativeName:'Suomi',      flag:'🇫🇮' },
  { code:'el', name:'Greek',      nativeName:'Ελληνικά',   flag:'🇬🇷' },
  { code:'he', name:'Hebrew',     nativeName:'עברית',      flag:'🇮🇱' },
  { code:'th', name:'Thai',       nativeName:'ภาษาไทย',   flag:'🇹🇭' },
  { code:'vi', name:'Vietnamese', nativeName:'Tiếng Việt', flag:'🇻🇳' },
  { code:'id', name:'Indonesian', nativeName:'Bahasa Indonesia', flag:'🇮🇩' },
  { code:'ms', name:'Malay',      nativeName:'Bahasa Melayu', flag:'🇲🇾' },
  { code:'uk', name:'Ukrainian',  nativeName:'Українська', flag:'🇺🇦' },
  { code:'cs', name:'Czech',      nativeName:'Čeština',    flag:'🇨🇿' },
  { code:'ro', name:'Romanian',   nativeName:'Română',     flag:'🇷🇴' },
  { code:'hu', name:'Hungarian',  nativeName:'Magyar',     flag:'🇭🇺' },
  { code:'bg', name:'Bulgarian',  nativeName:'Български',  flag:'🇧🇬' },
  { code:'hr', name:'Croatian',   nativeName:'Hrvatski',   flag:'🇭🇷' },
  { code:'sk', name:'Slovak',     nativeName:'Slovenčina', flag:'🇸🇰' },
  { code:'lt', name:'Lithuanian', nativeName:'Lietuvių',   flag:'🇱🇹' },
  { code:'lv', name:'Latvian',    nativeName:'Latviešu',   flag:'🇱🇻' },
  { code:'et', name:'Estonian',   nativeName:'Eesti',      flag:'🇪🇪' },
  { code:'sl', name:'Slovenian',  nativeName:'Slovenščina',flag:'🇸🇮' },
  { code:'sr', name:'Serbian',    nativeName:'Српски',     flag:'🇷🇸' },
  { code:'ca', name:'Catalan',    nativeName:'Català',     flag:'🏴' },
  { code:'af', name:'Afrikaans',  nativeName:'Afrikaans',  flag:'🇿🇦' },
  { code:'sw', name:'Swahili',    nativeName:'Kiswahili',  flag:'🇰🇪' },
  { code:'tl', name:'Filipino',   nativeName:'Filipino',   flag:'🇵🇭' },
  { code:'bn', name:'Bengali',    nativeName:'বাংলা',      flag:'🇧🇩' },
  { code:'ur', name:'Urdu',       nativeName:'اردو',       flag:'🇵🇰' },
  { code:'fa', name:'Persian',    nativeName:'فارسی',      flag:'🇮🇷' },
  { code:'ta', name:'Tamil',      nativeName:'தமிழ்',      flag:'🇮🇳' },
  { code:'te', name:'Telugu',     nativeName:'తెలుగు',     flag:'🇮🇳' },
  { code:'mr', name:'Marathi',    nativeName:'मराठी',      flag:'🇮🇳' },
  { code:'gu', name:'Gujarati',   nativeName:'ગુજરાતી',    flag:'🇮🇳' },
  { code:'pa', name:'Punjabi',    nativeName:'ਪੰਜਾਬੀ',     flag:'🇮🇳' },
  { code:'kn', name:'Kannada',    nativeName:'ಕನ್ನಡ',      flag:'🇮🇳' },
  { code:'ml', name:'Malayalam',  nativeName:'മലയാളം',     flag:'🇮🇳' },
  { code:'ne', name:'Nepali',     nativeName:'नेपाली',     flag:'🇳🇵' },
  { code:'si', name:'Sinhala',    nativeName:'සිංහල',      flag:'🇱🇰' },
  { code:'my', name:'Burmese',    nativeName:'မြန်မာဘာသာ', flag:'🇲🇲' },
  { code:'km', name:'Khmer',      nativeName:'ភាសាខ្មែរ',  flag:'🇰🇭' },
  { code:'lo', name:'Lao',        nativeName:'ພາສາລາວ',    flag:'🇱🇦' },
  { code:'ka', name:'Georgian',   nativeName:'ქართული',    flag:'🇬🇪' },
];

console.log(`Inserindo ${LANGS.length} idiomas...`);
let langCount = 0;
for (const l of LANGS) {
  try {
    await conn.execute(
      `INSERT IGNORE INTO languages (code, name, nativeName, flag, isActive) VALUES (?,?,?,?,1)`,
      [l.code, l.name, l.nativeName, l.flag]
    );
    langCount++;
  } catch(e) { /* ignore dup */ }
}
console.log(`✅ ${langCount} idiomas inseridos\n`);

// ── 2. CURSOS (3 níveis por idioma) ─────────────────────────
const [langRows] = await conn.execute(`SELECT id, code, name FROM languages ORDER BY id`);
const levels = ['beginner','intermediate','advanced'];
const levelLabel = { beginner:'Básico', intermediate:'Intermediário', advanced:'Avançado' };

console.log(`Criando cursos para ${langRows.length} idiomas...`);
let courseCount = 0;
for (const lang of langRows) {
  for (const lv of levels) {
    try {
      await conn.execute(
        `INSERT IGNORE INTO courses (language_id, title, level, description, isPublished, estimatedHours, lessonCount)
         VALUES (?,?,?,?,1,?,?)`,
        [
          lang.id,
          `${lang.name} — ${levelLabel[lv]}`,
          lv,
          `Curso de ${lang.name} nível ${levelLabel[lv]} com IA avançada e professores nativos`,
          lv === 'beginner' ? 20 : lv === 'intermediate' ? 40 : 60,
          lv === 'beginner' ? 30 : lv === 'intermediate' ? 50 : 80,
        ]
      );
      courseCount++;
    } catch(e) { /* ignore */ }
  }
}
console.log(`✅ ${courseCount} cursos criados\n`);

// ── 3. LIÇÕES (10 por curso para beginner) ───────────────────
const [courseRows] = await conn.execute(
  `SELECT c.id, c.title, c.level, l.code as langCode, l.name as langName
   FROM courses c JOIN languages l ON c.language_id = l.id
   WHERE c.level = 'beginner' ORDER BY l.code`
);

const LESSON_TEMPLATES = [
  { n:1, title:'Saudações e Apresentações',   desc:'Como cumprimentar e se apresentar' },
  { n:2, title:'Números e Contagem',           desc:'Números de 1 a 100 e uso cotidiano' },
  { n:3, title:'Cores e Formas',               desc:'Vocabulário de cores e formas básicas' },
  { n:4, title:'Família e Relações',           desc:'Membros da família e relacionamentos' },
  { n:5, title:'Alimentos e Bebidas',          desc:'Vocabulário de comida e restaurante' },
  { n:6, title:'Animais e Natureza',           desc:'Animais domésticos e selvagens' },
  { n:7, title:'Corpo Humano',                 desc:'Partes do corpo e saúde básica' },
  { n:8, title:'Rotina Diária',                desc:'Atividades do dia a dia' },
  { n:9, title:'Clima e Estações',             desc:'Vocabulário de clima e tempo' },
  { n:10,title:'Viagem e Transporte',          desc:'Como pedir informações e se locomover' },
];

console.log(`Criando lições para ${courseRows.length} cursos básicos...`);
let lessonCount = 0;
for (const course of courseRows) {
  for (const tpl of LESSON_TEMPLATES) {
    try {
      await conn.execute(
        `INSERT IGNORE INTO lessons (courseId, title, description, orderIndex, content)
         VALUES (?,?,?,?,?)`,
        [
          course.id,
          `Aula ${tpl.n}: ${tpl.title}`,
          `${tpl.desc} em ${course.langName}`,
          tpl.n,
          `# Aula ${tpl.n}: ${tpl.title}\n\nBem-vindo à aula ${tpl.n} do curso de ${course.langName}!\n\n## Objetivos\n- Aprender vocabulário essencial\n- Praticar pronúncia com professor nativo\n- Exercícios interativos com IA\n\n## Vocabulário\nEsta aula apresenta as palavras mais usadas no tema: **${tpl.title}**.\n\n## Exercícios\n1. Ouça e repita com o professor\n2. Complete as frases\n3. Conversação livre com IA`,
        ]
      );
      lessonCount++;
    } catch(e) { /* ignore */ }
  }
}
console.log(`✅ ${lessonCount} lições criadas\n`);

// ── 4. Atualizar lessonCount nos cursos ──────────────────────
await conn.execute(
  `UPDATE courses c SET lessonCount = (SELECT COUNT(*) FROM lessons l WHERE l.courseId = c.id)`
);
console.log('✅ lessonCount atualizado nos cursos\n');

await conn.end();
console.log('🎉 SEED COMPLETO!\n');
