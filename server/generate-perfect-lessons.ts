import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { lessons, exercises, courses } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL!;

// ============================================================
// LIÇÃO 1: MY FAMILY (Minha Família)
// ============================================================

const familyLesson = {
  title: "My Family",
  description: "Learn to talk about your family members and describe relationships.",
  languageCode: "en-US",
  orderIndex: 1,
  estimatedMinutes: 20,
  difficultyScore: 0.3,
  
  // História completa (250 palavras)
  storyText: `Hello! My name is Emma, and I want to tell you about my family. I have a wonderful family with six people.

My father's name is John. He is 45 years old and works as a teacher. He is tall and has brown hair. He loves reading books and playing soccer with me on weekends. My father is very kind and always helps me with my homework.

My mother's name is Sarah. She is 42 years old and works as a doctor. She has long black hair and beautiful green eyes. She loves cooking delicious food for our family. Her pasta is the best! My mother is very patient and caring.

I have one older brother and one younger sister. My brother's name is Michael. He is 18 years old and studies at university. He is very smart and loves computers. He teaches me how to play video games. My sister's name is Lucy. She is only 8 years old and goes to elementary school. She is very cute and loves drawing pictures of our family.

We also have a pet! Our dog's name is Max. He is 5 years old and very friendly. Max loves playing in the garden and running after balls. He is part of our family too!

Every Sunday, we have dinner together. We talk, laugh, and share stories about our week. I love my family very much. They make me happy every day. Family is the most important thing in life!`,

  // Vocabulário detalhado (7 palavras)
  vocabularyDetailed: [
    {
      word: "family",
      translation: "família",
      phonetic: "/ˈfæməli/",
      partOfSpeech: "noun",
      example: "I love my family very much.",
      audioUrl: null // Será gerado depois
    },
    {
      word: "father",
      translation: "pai",
      phonetic: "/ˈfɑːðər/",
      partOfSpeech: "noun",
      example: "My father works as a teacher.",
      audioUrl: null
    },
    {
      word: "mother",
      translation: "mãe",
      phonetic: "/ˈmʌðər/",
      partOfSpeech: "noun",
      example: "My mother is a doctor.",
      audioUrl: null
    },
    {
      word: "brother",
      translation: "irmão",
      phonetic: "/ˈbrʌðər/",
      partOfSpeech: "noun",
      example: "My brother studies at university.",
      audioUrl: null
    },
    {
      word: "sister",
      translation: "irmã",
      phonetic: "/ˈsɪstər/",
      partOfSpeech: "noun",
      example: "My sister loves drawing pictures.",
      audioUrl: null
    },
    {
      word: "pet",
      translation: "animal de estimação",
      phonetic: "/pet/",
      partOfSpeech: "noun",
      example: "Our pet is a friendly dog named Max.",
      audioUrl: null
    },
    {
      word: "wonderful",
      translation: "maravilhoso",
      phonetic: "/ˈwʌndərfəl/",
      partOfSpeech: "adjective",
      example: "I have a wonderful family.",
      audioUrl: null
    }
  ],

  // Gramática detalhada (2 pontos)
  grammarDetailed: [
    {
      title: "Present Simple - Verb 'to be'",
      explanation: "Usamos 'am', 'is', 'are' para descrever pessoas e coisas no presente.",
      examples: [
        "I am 15 years old. (Eu tenho 15 anos)",
        "He is tall. (Ele é alto)",
        "They are happy. (Eles estão felizes)"
      ],
      rule: "I am / You are / He-She-It is / We-They are"
    },
    {
      title: "Possessive Adjectives",
      explanation: "Usamos 'my', 'your', 'his', 'her' para mostrar posse (de quem é algo).",
      examples: [
        "My father is a teacher. (Meu pai é professor)",
        "Her name is Sarah. (O nome dela é Sarah)",
        "Our dog is friendly. (Nosso cachorro é amigável)"
      ],
      rule: "my (meu/minha) / your (seu/sua) / his (dele) / her (dela) / our (nosso/nossa) / their (deles/delas)"
    }
  ],

  illustrationUrl: "/lesson-images/family-lesson.jpg"
};

