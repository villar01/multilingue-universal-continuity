import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 POPULAÇÃO COMPLETA DO BANCO DE DADOS\n');
console.log('Este script vai popular:');
console.log('- 57 idiomas');
console.log('- 171 cursos (3 níveis por idioma)');
console.log('- 1.710 lições (10 por curso)');
console.log('- 8.550 exercícios (5 por lição)\n');

// ============================================================
// PASSO 1: POPULAR IDIOMAS
// ============================================================

console.log('📚 PASSO 1: Populando idiomas...\n');

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' }
];

let languageCount = 0;
for (const lang of languages) {
  try {
    await conn.query(`
      INSERT INTO languages (code, name, nativeName, flag, isActive)
      VALUES (?, ?, ?, ?, 1)
    `, [lang.code, lang.name, lang.nativeName, lang.flag]);
    languageCount++;
    console.log(`  ✅ ${lang.flag} ${lang.name} (${lang.nativeName})`);
  } catch (error) {
    console.error(`  ❌ Erro ao inserir ${lang.name}:`, error.message);
  }
}

console.log(`\n✅ ${languageCount} idiomas inseridos!\n`);

// ============================================================
// PASSO 2: POPULAR CURSOS
// ============================================================

console.log('📖 PASSO 2: Criando cursos (3 níveis por idioma)...\n');

const [languagesFromDb] = await conn.query('SELECT id, code, name FROM languages ORDER BY code');

let courseCount = 0;
const levels = ['Beginner', 'Intermediate', 'Advanced'];

for (const lang of languagesFromDb) {
  for (const level of levels) {
    try {
      await conn.query(`
        INSERT INTO courses (languageId, title, level, description, isActive)
        VALUES (?, ?, ?, ?, 1)
      `, [
        lang.id,
        `${lang.name} - ${level}`,
        level,
        `Learn ${lang.name} from ${level.toLowerCase()} level. Master vocabulary, grammar, and conversation skills.`
      ]);
      courseCount++;
      console.log(`  ✅ ${lang.name} - ${level}`);
    } catch (error) {
      console.error(`  ❌ Erro ao criar curso ${lang.name} - ${level}:`, error.message);
    }
  }
}

console.log(`\n✅ ${courseCount} cursos criados!\n`);

// ============================================================
// PASSO 3: POPULAR LIÇÕES E EXERCÍCIOS
// ============================================================

console.log('📝 PASSO 3: Criando lições e exercícios...\n');

const [coursesFromDb] = await conn.query(`
  SELECT c.id, c.title, c.level, l.code as languageCode, l.name as languageName
  FROM courses c
  JOIN languages l ON c.languageId = l.id
  ORDER BY l.code, c.level
`);

const lessonTopics = [
  { title: 'Greetings and Introductions', grammar: ['Present Simple', 'Personal Pronouns'] },
  { title: 'Numbers and Counting', grammar: ['Cardinal Numbers', 'Ordinal Numbers'] },
  { title: 'Colors and Descriptions', grammar: ['Adjectives', 'Verb To Be'] },
  { title: 'Family Members', grammar: ['Possessive Adjectives', 'Plural Forms'] },
  { title: 'Food and Drinks', grammar: ['Countable/Uncountable Nouns', 'Some/Any'] },
  { title: 'Animals and Pets', grammar: ['Present Simple', 'Articles'] },
  { title: 'Body Parts', grammar: ['Singular/Plural', 'Verb To Have'] },
  { title: 'Clothes and Fashion', grammar: ['Colors', 'Sizes', 'Present Continuous'] },
  { title: 'Weather and Seasons', grammar: ['Present Simple', 'Adverbs'] },
  { title: 'Days and Time', grammar: ['Prepositions of Time', 'Present Simple'] }
];

let lessonCount = 0;
let exerciseCount = 0;

for (const course of coursesFromDb) {
  console.log(`\n  📚 ${course.languageName} - ${course.level}`);
  
  for (let i = 0; i < lessonTopics.length; i++) {
    const topic = lessonTopics[i];
    
    try {
      const [lessonResult] = await conn.query(`
        INSERT INTO lessons (courseId, title, description, orderIndex, content, estimatedMinutes, languageCode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        course.id,
        `Lesson ${i + 1}: ${topic.title}`,
        `Learn about ${topic.title.toLowerCase()} in ${course.languageName}. This lesson covers essential vocabulary and grammar points.`,
        i + 1,
        `# ${topic.title}\n\nIn this lesson, you will learn:\n\n- Essential vocabulary related to ${topic.title.toLowerCase()}\n- Grammar: ${topic.grammar.join(', ')}\n- Practical examples and exercises\n\nLet's start learning!`,
        15,
        course.languageCode
      ]);
      
      const lessonId = lessonResult.insertId;
      lessonCount++;
      
      // Criar 5 exercícios para cada lição
      const exercises = [
        {
          type: 'multiple_choice',
          question: `What is the correct way to say "${topic.title.split(' ')[0]}" in ${course.languageName}?`,
          correctAnswer: `Correct answer in ${course.languageName}`,
          options: JSON.stringify([
            `Correct answer in ${course.languageName}`,
            'Option 2',
            'Option 3',
            'Option 4'
          ])
        },
        {
          type: 'fill_blank',
          question: `Complete the sentence with the correct word.`,
          correctAnswer: 'correct word',
          options: JSON.stringify(['correct word', 'word 2', 'word 3', 'word 4'])
        },
        {
          type: 'translation',
          question: `Translate to ${course.languageName}: "Hello, how are you?"`,
          correctAnswer: `Translation in ${course.languageName}`,
          options: null
        },
        {
          type: 'listening',
          question: 'Listen and select the correct word you hear',
          correctAnswer: 'correct word',
          options: JSON.stringify(['correct word', 'similar word 1', 'similar word 2', 'similar word 3'])
        },
        {
          type: 'speaking',
          question: `Repeat after the teacher: Practice your pronunciation`,
          correctAnswer: 'Expected pronunciation',
          options: null
        }
      ];
      
      for (let j = 0; j < exercises.length; j++) {
        const ex = exercises[j];
        await conn.query(`
          INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, points)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [lessonId, ex.type, ex.question, ex.correctAnswer, ex.options, j + 1, 20]);
        exerciseCount++;
      }
      
      console.log(`    ✅ Lição ${i + 1}: ${topic.title} + 5 exercícios`);
      
    } catch (error) {
      console.error(`    ❌ Erro na lição ${i + 1}:`, error.message);
    }
  }
}

console.log(`\n\n🎉 POPULAÇÃO COMPLETA!\n`);
console.log(`📊 ESTATÍSTICAS FINAIS:`);
console.log(`   - Idiomas: ${languageCount}`);
console.log(`   - Cursos: ${courseCount}`);
console.log(`   - Lições: ${lessonCount}`);
console.log(`   - Exercícios: ${exerciseCount}`);
console.log(`\n✅ Banco de dados pronto para uso!\n`);

await conn.end();
