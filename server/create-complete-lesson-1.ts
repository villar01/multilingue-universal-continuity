/**
 * CRIAR LIÇÃO COMPLETA 1: A FAMÍLIA SMITH
 * Script para popular o banco com a primeira lição completa
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  uri: process.env.DATABASE_URL!,
});

async function createCompleteLesson1() {
  console.log("🎓 Criando Lição 1: A Família Smith...\n");

  // Buscar curso de Inglês Iniciante
  const [courses] = await db.execute(
    "SELECT * FROM courses WHERE level = 'beginner' LIMIT 1"
  );
  
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new Error("Nenhum curso iniciante encontrado!");
  }

  const course = courses[0] as any;
  console.log(`✅ Curso encontrado: ${course.title} (ID: ${course.id})\n`);

  // Dados completos da lição
  const lessonData = {
    courseId: course.id,
    title: "Lesson 1: The Smith Family",
    description: "Learn about family members, relationships, and daily activities through the Smith family story",
    orderIndex: 1,
    estimatedMinutes: 30,
    difficultyScore: 0.3,
    languageCode: "en-US",

    // HISTÓRIA NARRATIVA COMPLETA
    storyText: `Meet the Smith Family

This is the Smith family. They live in a cozy house in Seattle, Washington.

The father is Francis Daltri Smith. He is 42 years old and works as a software engineer at a tech company. Francis loves playing guitar and teaching his children about technology. Every morning, he wakes up early to make breakfast for the family.

The mother is Lara Line Smith. She is 39 years old and works as a teacher at the local elementary school. Lara enjoys reading books, gardening, and cooking delicious meals for her family. She is very patient and always helps the children with their homework.

They have two children: Emma and Lucas.

Emma is 12 years old and is in 7th grade. She loves painting, playing the piano, and spending time with her friends. Emma wants to become an artist when she grows up. She is creative and always draws beautiful pictures for her family.

Lucas is 8 years old and is in 3rd grade. He is very energetic and loves playing soccer, riding his bike, and building things with Lego. Lucas dreams of becoming a professional soccer player. He practices every day in the backyard with his father.

The grandparents live nearby. Grandfather William is 68 years old and grandmother Margaret is 65 years old. They visit the family every weekend and love spending time with their grandchildren. William tells funny stories and Margaret bakes delicious cookies.

The family also has a dog named Max. Max is a golden retriever and is 5 years old. He is very friendly and loves playing fetch in the park.

Family Activities:
- On weekends, the family goes to the park together
- They have dinner together every evening at 6:30 PM
- On Sundays, they visit the grandparents for lunch
- During summer, they go camping in the mountains
- Emma and Lucas help with household chores like setting the table and cleaning their rooms

Family Values:
The Smith family believes in spending quality time together, helping each other, and always being kind and respectful. They support each other's dreams and celebrate every achievement, big or small.`,

    // VOCABULÁRIO DETALHADO
    vocabularyDetailed: JSON.stringify([
      {
        word: "father",
        translation: "pai",
        synonyms: ["dad", "daddy", "papa"],
        slang: "old man",
        phonetic: "/ˈfɑːðər/",
        example: "My father works as an engineer."
      },
      {
        word: "mother",
        translation: "mãe",
        synonyms: ["mom", "mommy", "mama"],
        slang: "old lady",
        phonetic: "/ˈmʌðər/",
        example: "My mother is a teacher."
      },
      {
        word: "children",
        translation: "filhos/crianças",
        synonyms: ["kids", "offspring"],
        slang: "kiddos",
        phonetic: "/ˈtʃɪldrən/",
        example: "They have two children."
      },
      {
        word: "grandparents",
        translation: "avós",
        synonyms: ["grandma and grandpa"],
        slang: "gramps and granny",
        phonetic: "/ˈɡrænˌperənts/",
        example: "My grandparents visit us every weekend."
      },
      {
        word: "family",
        translation: "família",
        synonyms: ["relatives", "kin"],
        slang: "fam",
        phonetic: "/ˈfæməli/",
        example: "I love spending time with my family."
      },
      {
        word: "house",
        translation: "casa",
        synonyms: ["home", "residence"],
        slang: "crib, pad",
        phonetic: "/haʊs/",
        example: "They live in a cozy house."
      },
      {
        word: "work",
        translation: "trabalhar",
        synonyms: ["job", "employment"],
        slang: "grind",
        phonetic: "/wɜːrk/",
        example: "He works as a software engineer."
      },
      {
        word: "together",
        translation: "juntos",
        synonyms: ["jointly", "collectively"],
        phonetic: "/təˈɡeðər/",
        example: "The family eats dinner together."
      }
    ]),

    // GRAMÁTICA DETALHADA
    grammarDetailed: JSON.stringify([
      {
        topic: "Present Simple Tense",
        explanation: "Used to describe habits, routines, and general truths. Form: Subject + Verb (+ s/es for he/she/it)",
        examples: [
          "Francis works as an engineer. (habit)",
          "Lara teaches at a school. (routine)",
          "The family lives in Seattle. (general truth)"
        ],
        exercises: [
          "Complete: Emma _____ (love) painting.",
          "Complete: Lucas _____ (play) soccer every day.",
          "Complete: The grandparents _____ (visit) every weekend."
        ]
      },
      {
        topic: "Possessive Adjectives",
        explanation: "Used to show ownership. Forms: my, your, his, her, its, our, their",
        examples: [
          "Francis loves his children.",
          "Lara enjoys her work.",
          "The family loves their dog."
        ],
        exercises: [
          "Complete: Emma shows _____ paintings to _____ family.",
          "Complete: Lucas practices with _____ father.",
          "Complete: The grandparents visit _____ grandchildren."
        ]
      },
      {
        topic: "Family Vocabulary",
        explanation: "Words to describe family relationships",
        examples: [
          "Francis is the father / Lara is the mother",
          "Emma and Lucas are siblings (brother and sister)",
          "William and Margaret are the grandparents"
        ],
        exercises: [
          "Who is Emma to Lucas?",
          "Who are William and Margaret to Emma?",
          "What is the relationship between Francis and Lara?"
        ]
      }
    ]),

    // FONEMAS E PRONÚNCIA
    phonetics: JSON.stringify([
      {
        sound: "TH sound",
        ipa: "/ð/ and /θ/",
        examples: ["father /ˈfɑːðər/", "mother /ˈmʌðər/", "together /təˈɡeðər/", "three /θriː/"],
        tips: "Place your tongue between your teeth. /ð/ is voiced (vibration), /θ/ is voiceless (no vibration)."
      },
      {
        sound: "Linking: consonant + vowel",
        ipa: "Connected speech",
        examples: [
          "works_as → /wɜːrk_səz/ sounds like 'work-saz'",
          "lives_in → /lɪv_zɪn/ sounds like 'liv-zin'",
          "loves_it → /lʌv_zɪt/ sounds like 'luv-zit'"
        ],
        tips: "When a word ends with a consonant and the next word starts with a vowel, connect them smoothly."
      },
      {
        sound: "Word stress",
        ipa: "Emphasis patterns",
        examples: [
          "FAM-i-ly (stress on first syllable)",
          "to-GETH-er (stress on second syllable)",
          "GRAND-par-ents (stress on first syllable)"
        ],
        tips: "English words have one main stressed syllable. This syllable is louder and longer."
      }
    ]),

    // PROMPTS DE CONVERSAÇÃO
    conversationPrompts: JSON.stringify([
      "Tell me about your family. Who do you live with?",
      "What does your father/mother do for work?",
      "Do you have any brothers or sisters? Tell me about them.",
      "What activities do you enjoy doing with your family?",
      "Do you see your grandparents often? What do you do together?",
      "What is your favorite family tradition?",
      "Describe your house. How many rooms does it have?",
      "Do you have any pets? Tell me about them.",
      "What time does your family usually have dinner?",
      "What do you like most about your family?"
    ]),

    // Vocabulário simples (mantido para compatibilidade)
    vocabulary: JSON.stringify([
      "father", "mother", "children", "grandparents", "family",
      "house", "work", "together", "love", "help"
    ]),

    // Gramática simples (mantida para compatibilidade)
    grammar: JSON.stringify([
      "Present Simple",
      "Possessive Adjectives",
      "Family Vocabulary"
    ])
  };

  // Inserir lição
  const [result] = await db.execute(
    `INSERT INTO lessons (
      courseId, title, description, orderIndex, estimatedMinutes, difficultyScore,
      languageCode, storyText, vocabularyDetailed, grammarDetailed, phonetics,
      conversationPrompts, vocabulary, grammar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lessonData.courseId,
      lessonData.title,
      lessonData.description,
      lessonData.orderIndex,
      lessonData.estimatedMinutes,
      lessonData.difficultyScore,
      lessonData.languageCode,
      lessonData.storyText,
      lessonData.vocabularyDetailed,
      lessonData.grammarDetailed,
      lessonData.phonetics,
      lessonData.conversationPrompts,
      lessonData.vocabulary,
      lessonData.grammar
    ]
  );

  const lessonId = (result as any).insertId;
  console.log(`✅ Lição criada com sucesso! ID: ${lessonId}\n`);

  // Criar exercícios básicos
  const exercises = [
    {
      type: "multiple_choice",
      question: "What does Francis do for work?",
      correctAnswer: "Software engineer",
      options: JSON.stringify(["Software engineer", "Teacher", "Doctor", "Chef"]),
      orderIndex: 1,
      points: 10
    },
    {
      type: "multiple_choice",
      question: "How many children do Francis and Lara have?",
      correctAnswer: "Two",
      options: JSON.stringify(["One", "Two", "Three", "Four"]),
      orderIndex: 2,
      points: 10
    },
    {
      type: "fill_blank",
      question: "Emma loves _____ and playing the piano.",
      correctAnswer: "painting",
      orderIndex: 3,
      points: 15
    },
    {
      type: "translation",
      question: "Translate to English: 'A família janta junta todas as noites.'",
      correctAnswer: "The family has dinner together every night.",
      orderIndex: 4,
      points: 20
    }
  ];

  for (const exercise of exercises) {
    await db.execute(
      `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, points)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lessonId,
        exercise.type,
        exercise.question,
        exercise.correctAnswer,
        exercise.options || null,
        exercise.orderIndex,
        exercise.points
      ]
    );
  }

  console.log(`✅ ${exercises.length} exercícios criados!\n`);
  console.log("🎉 Lição 1 completa criada com sucesso!\n");
}

// Executar
createCompleteLesson1()
  .then(() => {
    console.log("✅ Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