// Exercícios da lição Family
const familyExercises = [
  {
    type: "multiple_choice",
    question: "How old is Emma's father?",
    options: ["42 years old", "45 years old", "48 years old", "40 years old"],
    correctAnswer: "45 years old",
    orderIndex: 1
  },
  {
    type: "multiple_choice",
    question: "What is Emma's mother's job?",
    options: ["Teacher", "Doctor", "Engineer", "Cook"],
    correctAnswer: "Doctor",
    orderIndex: 2
  },
  {
    type: "multiple_choice",
    question: "How many people are in Emma's family (not including the pet)?",
    options: ["Four", "Five", "Six", "Seven"],
    correctAnswer: "Six",
    orderIndex: 3
  },
  {
    type: "fill_blank",
    question: "Complete: My ___ is very smart and loves computers.",
    correctAnswer: "brother",
    orderIndex: 4
  },
  {
    type: "multiple_choice",
    question: "What does the family do every Sunday?",
    options: ["Go to the park", "Have dinner together", "Watch movies", "Play games"],
    correctAnswer: "Have dinner together",
    orderIndex: 5
  }
];

// ============================================================
// LIÇÃO 2: AT THE RESTAURANT (No Restaurante)
// ============================================================

const restaurantLesson = {
  title: "At the Restaurant",
  description: "Learn how to order food, talk to waiters, and enjoy dining out.",
  languageCode: "en-US",
  orderIndex: 2,
  estimatedMinutes: 20,
  difficultyScore: 0.4,
  
  storyText: `It's Saturday evening, and Tom is very hungry. He decides to go to his favorite restaurant called "The Happy Kitchen." It's a cozy place with friendly staff and delicious food.

When Tom arrives, a waiter greets him with a big smile. "Good evening! Welcome to The Happy Kitchen. Table for one?" the waiter asks. "Yes, please," Tom replies. The waiter shows him to a nice table near the window.

The waiter gives Tom a menu. "Here is the menu, sir. Would you like something to drink first?" Tom looks at the menu and says, "I'd like a glass of orange juice, please." "Excellent choice!" says the waiter.

Tom reads the menu carefully. There are many options: pizza, pasta, salad, chicken, fish, and more. Everything looks delicious! After a few minutes, the waiter comes back. "Are you ready to order?" he asks. Tom nods and says, "Yes, I'd like the grilled chicken with vegetables and rice, please."

"Great choice, sir! Would you like any dessert?" the waiter asks. Tom thinks for a moment and says, "Yes, I'll have the chocolate cake, please." The waiter writes everything down and says, "Your food will be ready in about 15 minutes."

While Tom waits, he enjoys his orange juice and looks out the window. The restaurant is warm and comfortable. Soon, the waiter brings his food. "Here is your grilled chicken with vegetables and rice. Enjoy your meal!" Tom smells the delicious food and says, "Thank you! It looks wonderful!"

Tom eats his dinner slowly. The chicken is perfectly cooked, and the vegetables are fresh and tasty. After finishing his main course, the waiter brings the chocolate cake. It's sweet and delicious!

When Tom finishes eating, the waiter asks, "How was everything?" Tom smiles and says, "Everything was perfect! The food was delicious." The waiter brings the bill. Tom pays and leaves a tip because the service was excellent. "Thank you for coming! Have a great evening!" says the waiter. Tom leaves the restaurant feeling happy and full!`,

  vocabularyDetailed: [
    {
      word: "restaurant",
      translation: "restaurante",
      phonetic: "/ˈrestərɑːnt/",
      partOfSpeech: "noun",
      example: "We went to a nice restaurant for dinner.",
      audioUrl: null
    },
    {
      word: "waiter",
      translation: "garçom",
      phonetic: "/ˈweɪtər/",
      partOfSpeech: "noun",
      example: "The waiter brought us the menu.",
      audioUrl: null
    },
    {
      word: "menu",
      translation: "cardápio",
      phonetic: "/ˈmenjuː/",
      partOfSpeech: "noun",
      example: "Can I see the menu, please?",
      audioUrl: null
    },
    {
      word: "order",
      translation: "pedir (comida)",
      phonetic: "/ˈɔːrdər/",
      partOfSpeech: "verb",
      example: "I'd like to order the grilled chicken.",
      audioUrl: null
    },
    {
      word: "delicious",
      translation: "delicioso",
      phonetic: "/dɪˈlɪʃəs/",
      partOfSpeech: "adjective",
      example: "The food was delicious!",
      audioUrl: null
    },
    {
      word: "bill",
      translation: "conta",
      phonetic: "/bɪl/",
      partOfSpeech: "noun",
      example: "Can I have the bill, please?",
      audioUrl: null
    },
    {
      word: "tip",
      translation: "gorjeta",
      phonetic: "/tɪp/",
      partOfSpeech: "noun",
      example: "Tom left a tip for the excellent service.",
      audioUrl: null
    }
  ],

  grammarDetailed: [
    {
      title: "Polite Requests - 'Would you like...?'",
      explanation: "Usamos 'Would you like...?' para fazer ofertas ou perguntas educadas.",
      examples: [
        "Would you like something to drink? (Gostaria de algo para beber?)",
        "Would you like any dessert? (Gostaria de alguma sobremesa?)",
        "I'd like a glass of water, please. (Eu gostaria de um copo d'água, por favor)"
      ],
      rule: "Would you like + noun/to + verb"
    },
    {
      title: "Present Simple for Habits",
      explanation: "Usamos Present Simple para falar sobre hábitos e rotinas.",
      examples: [
        "Tom goes to the restaurant every Saturday. (Tom vai ao restaurante todo sábado)",
        "The waiter brings the menu. (O garçom traz o cardápio)",
        "I eat dinner at 7 PM. (Eu janto às 19h)"
      ],
      rule: "Subject + verb (add -s/-es for he/she/it)"
    }
  ],

  illustrationUrl: "/lesson-images/restaurant-lesson.jpg"
};

