/**
 * fill-remaining-exercises.mjs
 * Adiciona exercícios ricos nas lições que ainda não têm exercícios
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error('DATABASE_URL not set');

function parseDbUrl(url) {
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('Invalid DATABASE_URL');
  return {
    user: match[1], password: match[2], host: match[3],
    port: parseInt(match[4]), database: match[5],
    ssl: { rejectUnauthorized: true },
  };
}

const EXERCISES_BY_TITLE = {
  'A Família': [
    { type: 'multiple_choice', question: 'How do you say "mother" in English?', correctAnswer: 'Mother', options: ['Mother', 'Sister', 'Aunt', 'Grandmother'], points: 10 },
    { type: 'fill_blank', question: 'My father\'s brother is my _____.', correctAnswer: 'uncle', options: ['uncle', 'cousin', 'nephew', 'brother'], points: 10 },
    { type: 'translation', question: 'Translate: "Minha família tem quatro pessoas: pai, mãe e dois filhos."', correctAnswer: 'My family has four people: father, mother and two children.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What do you call your sister\'s son?', correctAnswer: 'Nephew', options: ['Nephew', 'Cousin', 'Son', 'Brother'], points: 15 },
    { type: 'fill_blank', question: 'She is my _____ — we have the same parents.', correctAnswer: 'sister', options: ['sister', 'cousin', 'aunt', 'niece'], points: 10 },
    { type: 'multiple_choice', question: 'What is the plural of "child"?', correctAnswer: 'Children', options: ['Children', 'Childs', 'Childrens', 'Child'], points: 15 },
    { type: 'fill_blank', question: 'My parents\' parents are my _____.', correctAnswer: 'grandparents', options: ['grandparents', 'great-parents', 'ancestors', 'elders'], points: 10 },
    { type: 'translation', question: 'Translate: "Ele é filho único — não tem irmãos."', correctAnswer: 'He is an only child — he has no siblings.', options: null, points: 20 },
  ],
  'My Family': [
    { type: 'multiple_choice', question: 'Which sentence is grammatically correct?', correctAnswer: 'My family is very important to me.', options: ['My family is very important to me.', 'My family are very important to me.', 'My family was very important to I.', 'My family be very important to me.'], points: 15 },
    { type: 'fill_blank', question: 'I have two brothers and one sister. We are _____ in total.', correctAnswer: 'four siblings', options: ['four siblings', 'three siblings', 'five siblings', 'two siblings'], points: 15 },
    { type: 'translation', question: 'Translate: "Minha avó materna mora com a gente."', correctAnswer: 'My maternal grandmother lives with us.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What does "extended family" mean?', correctAnswer: 'Family beyond the immediate household, including aunts, uncles, cousins', options: ['Family beyond the immediate household, including aunts, uncles, cousins', 'A very large nuclear family', 'Family members who live abroad', 'Adopted family members'], points: 20 },
    { type: 'fill_blank', question: 'My parents got _____ 30 years ago and are still together.', correctAnswer: 'married', options: ['married', 'divorced', 'engaged', 'separated'], points: 10 },
    { type: 'multiple_choice', question: 'What is a "blended family"?', correctAnswer: 'A family where one or both parents have children from previous relationships', options: ['A family where one or both parents have children from previous relationships', 'A family with twins', 'A multicultural family', 'A family with many children'], points: 20 },
    { type: 'fill_blank', question: 'She takes after her mother — they have the same _____ and personality.', correctAnswer: 'appearance', options: ['appearance', 'name', 'job', 'hobby'], points: 15 },
    { type: 'translation', question: 'Translate: "Reunimos a família toda no Natal."', correctAnswer: 'We gather the whole family at Christmas.', options: null, points: 20 },
  ],
  'Numbers 1-20': [
    { type: 'multiple_choice', question: 'How do you write the number 15 in words?', correctAnswer: 'Fifteen', options: ['Fifteen', 'Fiveteen', 'Fiften', 'Fifteen'], points: 10 },
    { type: 'fill_blank', question: 'There are _____ days in two weeks.', correctAnswer: 'fourteen', options: ['fourteen', 'twelve', 'sixteen', 'ten'], points: 15 },
    { type: 'multiple_choice', question: 'Which number comes between 17 and 19?', correctAnswer: 'Eighteen', options: ['Eighteen', 'Sixteen', 'Twenty', 'Seventeen'], points: 10 },
    { type: 'translation', question: 'Translate: "Ela tem dezessete anos e seu irmão tem doze."', correctAnswer: 'She is seventeen years old and her brother is twelve.', options: null, points: 20 },
    { type: 'fill_blank', question: 'A dozen equals _____ items.', correctAnswer: 'twelve', options: ['twelve', 'ten', 'fifteen', 'twenty'], points: 15 },
    { type: 'multiple_choice', question: 'What is 8 + 9?', correctAnswer: 'Seventeen', options: ['Seventeen', 'Sixteen', 'Eighteen', 'Fifteen'], points: 10 },
    { type: 'fill_blank', question: 'There are _____ fingers on both hands combined.', correctAnswer: 'ten', options: ['ten', 'eight', 'twelve', 'twenty'], points: 10 },
    { type: 'multiple_choice', question: 'How many sides does an octagon have?', correctAnswer: 'Eight', options: ['Eight', 'Six', 'Ten', 'Seven'], points: 15 },
  ],
  'Colors & Descriptions': [
    { type: 'multiple_choice', question: 'Which adjective describes something that is very bright and vivid in color?', correctAnswer: 'Vibrant', options: ['Vibrant', 'Dull', 'Pale', 'Faded'], points: 15 },
    { type: 'fill_blank', question: 'The sunset was a beautiful _____ of orange and pink.', correctAnswer: 'blend', options: ['blend', 'mix', 'shade', 'tone'], points: 15 },
    { type: 'translation', question: 'Translate: "Ela usava um vestido azul-marinho com detalhes dourados."', correctAnswer: 'She was wearing a navy blue dress with golden details.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What does "turquoise" look like?', correctAnswer: 'A blue-green color like tropical ocean water', options: ['A blue-green color like tropical ocean water', 'A dark purple color', 'A bright red color', 'A pale yellow color'], points: 15 },
    { type: 'fill_blank', question: 'The walls were painted a soft _____ color, creating a calm atmosphere.', correctAnswer: 'beige', options: ['beige', 'crimson', 'neon', 'charcoal'], points: 10 },
    { type: 'multiple_choice', question: 'Which word means "very dark black"?', correctAnswer: 'Jet black', options: ['Jet black', 'Charcoal', 'Ebony', 'Pitch black'], points: 15 },
    { type: 'fill_blank', question: 'The old photograph had faded to a _____ yellow color.', correctAnswer: 'sepia', options: ['sepia', 'golden', 'amber', 'cream'], points: 15 },
    { type: 'multiple_choice', question: 'What color is "scarlet"?', correctAnswer: 'A bright red', options: ['A bright red', 'A dark blue', 'A light purple', 'A deep orange'], points: 10 },
  ],
  'Animals & Nature': [
    { type: 'multiple_choice', question: 'What is the largest land animal on Earth?', correctAnswer: 'African elephant', options: ['African elephant', 'Hippopotamus', 'Giraffe', 'White rhinoceros'], points: 15 },
    { type: 'fill_blank', question: 'A group of wolves is called a _____.', correctAnswer: 'pack', options: ['pack', 'herd', 'flock', 'pride'], points: 15 },
    { type: 'translation', question: 'Translate: "As baleias são mamíferos que vivem no oceano."', correctAnswer: 'Whales are mammals that live in the ocean.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What do you call an animal that eats only plants?', correctAnswer: 'Herbivore', options: ['Herbivore', 'Carnivore', 'Omnivore', 'Insectivore'], points: 15 },
    { type: 'fill_blank', question: 'The Amazon rainforest is home to an incredible _____ of plant and animal species.', correctAnswer: 'diversity', options: ['diversity', 'variety', 'collection', 'amount'], points: 15 },
    { type: 'multiple_choice', question: 'What is "photosynthesis"?', correctAnswer: 'The process by which plants convert sunlight into food', options: ['The process by which plants convert sunlight into food', 'The process of animal digestion', 'The way plants absorb water', 'The cycle of seasons'], points: 20 },
    { type: 'fill_blank', question: 'Birds migrate south in _____ to escape the cold winter.', correctAnswer: 'autumn', options: ['autumn', 'spring', 'summer', 'winter'], points: 10 },
    { type: 'multiple_choice', question: 'What does "endangered species" mean?', correctAnswer: 'A species at risk of extinction', options: ['A species at risk of extinction', 'A dangerous wild animal', 'A recently discovered species', 'A species that is invasive'], points: 15 },
  ],
  'School Life': [
    { type: 'multiple_choice', question: 'What does "curriculum" mean?', correctAnswer: 'The subjects and content taught in a school', options: ['The subjects and content taught in a school', 'A school timetable', 'A student\'s grade report', 'The school building'], points: 15 },
    { type: 'fill_blank', question: 'The teacher asked us to _____ our homework by Friday.', correctAnswer: 'submit', options: ['submit', 'hand', 'give', 'deliver'], points: 10 },
    { type: 'translation', question: 'Translate: "Eu preciso estudar para a prova de matemática amanhã."', correctAnswer: 'I need to study for the math test tomorrow.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What is a "thesis" in academic writing?', correctAnswer: 'The main argument or central claim of an essay', options: ['The main argument or central claim of an essay', 'The conclusion of a paper', 'A list of references', 'The introduction paragraph'], points: 20 },
    { type: 'fill_blank', question: 'She graduated _____ honors from the university.', correctAnswer: 'with', options: ['with', 'in', 'by', 'at'], points: 15 },
    { type: 'multiple_choice', question: 'What does "extracurricular" mean?', correctAnswer: 'Activities done outside of regular school classes', options: ['Activities done outside of regular school classes', 'Extra homework', 'Advanced courses', 'After-school tutoring'], points: 15 },
    { type: 'fill_blank', question: 'The professor gave us a _____ to read before the next class.', correctAnswer: 'syllabus', options: ['syllabus', 'textbook', 'handout', 'assignment'], points: 15 },
    { type: 'multiple_choice', question: 'What is "plagiarism"?', correctAnswer: 'Copying someone else\'s work and presenting it as your own', options: ['Copying someone else\'s work and presenting it as your own', 'Citing sources incorrectly', 'Writing a very long essay', 'Failing an exam'], points: 20 },
  ],
  'Stock Market Basics': [
    { type: 'multiple_choice', question: 'What is a "stock" or "share"?', correctAnswer: 'A unit of ownership in a company', options: ['A unit of ownership in a company', 'A type of bank loan', 'A government bond', 'A savings account'], points: 15 },
    { type: 'fill_blank', question: 'When a company\'s stock price falls significantly, it is called a market _____.', correctAnswer: 'crash', options: ['crash', 'drop', 'fall', 'decline'], points: 15 },
    { type: 'translation', question: 'Translate: "Investir em ações pode ser arriscado, mas também lucrativo."', correctAnswer: 'Investing in stocks can be risky but also profitable.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What does "bull market" mean?', correctAnswer: 'A period of rising stock prices and economic optimism', options: ['A period of rising stock prices and economic optimism', 'A period of falling stock prices', 'A market for agricultural products', 'A type of investment fund'], points: 20 },
    { type: 'fill_blank', question: 'A _____ is a payment made to shareholders from a company\'s profits.', correctAnswer: 'dividend', options: ['dividend', 'bonus', 'interest', 'return'], points: 15 },
    { type: 'multiple_choice', question: 'What does "diversification" mean in investing?', correctAnswer: 'Spreading investments across different assets to reduce risk', options: ['Spreading investments across different assets to reduce risk', 'Investing all money in one stock', 'Selling stocks at a loss', 'Buying only government bonds'], points: 20 },
    { type: 'fill_blank', question: 'The _____ price is the value at which a stock is currently trading.', correctAnswer: 'market', options: ['market', 'face', 'book', 'strike'], points: 10 },
    { type: 'multiple_choice', question: 'What is an "IPO"?', correctAnswer: 'Initial Public Offering — when a company first sells shares to the public', options: ['Initial Public Offering — when a company first sells shares to the public', 'International Portfolio Option', 'Index Price Overview', 'Investor Profit Opportunity'], points: 20 },
  ],
  'Scientific Research': [
    { type: 'multiple_choice', question: 'What is the "scientific method"?', correctAnswer: 'A systematic process of observation, hypothesis, experimentation, and conclusion', options: ['A systematic process of observation, hypothesis, experimentation, and conclusion', 'A way to memorize facts', 'A type of laboratory equipment', 'A research funding process'], points: 20 },
    { type: 'fill_blank', question: 'A _____ is an educated guess that can be tested through experimentation.', correctAnswer: 'hypothesis', options: ['hypothesis', 'theory', 'fact', 'conclusion'], points: 15 },
    { type: 'translation', question: 'Translate: "Os resultados da pesquisa foram publicados em uma revista científica."', correctAnswer: 'The research results were published in a scientific journal.', options: null, points: 20 },
    { type: 'multiple_choice', question: 'What is a "control group" in an experiment?', correctAnswer: 'A group that does not receive the experimental treatment, used for comparison', options: ['A group that does not receive the experimental treatment, used for comparison', 'The group that gets the highest dose', 'The scientists conducting the experiment', 'The group with the best results'], points: 20 },
    { type: 'fill_blank', question: 'The experiment was _____ three times to ensure the results were consistent.', correctAnswer: 'replicated', options: ['replicated', 'repeated', 'redone', 'reproduced'], points: 15 },
    { type: 'multiple_choice', question: 'What does "peer review" mean in science?', correctAnswer: 'The evaluation of scientific work by other experts in the same field', options: ['The evaluation of scientific work by other experts in the same field', 'A student reviewing classmates\' work', 'A government inspection of laboratories', 'A public vote on research topics'], points: 20 },
    { type: 'fill_blank', question: 'Scientists use _____ data to support their conclusions.', correctAnswer: 'empirical', options: ['empirical', 'theoretical', 'anecdotal', 'historical'], points: 15 },
    { type: 'multiple_choice', question: 'What is the difference between a "theory" and a "law" in science?', correctAnswer: 'A theory explains why something happens; a law describes what happens', options: ['A theory explains why something happens; a law describes what happens', 'A theory is proven; a law is not', 'A law is more important than a theory', 'They mean the same thing in science'], points: 20 },
  ],
};

async function fillRemainingExercises() {
  const dbConfig = parseDbUrl(DB_URL);
  const conn = await mysql.createConnection(dbConfig);
  
  console.log('🔍 Fetching lessons with 0 exercises...');
  const [lessons] = await conn.execute(`
    SELECT l.id, l.title, l.languageCode, COUNT(e.id) as ex_count 
    FROM lessons l 
    LEFT JOIN exercises e ON e.lessonId = l.id 
    GROUP BY l.id 
    HAVING ex_count = 0
    ORDER BY l.id
  `);
  
  console.log(`Found ${lessons.length} lessons with 0 exercises\n`);
  
  let totalInserted = 0;
  let filled = 0;
  
  for (const lesson of lessons) {
    const exercises = EXERCISES_BY_TITLE[lesson.title];
    
    if (!exercises) {
      console.log(`⏭️  No exercises defined for: "${lesson.title}" (ID: ${lesson.id})`);
      continue;
    }
    
    console.log(`📚 Filling: "${lesson.title}" (ID: ${lesson.id})`);
    
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const optionsJson = ex.options ? JSON.stringify(ex.options) : null;
      
      await conn.execute(
        `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lesson.id, ex.type, ex.question, ex.correctAnswer, optionsJson,
          i + 1,
          ex.type === 'translation' ? 0.8 : (ex.points >= 20 ? 0.7 : 0.5),
          ex.points,
        ]
      );
      totalInserted++;
    }
    
    console.log(`   ✅ Inserted ${exercises.length} exercises`);
    filled++;
  }
  
  // Also upgrade lessons that still have old trivial exercises (5 exercises only)
  console.log('\n🔍 Checking for lessons with only 5 exercises (old trivial ones)...');
  const [trivialLessons] = await conn.execute(`
    SELECT l.id, l.title, l.languageCode, COUNT(e.id) as ex_count 
    FROM lessons l 
    LEFT JOIN exercises e ON e.lessonId = l.id 
    GROUP BY l.id 
    HAVING ex_count = 5
    ORDER BY l.id
  `);
  
  for (const lesson of trivialLessons) {
    const exercises = EXERCISES_BY_TITLE[lesson.title];
    if (!exercises) continue;
    
    console.log(`📚 Upgrading trivial: "${lesson.title}" (ID: ${lesson.id})`);
    await conn.execute('DELETE FROM exercises WHERE lessonId = ?', [lesson.id]);
    
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await conn.execute(
        `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lesson.id, ex.type, ex.question, ex.correctAnswer,
          ex.options ? JSON.stringify(ex.options) : null,
          i + 1,
          ex.type === 'translation' ? 0.8 : (ex.points >= 20 ? 0.7 : 0.5),
          ex.points,
        ]
      );
      totalInserted++;
    }
    console.log(`   ✅ Replaced with ${exercises.length} rich exercises`);
    filled++;
  }
  
  await conn.end();
  console.log(`\n🎉 Done! Filled/upgraded ${filled} lessons with ${totalInserted} exercises total.`);
}

fillRemainingExercises().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
