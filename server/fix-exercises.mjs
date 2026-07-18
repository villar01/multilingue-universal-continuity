/**
 * Fix poorly formulated exercises in the database.
 * 
 * Problems found:
 * 1. Lesson 390001 "A Família" has exercises about greetings (Hello, Good morning) instead of family vocabulary
 * 2. Exercise 180006: "What is the first word you learn in English?" - subjective, no pedagogical value
 * 3. All exercises in lesson 390001 need to be replaced with family-themed content
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🔧 Fixing poorly formulated exercises...\n');

// ============================================================
// FIX LESSON 390001 "A Família" - Replace greeting exercises with family exercises
// ============================================================

const familyFixes = [
  {
    id: 180006,
    question: 'What do you call your mother and father together?',
    correctAnswer: 'Parents',
    options: JSON.stringify(['Parents', 'Siblings', 'Cousins', 'Grandparents']),
    type: 'multiple_choice'
  },
  {
    id: 180007,
    question: 'What is the word for the female parent?',
    correctAnswer: 'Mother',
    options: JSON.stringify(['Father', 'Mother', 'Sister', 'Aunt']),
    type: 'multiple_choice'
  },
  {
    id: 180008,
    question: 'My _____ is the son of my parents.',
    correctAnswer: 'brother',
    options: JSON.stringify(['brother', 'sister', 'cousin']),
    type: 'fill_blank'
  },
  {
    id: 180009,
    question: 'I love my _____. They are my mother and father.',
    correctAnswer: 'parents',
    options: JSON.stringify(['parents', 'friends', 'teachers']),
    type: 'fill_blank'
  },
  {
    id: 180010,
    question: 'What do you call your father\'s mother?',
    correctAnswer: 'Grandmother',
    options: JSON.stringify(['Grandmother', 'Aunt', 'Sister', 'Mother']),
    type: 'multiple_choice'
  }
];

for (const fix of familyFixes) {
  await conn.execute(
    `UPDATE exercises SET question = ?, correctAnswer = ?, options = ?, type = ? WHERE id = ?`,
    [fix.question, fix.correctAnswer, fix.options, fix.type, fix.id]
  );
  console.log(`✅ Fixed exercise ${fix.id}: "${fix.question}"`);
}

// ============================================================
// FIX LESSON 390002 "My Family" - Improve question quality
// ============================================================

// Exercise 180015: "Who are your parents?" - too vague, improve it
await conn.execute(
  `UPDATE exercises SET 
    question = 'What do you call your father and mother together?',
    correctAnswer = 'Parents',
    options = ?
  WHERE id = 180015`,
  [JSON.stringify(['Parents', 'Siblings', 'Relatives', 'Ancestors'])]
);
console.log('✅ Fixed exercise 180015: "What do you call your father and mother together?"');

// ============================================================
// FIX LESSON 390003 "Colors Around Us" - "in the story" is confusing without context
// ============================================================

await conn.execute(
  `UPDATE exercises SET 
    question = 'What color is the sky on a clear day?',
    correctAnswer = 'Blue',
    options = ?
  WHERE id = 180001`,
  [JSON.stringify(['Blue', 'Red', 'Green', 'Yellow'])]
);
console.log('✅ Fixed exercise 180001: "What color is the sky on a clear day?"');

// ============================================================
// FIX LESSON 390007 "Stock Market Basics" - check fill_blank exercise 180034
// ============================================================

// "The stock price is _____." with answer "rising" - ambiguous, improve it
await conn.execute(
  `UPDATE exercises SET 
    question = 'When more people buy stocks, the price is _____.',
    correctAnswer = 'rising',
    options = ?
  WHERE id = 180034`,
  [JSON.stringify(['rising', 'falling', 'stable'])]
);
console.log('✅ Fixed exercise 180034: "When more people buy stocks, the price is _____."');

// ============================================================
// ADD BETTER EXERCISES for lessons that have weak content
// ============================================================

// Check if lesson 390001 needs more family vocabulary exercises
const [existing] = await conn.execute(
  `SELECT COUNT(*) as count FROM exercises WHERE lessonId = 390001`
);
console.log(`\n📊 Lesson 390001 has ${existing[0].count} exercises`);

// Check all exercises now
const [allExercises] = await conn.execute(`
  SELECT e.id, e.lessonId, l.title, e.question, e.correctAnswer 
  FROM exercises e 
  JOIN lessons l ON l.id = e.lessonId 
  ORDER BY e.lessonId, e.orderIndex
`);

console.log('\n📋 All exercises after fixes:');
for (const ex of allExercises) {
  console.log(`  [${ex.lessonId}] ${ex.title}: "${ex.question}" → "${ex.correctAnswer}"`);
}

await conn.end();
console.log('\n✅ All exercises fixed successfully!');