const restaurantExercises = [
  {
    type: "multiple_choice",
    question: "What is the name of Tom's favorite restaurant?",
    options: ["The Happy Kitchen", "The Good Food", "Tom's Place", "The Cozy Restaurant"],
    correctAnswer: "The Happy Kitchen",
    orderIndex: 1
  },
  {
    type: "multiple_choice",
    question: "What does Tom order to drink?",
    options: ["Water", "Coffee", "Orange juice", "Tea"],
    correctAnswer: "Orange juice",
    orderIndex: 2
  },
  {
    type: "multiple_choice",
    question: "What is Tom's main course?",
    options: ["Pizza", "Pasta", "Grilled chicken with vegetables and rice", "Fish and chips"],
    correctAnswer: "Grilled chicken with vegetables and rice",
    orderIndex: 3
  },
  {
    type: "fill_blank",
    question: "Complete: Tom leaves a ___ because the service was excellent.",
    correctAnswer: "tip",
    orderIndex: 4
  },
  {
    type: "multiple_choice",
    question: "What dessert does Tom choose?",
    options: ["Ice cream", "Apple pie", "Chocolate cake", "Fruit salad"],
    correctAnswer: "Chocolate cake",
    orderIndex: 5
  }
];

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

async function generatePerfectLessons() {
  console.log('🚀 Iniciando geração de 2 lições demo perfeitas...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // 1. Buscar curso de inglês (English - Beginner)
    const [englishCourse] = await db.select()
      .from(courses)
      .where(eq(courses.languageId, 1)) // English
      .limit(1);
    
    if (!englishCourse) {
      throw new Error('Curso de inglês não encontrado');
    }
    
    console.log(`✅ Curso encontrado: ${englishCourse.title} (ID: ${englishCourse.id})\n`);
    
    // 2. Inserir lição FAMILY
    console.log('📝 Inserindo lição "My Family"...');
    const [familyResult] = await connection.execute(
      `INSERT INTO lessons (
        courseId, title, description, orderIndex, content, 
        vocabulary, grammar, estimatedMinutes, difficultyScore,
        languageCode, illustrationUrl, storyText, vocabularyDetailed, grammarDetailed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        storyText = VALUES(storyText),
        vocabularyDetailed = VALUES(vocabularyDetailed),
        grammarDetailed = VALUES(grammarDetailed),
        illustrationUrl = VALUES(illustrationUrl)`,
      [
        englishCourse.id,
        familyLesson.title,
        familyLesson.description,
        familyLesson.orderIndex,
        familyLesson.storyText,
        JSON.stringify(familyLesson.vocabularyDetailed.map(v => v.word)),
        JSON.stringify(familyLesson.grammarDetailed.map(g => g.title)),
        familyLesson.estimatedMinutes,
        familyLesson.difficultyScore,
        familyLesson.languageCode,
        familyLesson.illustrationUrl,
        familyLesson.storyText,
        JSON.stringify(familyLesson.vocabularyDetailed),
        JSON.stringify(familyLesson.grammarDetailed)
      ]
    );
    
    const familyLessonId = (familyResult as any).insertId;
    console.log(`✅ Lição "My Family" criada (ID: ${familyLessonId})\n`);
    
    // 3. Inserir exercícios da lição Family
    console.log('📝 Inserindo 5 exercícios da lição "My Family"...');
    for (const exercise of familyExercises) {
      await connection.execute(
        `INSERT INTO exercises (
          lessonId, type, question, options, correctAnswer, orderIndex
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          familyLessonId,
          exercise.type,
          exercise.question,
          JSON.stringify(exercise.options || []),
          exercise.correctAnswer,
          exercise.orderIndex
        ]
      );
    }
    console.log(`✅ 5 exercícios inseridos para "My Family"\n`);
    
    // 4. Inserir lição RESTAURANT
    console.log('📝 Inserindo lição "At the Restaurant"...');
    const [restaurantResult] = await connection.execute(
      `INSERT INTO lessons (
        courseId, title, description, orderIndex, content, 
        vocabulary, grammar, estimatedMinutes, difficultyScore,
        languageCode, illustrationUrl, storyText, vocabularyDetailed, grammarDetailed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        storyText = VALUES(storyText),
        vocabularyDetailed = VALUES(vocabularyDetailed),
        grammarDetailed = VALUES(grammarDetailed),
        illustrationUrl = VALUES(illustrationUrl)`,
      [
        englishCourse.id,
        restaurantLesson.title,
        restaurantLesson.description,
        restaurantLesson.orderIndex,
        restaurantLesson.storyText,
        JSON.stringify(restaurantLesson.vocabularyDetailed.map(v => v.word)),
        JSON.stringify(restaurantLesson.grammarDetailed.map(g => g.title)),
        restaurantLesson.estimatedMinutes,
        restaurantLesson.difficultyScore,
        restaurantLesson.languageCode,
        restaurantLesson.illustrationUrl,
        restaurantLesson.storyText,
        JSON.stringify(restaurantLesson.vocabularyDetailed),
        JSON.stringify(restaurantLesson.grammarDetailed)
      ]
    );
    
    const restaurantLessonId = (restaurantResult as any).insertId;
    console.log(`✅ Lição "At the Restaurant" criada (ID: ${restaurantLessonId})\n`);
    
    // 5. Inserir exercícios da lição Restaurant
    console.log('📝 Inserindo 5 exercícios da lição "At the Restaurant"...');
    for (const exercise of restaurantExercises) {
      await connection.execute(
        `INSERT INTO exercises (
          lessonId, type, question, options, correctAnswer, orderIndex
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          restaurantLessonId,
          exercise.type,
          exercise.question,
          JSON.stringify(exercise.options || []),
          exercise.correctAnswer,
          exercise.orderIndex
        ]
      );
    }
    console.log(`✅ 5 exercícios inseridos para "At the Restaurant"\n`);
    
    console.log('🎉 SUCESSO! 2 lições demo perfeitas criadas:');
    console.log(`   1. My Family (ID: ${familyLessonId}) - 5 exercícios`);
    console.log(`   2. At the Restaurant (ID: ${restaurantLessonId}) - 5 exercícios\n`);
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO:', error);
    await connection.end();
    process.exit(1);
  }
}

generatePerfectLessons();
