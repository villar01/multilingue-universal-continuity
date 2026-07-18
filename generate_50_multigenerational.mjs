import { invokeLLM } from "./server/_core/llm.js";
import mysql from "mysql2/promise";

const db = await mysql.createConnection(process.env.DATABASE_URL);

const lessons = [
  // 15 INFANTIL (A1-A2)
  { title: "My Family", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "Colors and Shapes", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "Animals at the Zoo", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "My Toys", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "Food I Like", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "My School", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "Days of the Week", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "My Body Parts", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "Weather Today", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "My House", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "Numbers 1-20", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "My Clothes", level: "A1", ageLevel: "infantil", specialization: "geral" },
  { title: "My Friends", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "My Daily Routine", level: "A2", ageLevel: "infantil", specialization: "geral" },
  { title: "My Favorite Sport", level: "A2", ageLevel: "infantil", specialization: "geral" },
  
  // 15 ADOLESCENTE (B1-B2)
  { title: "Social Media Life", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "My Future Career", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Environmental Issues", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Technology and Me", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Healthy Lifestyle", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Music and Culture", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  { title: "Travel Adventures", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  { title: "School Projects", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Part-time Jobs", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  { title: "Online Gaming", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Fashion Trends", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Movie Reviews", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  { title: "Sports and Fitness", level: "B1", ageLevel: "adolescente", specialization: "geral" },
  { title: "Volunteer Work", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  { title: "Study Abroad", level: "B2", ageLevel: "adolescente", specialization: "geral" },
  
  // 20 ADULTO (C1-C2) - 7 geral + 13 especializações
  { title: "At the Restaurant", level: "C1", ageLevel: "adulto", specialization: "geral" },
  { title: "Job Interview", level: "C1", ageLevel: "adulto", specialization: "geral" },
  { title: "Renting an Apartment", level: "C1", ageLevel: "adulto", specialization: "geral" },
  { title: "At the Hospital", level: "C1", ageLevel: "adulto", specialization: "geral" },
  { title: "Banking Services", level: "C1", ageLevel: "adulto", specialization: "geral" },
  { title: "Legal Documents", level: "C2", ageLevel: "adulto", specialization: "geral" },
  { title: "Cultural Differences", level: "C2", ageLevel: "adulto", specialization: "geral" },
  
  // NEGÓCIOS (5)
  { title: "Business Meetings", level: "C1", ageLevel: "adulto", specialization: "negócios" },
  { title: "Corporate Presentations", level: "C1", ageLevel: "adulto", specialization: "negócios" },
  { title: "Email Etiquette", level: "C1", ageLevel: "adulto", specialization: "negócios" },
  { title: "Negotiation Skills", level: "C2", ageLevel: "adulto", specialization: "negócios" },
  { title: "Networking Events", level: "C1", ageLevel: "adulto", specialization: "negócios" },
  
  // TRADING (4)
  { title: "Stock Market Basics", level: "C1", ageLevel: "adulto", specialization: "trading" },
  { title: "Technical Analysis", level: "C2", ageLevel: "adulto", specialization: "trading" },
  { title: "Financial Reports", level: "C2", ageLevel: "adulto", specialization: "trading" },
  { title: "Investment Strategies", level: "C1", ageLevel: "adulto", specialization: "trading" },
  
  // CIENTÍFICO (4)
  { title: "Research Methodology", level: "C2", ageLevel: "adulto", specialization: "científico" },
  { title: "Academic Writing", level: "C2", ageLevel: "adulto", specialization: "científico" },
  { title: "Lab Procedures", level: "C1", ageLevel: "adulto", specialization: "científico" },
  { title: "Scientific Publications", level: "C2", ageLevel: "adulto", specialization: "científico" }
];

console.log(`Gerando ${lessons.length} lições multigeracionais...`);

for (let i = 0; i < lessons.length; i++) {
  const lesson = lessons[i];
  console.log(`\n[${i+1}/${lessons.length}] ${lesson.title} (${lesson.ageLevel}, ${lesson.level}, ${lesson.specialization})`);
  
  const prompt = `Generate a complete English lesson for ${lesson.ageLevel} students at ${lesson.level} level about "${lesson.title}" with specialization: ${lesson.specialization}.

Return ONLY valid JSON with this exact structure:
{
  "story": "250-300 words story appropriate for ${lesson.ageLevel}",
  "vocabulary": [
    {"word": "example", "translation": "exemplo", "ipa": "/ɪɡˈzæmpəl/", "example": "sentence with word"}
  ],
  "grammar": [
    {"title": "Grammar Point", "explanation": "detailed explanation", "examples": ["example 1", "example 2"]}
  ],
  "exercises": [
    {"type": "multiple_choice", "question": "question from story", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}
  ]
}`;

  try {
    const response = await invokeLLM({ messages: [{ role: "user", content: prompt }] });
    const content = response.choices[0].message.content;
    const lessonData = JSON.parse(content);
    
    await db.execute(`
      INSERT INTO lessons (title, level, ageLevel, specialization, languageCode, storyText, vocabularyData, grammarData, exercisesData)
      VALUES (?, ?, ?, ?, 'en', ?, ?, ?, ?)
    `, [
      lesson.title,
      lesson.level,
      lesson.ageLevel,
      lesson.specialization,
      lessonData.story,
      JSON.stringify(lessonData.vocabulary),
      JSON.stringify(lessonData.grammar),
      JSON.stringify(lessonData.exercises)
    ]);
    
    console.log(`✅ ${lesson.title} gerada`);
  } catch (error) {
    console.error(`❌ Erro em ${lesson.title}:`, error.message);
  }
}

await db.end();
console.log(`\n✅ ${lessons.length} lições geradas com sucesso!`);
