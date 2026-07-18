import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Lição demo: At the Restaurant
const lessonData = {
  languageCode: 'en',
  title: 'At the Restaurant',
  description: 'Learn how to order food and communicate in a restaurant',
  cefrLevel: 'B1',
  orderIndex: 1,
  ageLevel: 'adulto',
  duration: 15,
  points: 50,
  illustrationUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  storyText: `Tom walked into "The Golden Spoon," a cozy restaurant in downtown. The waiter greeted him with a warm smile. "Good evening, sir. Table for one?" Tom nodded and followed him to a corner table near the window.

The waiter handed him the menu. Tom looked through the options carefully. There were many delicious choices: grilled salmon, chicken pasta, vegetarian pizza, and more. After a few minutes, the waiter returned.

"Are you ready to order, sir?" he asked politely. Tom smiled and said, "Yes, I'd like the grilled salmon with vegetables, please. And a glass of sparkling water."

"Excellent choice!" the waiter replied. "Would you like any appetizers or dessert?" Tom thought for a moment. "I'll have the Caesar salad as an appetizer, and maybe I'll decide on dessert later."

The food arrived quickly. The salmon was perfectly cooked, and the vegetables were fresh and flavorful. Tom enjoyed every bite. When he finished, the waiter asked, "How was everything?"

"It was delicious, thank you!" Tom said. "Could I have the bill, please?" The waiter brought the bill, and Tom paid with his credit card. He left a generous tip because the service was excellent.

As Tom left the restaurant, he felt satisfied and happy. He decided he would definitely come back to "The Golden Spoon" again soon.`,
  videoUrl: null,
  audioUrl: null,
};

const [lessonResult] = await connection.execute(
  `INSERT INTO lessons (languageCode, title, description, cefrLevel, orderIndex, ageLevel, duration, points, illustrationUrl, storyText, videoUrl, audioUrl, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    lessonData.languageCode,
    lessonData.title,
    lessonData.description,
    lessonData.cefrLevel,
    lessonData.orderIndex,
    lessonData.ageLevel,
    lessonData.duration,
    lessonData.points,
    lessonData.illustrationUrl,
    lessonData.storyText,
    lessonData.videoUrl,
    lessonData.audioUrl,
  ]
);

const lessonId = lessonResult.insertId;
console.log(`✅ Lesson created with ID: ${lessonId}`);

// Vocabulários
const vocabularies = [
  { word: 'restaurant', translation: 'restaurante', ipa: '/ˈrestərɑːnt/', example: 'We went to a nice restaurant for dinner.' },
  { word: 'waiter', translation: 'garçom', ipa: '/ˈweɪtər/', example: 'The waiter brought us the menu.' },
  { word: 'menu', translation: 'cardápio', ipa: '/ˈmenjuː/', example: 'Can I see the menu, please?' },
  { word: 'order', translation: 'pedir/fazer pedido', ipa: '/ˈɔːrdər/', example: 'I would like to order the salmon.' },
  { word: 'delicious', translation: 'delicioso', ipa: '/dɪˈlɪʃəs/', example: 'The food was absolutely delicious!' },
  { word: 'bill', translation: 'conta', ipa: '/bɪl/', example: 'Could I have the bill, please?' },
  { word: 'tip', translation: 'gorjeta', ipa: '/tɪp/', example: 'He left a 20% tip for the excellent service.' },
];

for (const vocab of vocabularies) {
  await connection.execute(
    `INSERT INTO vocabularies (lessonId, word, translation, ipa, example, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [lessonId, vocab.word, vocab.translation, vocab.ipa, vocab.example]
  );
}
console.log(`✅ ${vocabularies.length} vocabularies created`);

// Gramáticas
const grammars = [
  {
    title: 'Polite Requests with "Could" and "Would"',
    explanation: 'Use "Could I..." or "Would you..." to make polite requests in restaurants.',
    examples: JSON.stringify([
      'Could I have the bill, please?',
      'Would you like any dessert?',
      'Could you bring me some water?'
    ])
  },
  {
    title: 'Present Perfect for Experiences',
    explanation: 'Use Present Perfect (have/has + past participle) to talk about experiences.',
    examples: JSON.stringify([
      'I have been to this restaurant before.',
      'Have you tried the salmon?',
      'He has never eaten sushi.'
    ])
  },
];

for (const grammar of grammars) {
  await connection.execute(
    `INSERT INTO grammar (lessonId, title, explanation, examples, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [lessonId, grammar.title, grammar.explanation, grammar.examples]
  );
}
console.log(`✅ ${grammars.length} grammar points created`);

// Exercícios
const exercises = [
  {
    type: 'multiple_choice',
    question: 'What is the name of the restaurant Tom visited?',
    correctAnswer: 'The Golden Spoon',
    options: JSON.stringify(['The Golden Spoon', 'The Silver Fork', 'The Cozy Corner', 'Downtown Diner']),
    orderIndex: 1,
  },
  {
    type: 'multiple_choice',
    question: 'What did Tom order as his main dish?',
    correctAnswer: 'Grilled salmon with vegetables',
    options: JSON.stringify(['Grilled salmon with vegetables', 'Chicken pasta', 'Vegetarian pizza', 'Caesar salad']),
    orderIndex: 2,
  },
  {
    type: 'multiple_choice',
    question: 'What did Tom have as an appetizer?',
    correctAnswer: 'Caesar salad',
    options: JSON.stringify(['Caesar salad', 'Soup', 'Bread', 'Nothing']),
    orderIndex: 3,
  },
  {
    type: 'multiple_choice',
    question: 'How did Tom pay for his meal?',
    correctAnswer: 'Credit card',
    options: JSON.stringify(['Credit card', 'Cash', 'Debit card', 'Mobile payment']),
    orderIndex: 4,
  },
  {
    type: 'fill_blank',
    question: 'Complete: "Could I have the ____, please?"',
    correctAnswer: 'bill',
    options: JSON.stringify(['bill', 'menu', 'water', 'check']),
    orderIndex: 5,
  },
];

for (const exercise of exercises) {
  await connection.execute(
    `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [lessonId, exercise.type, exercise.question, exercise.correctAnswer, exercise.options, exercise.orderIndex]
  );
}
console.log(`✅ ${exercises.length} exercises created`);

await connection.end();
console.log(`\n🎉 Demo lesson created successfully! Lesson ID: ${lessonId}`);
console.log(`📍 Access at: /lesson/${lessonId}`);
