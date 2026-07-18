import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Exercícios pedagógicos para as 9 lições vazias
// Cada lição recebe 5 exercícios de qualidade
const exercises = [
  // 420002 - Numbers 1-20
  { lessonId: 420002, type: 'multiple_choice', question: 'How do you write the number 7 in English?', correctAnswer: 'Seven', options: JSON.stringify(['Seven', 'Seventeen', 'Six', 'Eight']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420002, type: 'multiple_choice', question: 'What is the number "twelve" in digits?', correctAnswer: '12', options: JSON.stringify(['12', '20', '2', '21']), orderIndex: 2, difficultyScore: 1, points: 10 },
  { lessonId: 420002, type: 'fill_blank', question: 'There are _____ months in a year. (12)', correctAnswer: 'twelve', options: JSON.stringify(['twelve', 'twenty', 'ten']), orderIndex: 3, difficultyScore: 2, points: 10 },
  { lessonId: 420002, type: 'fill_blank', question: 'A soccer team has _____ players. (11)', correctAnswer: 'eleven', options: JSON.stringify(['eleven', 'ten', 'fifteen']), orderIndex: 4, difficultyScore: 2, points: 10 },
  { lessonId: 420002, type: 'multiple_choice', question: 'Which number comes between sixteen and eighteen?', correctAnswer: 'Seventeen', options: JSON.stringify(['Seventeen', 'Fifteen', 'Nineteen', 'Fourteen']), orderIndex: 5, difficultyScore: 2, points: 10 },

  // 420003 - Colors & Descriptions
  { lessonId: 420003, type: 'multiple_choice', question: 'What color is the sky on a clear day?', correctAnswer: 'Blue', options: JSON.stringify(['Blue', 'Green', 'Yellow', 'Red']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420003, type: 'multiple_choice', question: 'What color do you get when you mix red and white?', correctAnswer: 'Pink', options: JSON.stringify(['Pink', 'Orange', 'Purple', 'Gray']), orderIndex: 2, difficultyScore: 2, points: 10 },
  { lessonId: 420003, type: 'fill_blank', question: 'Grass is _____ in color.', correctAnswer: 'green', options: JSON.stringify(['green', 'blue', 'yellow']), orderIndex: 3, difficultyScore: 1, points: 10 },
  { lessonId: 420003, type: 'fill_blank', question: 'The sun is _____ and bright.', correctAnswer: 'yellow', options: JSON.stringify(['yellow', 'white', 'orange']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420003, type: 'multiple_choice', question: 'Which word describes the size of something very large?', correctAnswer: 'Huge', options: JSON.stringify(['Huge', 'Tiny', 'Narrow', 'Shallow']), orderIndex: 5, difficultyScore: 2, points: 10 },

  // 420004 - The Family
  { lessonId: 420004, type: 'multiple_choice', question: 'What do you call your mother\'s brother?', correctAnswer: 'Uncle', options: JSON.stringify(['Uncle', 'Cousin', 'Nephew', 'Brother']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420004, type: 'multiple_choice', question: 'What do you call the children of your aunt or uncle?', correctAnswer: 'Cousins', options: JSON.stringify(['Cousins', 'Siblings', 'Nephews', 'Grandchildren']), orderIndex: 2, difficultyScore: 2, points: 10 },
  { lessonId: 420004, type: 'fill_blank', question: 'My father\'s father is my _____.', correctAnswer: 'grandfather', options: JSON.stringify(['grandfather', 'uncle', 'brother']), orderIndex: 3, difficultyScore: 1, points: 10 },
  { lessonId: 420004, type: 'fill_blank', question: 'My parents\' daughter is my _____.', correctAnswer: 'sister', options: JSON.stringify(['sister', 'cousin', 'niece']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420004, type: 'multiple_choice', question: 'What do you call a woman who is married to your son?', correctAnswer: 'Daughter-in-law', options: JSON.stringify(['Daughter-in-law', 'Sister-in-law', 'Stepdaughter', 'Niece']), orderIndex: 5, difficultyScore: 3, points: 10 },

  // 420005 - Food & Drinks
  { lessonId: 420005, type: 'multiple_choice', question: 'Which of these is a dairy product?', correctAnswer: 'Cheese', options: JSON.stringify(['Cheese', 'Bread', 'Apple', 'Rice']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420005, type: 'multiple_choice', question: 'What drink is made from grapes?', correctAnswer: 'Wine', options: JSON.stringify(['Wine', 'Beer', 'Tea', 'Juice']), orderIndex: 2, difficultyScore: 2, points: 10 },
  { lessonId: 420005, type: 'fill_blank', question: 'I drink _____ every morning for breakfast. (hot beverage from coffee beans)', correctAnswer: 'coffee', options: JSON.stringify(['coffee', 'tea', 'milk']), orderIndex: 3, difficultyScore: 1, points: 10 },
  { lessonId: 420005, type: 'fill_blank', question: 'We eat _____ and eggs for breakfast. (from pigs)', correctAnswer: 'bacon', options: JSON.stringify(['bacon', 'chicken', 'beef']), orderIndex: 4, difficultyScore: 2, points: 10 },
  { lessonId: 420005, type: 'multiple_choice', question: 'Which of these is a vegetable?', correctAnswer: 'Carrot', options: JSON.stringify(['Carrot', 'Banana', 'Strawberry', 'Mango']), orderIndex: 5, difficultyScore: 1, points: 10 },

  // 420006 - Daily Routines
  { lessonId: 420006, type: 'multiple_choice', question: 'What do most people do first thing in the morning?', correctAnswer: 'Wake up', options: JSON.stringify(['Wake up', 'Have dinner', 'Go to bed', 'Watch TV']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420006, type: 'multiple_choice', question: 'Which activity is typically done before going to sleep?', correctAnswer: 'Brush your teeth', options: JSON.stringify(['Brush your teeth', 'Have breakfast', 'Go to school', 'Exercise']), orderIndex: 2, difficultyScore: 1, points: 10 },
  { lessonId: 420006, type: 'fill_blank', question: 'I _____ a shower every morning to feel fresh.', correctAnswer: 'take', options: JSON.stringify(['take', 'make', 'do']), orderIndex: 3, difficultyScore: 2, points: 10 },
  { lessonId: 420006, type: 'fill_blank', question: 'She _____ to work by bus every weekday.', correctAnswer: 'commutes', options: JSON.stringify(['commutes', 'drives', 'walks']), orderIndex: 4, difficultyScore: 2, points: 10 },
  { lessonId: 420006, type: 'multiple_choice', question: 'What do you say when you are going to sleep?', correctAnswer: 'Good night', options: JSON.stringify(['Good night', 'Good morning', 'Good afternoon', 'Good evening']), orderIndex: 5, difficultyScore: 1, points: 10 },

  // 420007 - Animals & Nature
  { lessonId: 420007, type: 'multiple_choice', question: 'Which animal is known as "man\'s best friend"?', correctAnswer: 'Dog', options: JSON.stringify(['Dog', 'Cat', 'Horse', 'Rabbit']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420007, type: 'multiple_choice', question: 'What do you call a baby cat?', correctAnswer: 'Kitten', options: JSON.stringify(['Kitten', 'Puppy', 'Cub', 'Foal']), orderIndex: 2, difficultyScore: 2, points: 10 },
  { lessonId: 420007, type: 'fill_blank', question: 'The _____ is the largest land animal on Earth.', correctAnswer: 'elephant', options: JSON.stringify(['elephant', 'giraffe', 'rhinoceros']), orderIndex: 3, difficultyScore: 2, points: 10 },
  { lessonId: 420007, type: 'fill_blank', question: 'Birds use their _____ to fly through the sky.', correctAnswer: 'wings', options: JSON.stringify(['wings', 'legs', 'beak']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420007, type: 'multiple_choice', question: 'Which of these animals lives in the ocean?', correctAnswer: 'Dolphin', options: JSON.stringify(['Dolphin', 'Lion', 'Eagle', 'Wolf']), orderIndex: 5, difficultyScore: 1, points: 10 },

  // 420008 - Clothes & Shopping
  { lessonId: 420008, type: 'multiple_choice', question: 'What do you wear on your feet inside shoes?', correctAnswer: 'Socks', options: JSON.stringify(['Socks', 'Gloves', 'Hat', 'Scarf']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420008, type: 'multiple_choice', question: 'Where do you go to buy clothes?', correctAnswer: 'Clothing store', options: JSON.stringify(['Clothing store', 'Pharmacy', 'Library', 'Hospital']), orderIndex: 2, difficultyScore: 1, points: 10 },
  { lessonId: 420008, type: 'fill_blank', question: 'I need to buy a new _____ to wear to the job interview. (formal top)', correctAnswer: 'shirt', options: JSON.stringify(['shirt', 'swimsuit', 'pajamas']), orderIndex: 3, difficultyScore: 2, points: 10 },
  { lessonId: 420008, type: 'fill_blank', question: 'She wore a beautiful red _____ to the party. (one-piece garment for women)', correctAnswer: 'dress', options: JSON.stringify(['dress', 'skirt', 'blouse']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420008, type: 'multiple_choice', question: 'What do you ask when you want to know the price of something?', correctAnswer: 'How much does it cost?', options: JSON.stringify(['How much does it cost?', 'Where is it from?', 'What size is it?', 'Can I try it on?']), orderIndex: 5, difficultyScore: 2, points: 10 },

  // 420009 - Weather & Seasons
  { lessonId: 420009, type: 'multiple_choice', question: 'What season comes after summer?', correctAnswer: 'Autumn', options: JSON.stringify(['Autumn', 'Spring', 'Winter', 'Monsoon']), orderIndex: 1, difficultyScore: 1, points: 10 },
  { lessonId: 420009, type: 'multiple_choice', question: 'What do you use to stay dry when it rains?', correctAnswer: 'Umbrella', options: JSON.stringify(['Umbrella', 'Sunglasses', 'Fan', 'Scarf']), orderIndex: 2, difficultyScore: 1, points: 10 },
  { lessonId: 420009, type: 'fill_blank', question: 'In winter, water can freeze and become _____.', correctAnswer: 'ice', options: JSON.stringify(['ice', 'steam', 'fog']), orderIndex: 3, difficultyScore: 1, points: 10 },
  { lessonId: 420009, type: 'fill_blank', question: 'It is very _____ today. I need to wear sunscreen. (opposite of cold)', correctAnswer: 'hot', options: JSON.stringify(['hot', 'windy', 'cloudy']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420009, type: 'multiple_choice', question: 'What do you call a violent storm with thunder and lightning?', correctAnswer: 'Thunderstorm', options: JSON.stringify(['Thunderstorm', 'Blizzard', 'Drought', 'Heatwave']), orderIndex: 5, difficultyScore: 3, points: 10 },

  // 420010 - Body Parts & Health
  { lessonId: 420010, type: 'multiple_choice', question: 'What organ pumps blood through your body?', correctAnswer: 'Heart', options: JSON.stringify(['Heart', 'Lung', 'Liver', 'Brain']), orderIndex: 1, difficultyScore: 2, points: 10 },
  { lessonId: 420010, type: 'multiple_choice', question: 'What do you use to see?', correctAnswer: 'Eyes', options: JSON.stringify(['Eyes', 'Ears', 'Nose', 'Mouth']), orderIndex: 2, difficultyScore: 1, points: 10 },
  { lessonId: 420010, type: 'fill_blank', question: 'I have a _____ in my stomach. I need to eat something.', correctAnswer: 'stomachache', options: JSON.stringify(['stomachache', 'headache', 'toothache']), orderIndex: 3, difficultyScore: 2, points: 10 },
  { lessonId: 420010, type: 'fill_blank', question: 'You use your _____ to breathe and smell.', correctAnswer: 'nose', options: JSON.stringify(['nose', 'mouth', 'ear']), orderIndex: 4, difficultyScore: 1, points: 10 },
  { lessonId: 420010, type: 'multiple_choice', question: 'What should you do if you have a fever?', correctAnswer: 'See a doctor', options: JSON.stringify(['See a doctor', 'Exercise more', 'Eat spicy food', 'Work harder']), orderIndex: 5, difficultyScore: 1, points: 10 },
];

let insertedCount = 0;
for (const ex of exercises) {
  await conn.execute(
    `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, points, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [ex.lessonId, ex.type, ex.question, ex.correctAnswer, ex.options, ex.orderIndex, ex.difficultyScore, ex.points]
  );
  insertedCount++;
}

console.log(`✅ Inseridos ${insertedCount} exercícios em 9 lições.`);

// Verificar resultado
const [result] = await conn.execute(`
  SELECT l.id, l.title, COUNT(e.id) as ex_count
  FROM lessons l LEFT JOIN exercises e ON e.lessonId = l.id
  WHERE l.id BETWEEN 420002 AND 420010
  GROUP BY l.id ORDER BY l.id
`);
result.forEach(r => console.log(` Lição ${r.id} "${r.title}": ${r.ex_count} exercícios`));

await conn.end();
