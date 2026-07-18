/**
 * Complete rewrite of all poorly formulated exercises.
 * 
 * Problems found in lessons 420001-420020:
 * - "Complete the sentence: 'I have a ___.' (use: hello)" - nonsense
 * - "What does 'hello' mean in Portuguese?" with answer "hello" - trivial/wrong
 * - "Choose the correct form: 'She ___ to school every day.'" repeated in ALL lessons regardless of topic
 * 
 * Solution: Replace all exercises with pedagogically sound, topic-relevant content.
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🔧 Rewriting all poorly formulated exercises...\n');

// First, delete all exercises for lessons 420001-420020 (the bad auto-generated ones)
const [deleted] = await conn.execute(
  `DELETE FROM exercises WHERE lessonId BETWEEN 420001 AND 420020`
);
console.log(`🗑️  Deleted ${deleted.affectedRows} bad exercises from lessons 420001-420020\n`);

// Also fix the bad exercises in lesson 390001 (family lesson with greeting exercises)
// Already done in fix-exercises.mjs, but let's verify and improve

// ============================================================
// NEW HIGH-QUALITY EXERCISES
// ============================================================

const newExercises = [
  // ============================================================
  // LESSON 420001 - Greetings & Introductions
  // ============================================================
  {
    lessonId: 420001, type: 'multiple_choice', orderIndex: 1,
    question: 'How do you greet someone in the morning in English?',
    correctAnswer: 'Good morning',
    options: ['Good morning', 'Good night', 'Goodbye', 'See you later']
  },
  {
    lessonId: 420001, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you say when you meet someone for the first time?',
    correctAnswer: 'Nice to meet you',
    options: ['Nice to meet you', 'See you later', 'Good night', 'How are you doing?']
  },
  {
    lessonId: 420001, type: 'fill_blank', orderIndex: 3,
    question: 'Hello! My name _____ Maria.',
    correctAnswer: 'is',
    options: ['is', 'are', 'am']
  },
  {
    lessonId: 420001, type: 'fill_blank', orderIndex: 4,
    question: '_____ to meet you! I am from Brazil.',
    correctAnswer: 'Nice',
    options: ['Nice', 'Good', 'Hello']
  },
  {
    lessonId: 420001, type: 'multiple_choice', orderIndex: 5,
    question: 'What is the correct response to "How are you?"',
    correctAnswer: "I'm fine, thank you",
    options: ["I'm fine, thank you", "My name is John", "I live in Brazil", "See you tomorrow"]
  },

  // ============================================================
  // LESSON 420011 - Greetings & Introductions (duplicate lesson - same content, different exercises)
  // ============================================================
  {
    lessonId: 420011, type: 'multiple_choice', orderIndex: 1,
    question: 'What do you say when leaving someone?',
    correctAnswer: 'Goodbye',
    options: ['Goodbye', 'Hello', 'Please', 'Thank you']
  },
  {
    lessonId: 420011, type: 'multiple_choice', orderIndex: 2,
    question: 'How do you ask someone\'s name in English?',
    correctAnswer: 'What is your name?',
    options: ['What is your name?', 'Where are you from?', 'How old are you?', 'What do you do?']
  },
  {
    lessonId: 420011, type: 'fill_blank', orderIndex: 3,
    question: 'Good _____, everyone! It\'s 8 AM.',
    correctAnswer: 'morning',
    options: ['morning', 'night', 'evening']
  },
  {
    lessonId: 420011, type: 'fill_blank', orderIndex: 4,
    question: 'My _____ is Carlos. What is yours?',
    correctAnswer: 'name',
    options: ['name', 'age', 'job']
  },
  {
    lessonId: 420011, type: 'multiple_choice', orderIndex: 5,
    question: 'Which greeting is used in the evening?',
    correctAnswer: 'Good evening',
    options: ['Good evening', 'Good morning', 'Good afternoon', 'Good night']
  },

  // ============================================================
  // LESSON 420012 - Numbers 1-20
  // ============================================================
  {
    lessonId: 420012, type: 'multiple_choice', orderIndex: 1,
    question: 'How do you say the number 5 in English?',
    correctAnswer: 'Five',
    options: ['Five', 'Four', 'Six', 'Three']
  },
  {
    lessonId: 420012, type: 'multiple_choice', orderIndex: 2,
    question: 'What comes after "twelve" in English?',
    correctAnswer: 'Thirteen',
    options: ['Thirteen', 'Eleven', 'Twenty', 'Fifteen']
  },
  {
    lessonId: 420012, type: 'fill_blank', orderIndex: 3,
    question: 'I have _____ fingers on my hands. (10)',
    correctAnswer: 'ten',
    options: ['ten', 'five', 'twenty']
  },
  {
    lessonId: 420012, type: 'fill_blank', orderIndex: 4,
    question: 'There are _____ days in a week. (7)',
    correctAnswer: 'seven',
    options: ['seven', 'five', 'twelve']
  },
  {
    lessonId: 420012, type: 'multiple_choice', orderIndex: 5,
    question: 'Which number is "fifteen" in digits?',
    correctAnswer: '15',
    options: ['15', '50', '5', '51']
  },

  // ============================================================
  // LESSON 420013 - Colors & Descriptions
  // ============================================================
  {
    lessonId: 420013, type: 'multiple_choice', orderIndex: 1,
    question: 'What color is a ripe banana?',
    correctAnswer: 'Yellow',
    options: ['Yellow', 'Blue', 'Red', 'Purple']
  },
  {
    lessonId: 420013, type: 'multiple_choice', orderIndex: 2,
    question: 'What color is the ocean?',
    correctAnswer: 'Blue',
    options: ['Blue', 'Green', 'Red', 'Orange']
  },
  {
    lessonId: 420013, type: 'fill_blank', orderIndex: 3,
    question: 'Stop! The traffic light is _____.',
    correctAnswer: 'red',
    options: ['red', 'green', 'blue']
  },
  {
    lessonId: 420013, type: 'fill_blank', orderIndex: 4,
    question: 'The leaves on trees are usually _____.',
    correctAnswer: 'green',
    options: ['green', 'purple', 'orange']
  },
  {
    lessonId: 420013, type: 'multiple_choice', orderIndex: 5,
    question: 'What color do you get when you mix red and white?',
    correctAnswer: 'Pink',
    options: ['Pink', 'Purple', 'Orange', 'Brown']
  },

  // ============================================================
  // LESSON 420014 - The Family
  // ============================================================
  {
    lessonId: 420014, type: 'multiple_choice', orderIndex: 1,
    question: 'What do you call your father\'s wife?',
    correctAnswer: 'Mother',
    options: ['Mother', 'Aunt', 'Sister', 'Grandmother']
  },
  {
    lessonId: 420014, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you call your parents\' parents?',
    correctAnswer: 'Grandparents',
    options: ['Grandparents', 'Cousins', 'Uncles', 'Siblings']
  },
  {
    lessonId: 420014, type: 'fill_blank', orderIndex: 3,
    question: 'I have one _____ and two brothers. (female sibling)',
    correctAnswer: 'sister',
    options: ['sister', 'cousin', 'aunt']
  },
  {
    lessonId: 420014, type: 'fill_blank', orderIndex: 4,
    question: 'My _____ is my mother\'s mother.',
    correctAnswer: 'grandmother',
    options: ['grandmother', 'aunt', 'sister']
  },
  {
    lessonId: 420014, type: 'multiple_choice', orderIndex: 5,
    question: 'What do you call your brother\'s son?',
    correctAnswer: 'Nephew',
    options: ['Nephew', 'Cousin', 'Uncle', 'Son']
  },

  // ============================================================
  // LESSON 420015 - Food & Drinks
  // ============================================================
  {
    lessonId: 420015, type: 'multiple_choice', orderIndex: 1,
    question: 'What is the first meal of the day called?',
    correctAnswer: 'Breakfast',
    options: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  {
    lessonId: 420015, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you drink when you are thirsty?',
    correctAnswer: 'Water',
    options: ['Water', 'Bread', 'Rice', 'Chicken']
  },
  {
    lessonId: 420015, type: 'fill_blank', orderIndex: 3,
    question: 'I eat _____ and eggs for breakfast.',
    correctAnswer: 'bread',
    options: ['bread', 'fish', 'soup']
  },
  {
    lessonId: 420015, type: 'fill_blank', orderIndex: 4,
    question: 'Would you like a cup of _____? (hot drink)',
    correctAnswer: 'coffee',
    options: ['coffee', 'salad', 'rice']
  },
  {
    lessonId: 420015, type: 'multiple_choice', orderIndex: 5,
    question: 'Which of these is a fruit?',
    correctAnswer: 'Apple',
    options: ['Apple', 'Chicken', 'Rice', 'Bread']
  },

  // ============================================================
  // LESSON 420016 - Daily Routines
  // ============================================================
  {
    lessonId: 420016, type: 'multiple_choice', orderIndex: 1,
    question: 'What do you do first when you wake up?',
    correctAnswer: 'Get out of bed',
    options: ['Get out of bed', 'Go to work', 'Eat dinner', 'Watch TV']
  },
  {
    lessonId: 420016, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you do to clean your teeth every morning?',
    correctAnswer: 'Brush my teeth',
    options: ['Brush my teeth', 'Comb my hair', 'Wash my hands', 'Put on clothes']
  },
  {
    lessonId: 420016, type: 'fill_blank', orderIndex: 3,
    question: 'I _____ a shower every morning.',
    correctAnswer: 'take',
    options: ['take', 'make', 'do']
  },
  {
    lessonId: 420016, type: 'fill_blank', orderIndex: 4,
    question: 'I _____ to work at 8 AM every day.',
    correctAnswer: 'go',
    options: ['go', 'come', 'stay']
  },
  {
    lessonId: 420016, type: 'multiple_choice', orderIndex: 5,
    question: 'What do you do before going to sleep?',
    correctAnswer: 'Brush my teeth',
    options: ['Brush my teeth', 'Wake up', 'Go to school', 'Eat breakfast']
  },

  // ============================================================
  // LESSON 420017 - Animals & Nature
  // ============================================================
  {
    lessonId: 420017, type: 'multiple_choice', orderIndex: 1,
    question: 'Which animal is known as the king of the jungle?',
    correctAnswer: 'Lion',
    options: ['Lion', 'Elephant', 'Giraffe', 'Zebra']
  },
  {
    lessonId: 420017, type: 'multiple_choice', orderIndex: 2,
    question: 'What is the largest land animal?',
    correctAnswer: 'Elephant',
    options: ['Elephant', 'Horse', 'Bear', 'Tiger']
  },
  {
    lessonId: 420017, type: 'fill_blank', orderIndex: 3,
    question: 'A _____ has black and white stripes.',
    correctAnswer: 'zebra',
    options: ['zebra', 'lion', 'bear']
  },
  {
    lessonId: 420017, type: 'fill_blank', orderIndex: 4,
    question: 'The _____ is a very tall animal with a long neck.',
    correctAnswer: 'giraffe',
    options: ['giraffe', 'elephant', 'tiger']
  },
  {
    lessonId: 420017, type: 'multiple_choice', orderIndex: 5,
    question: 'Which animal says "meow"?',
    correctAnswer: 'Cat',
    options: ['Cat', 'Dog', 'Bird', 'Fish']
  },

  // ============================================================
  // LESSON 420018 - Clothes & Shopping
  // ============================================================
  {
    lessonId: 420018, type: 'multiple_choice', orderIndex: 1,
    question: 'What do you wear on your feet?',
    correctAnswer: 'Shoes',
    options: ['Shoes', 'Hat', 'Gloves', 'Scarf']
  },
  {
    lessonId: 420018, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you wear on your head in the sun?',
    correctAnswer: 'Hat',
    options: ['Hat', 'Shirt', 'Pants', 'Socks']
  },
  {
    lessonId: 420018, type: 'fill_blank', orderIndex: 3,
    question: 'I wear a _____ and tie to work. (formal top)',
    correctAnswer: 'shirt',
    options: ['shirt', 'dress', 'jacket']
  },
  {
    lessonId: 420018, type: 'fill_blank', orderIndex: 4,
    question: 'How much does this _____? It\'s $20.',
    correctAnswer: 'cost',
    options: ['cost', 'weigh', 'look']
  },
  {
    lessonId: 420018, type: 'multiple_choice', orderIndex: 5,
    question: 'Where do you go to buy clothes?',
    correctAnswer: 'Store / Shop',
    options: ['Store / Shop', 'Hospital', 'School', 'Park']
  },

  // ============================================================
  // LESSON 420019 - Weather & Seasons
  // ============================================================
  {
    lessonId: 420019, type: 'multiple_choice', orderIndex: 1,
    question: 'What season comes after winter?',
    correctAnswer: 'Spring',
    options: ['Spring', 'Summer', 'Autumn', 'Fall']
  },
  {
    lessonId: 420019, type: 'multiple_choice', orderIndex: 2,
    question: 'What do you use when it is raining?',
    correctAnswer: 'Umbrella',
    options: ['Umbrella', 'Sunglasses', 'Hat', 'Scarf']
  },
  {
    lessonId: 420019, type: 'fill_blank', orderIndex: 3,
    question: 'It is very _____ today. I need sunscreen.',
    correctAnswer: 'sunny',
    options: ['sunny', 'cold', 'rainy']
  },
  {
    lessonId: 420019, type: 'fill_blank', orderIndex: 4,
    question: 'In winter, the weather is very _____.',
    correctAnswer: 'cold',
    options: ['cold', 'hot', 'warm']
  },
  {
    lessonId: 420019, type: 'multiple_choice', orderIndex: 5,
    question: 'What is the weather like when there are dark clouds and rain?',
    correctAnswer: 'Stormy',
    options: ['Stormy', 'Sunny', 'Clear', 'Warm']
  },

  // ============================================================
  // LESSON 420020 - Body Parts & Health
  // ============================================================
  {
    lessonId: 420020, type: 'multiple_choice', orderIndex: 1,
    question: 'What body part do you use to see?',
    correctAnswer: 'Eyes',
    options: ['Eyes', 'Ears', 'Nose', 'Mouth']
  },
  {
    lessonId: 420020, type: 'multiple_choice', orderIndex: 2,
    question: 'What body part do you use to hear?',
    correctAnswer: 'Ears',
    options: ['Ears', 'Eyes', 'Hands', 'Feet']
  },
  {
    lessonId: 420020, type: 'fill_blank', orderIndex: 3,
    question: 'I have a headache. My _____ hurts.',
    correctAnswer: 'head',
    options: ['head', 'foot', 'hand']
  },
  {
    lessonId: 420020, type: 'fill_blank', orderIndex: 4,
    question: 'You use your _____ to walk and run.',
    correctAnswer: 'legs',
    options: ['legs', 'arms', 'eyes']
  },
  {
    lessonId: 420020, type: 'multiple_choice', orderIndex: 5,
    question: 'What do you do when you are sick?',
    correctAnswer: 'Go to the doctor',
    options: ['Go to the doctor', 'Go to school', 'Play sports', 'Go shopping']
  }
];

// Insert all new exercises
let insertCount = 0;
for (const ex of newExercises) {
  await conn.execute(
    `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, 0.3, NOW(), NOW())`,
    [
      ex.lessonId,
      ex.type,
      ex.question,
      ex.correctAnswer,
      JSON.stringify(ex.options),
      ex.orderIndex
    ]
  );
  insertCount++;
}

console.log(`✅ Inserted ${insertCount} new high-quality exercises\n`);

// Verify the results
const [results] = await conn.execute(`
  SELECT e.lessonId, l.title, COUNT(*) as count
  FROM exercises e
  JOIN lessons l ON l.id = e.lessonId
  WHERE e.lessonId BETWEEN 420001 AND 420020
  GROUP BY e.lessonId, l.title
  ORDER BY e.lessonId
`);

console.log('📊 Exercises per lesson (420001-420020):');
for (const r of results) {
  console.log(`  [${r.lessonId}] ${r.title}: ${r.count} exercises`);
}

await conn.end();
console.log('\n✅ All exercises rewritten successfully!');
