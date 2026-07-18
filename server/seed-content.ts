/**
 * Script para popular banco de dados com idiomas, cursos e lições
 * Executar: NODE_ENV=production node --loader ts-node/esm server/seed-content.ts
 */

import { getDb } from "./db.js";
import { languages, courses, lessons, exercises } from "../drizzle/schema.js";

async function seedContent() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Erro ao conectar ao banco de dados");
    return;
  }

  console.log("🌍 Populando idiomas...");

  // Idiomas populares
  const languagesData = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", voiceId: "EXAVITQu4vr4xnSDxMaL", voiceName: "Sarah" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", voiceId: "VR6AewLTigWG4xSOukaG", voiceName: "María" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", voiceId: "ThT5KcBeYPX3keUQqHPh", voiceName: "Antoine" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", voiceId: "TxGEqnHWrfWFTfGW9XjX", voiceName: "Klaus" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", voiceId: "XrExE9yKIg1WjnnlVkGX", voiceName: "Giovanni" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", voiceId: "yoZ06aMxZJJ28mfd3POQ", voiceName: "Lucas" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", voiceId: "IKne3meq5aSn9XLyUdCD", voiceName: "Yuki" },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", voiceId: "XB0fDUnXU5powFXDhCwa", voiceName: "Wei" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", voiceId: "pFZP5JQG7iQjIQuC4Bku", voiceName: "Min-ji" },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", voiceId: "bVMeCyTHy58xNoL34h3p", voiceName: "Dmitry" },
  ];

  for (const lang of languagesData) {
    await db.insert(languages).values(lang).onDuplicateKeyUpdate({ set: { isActive: true } });
  }

  console.log(`✅ ${languagesData.length} idiomas adicionados`);

  console.log("📚 Populando cursos...");

  // Buscar IDs dos idiomas
  const allLanguages = await db.select().from(languages);
  const langMap = new Map(allLanguages.map(l => [l.code, l.id]));

  // Cursos para cada idioma
  const coursesData: Array<{
    languageCode: string;
    title: string;
    description: string;
    level: "beginner" | "intermediate" | "advanced" | "native";
    orderIndex: number;
  }> = [
    // English
    { languageCode: "en", title: "English - Beginner", description: "Learn English from scratch", level: "beginner" as const, orderIndex: 1 },
    { languageCode: "en", title: "English - Intermediate", description: "Improve your English skills", level: "intermediate" as const, orderIndex: 2 },
    { languageCode: "en", title: "English - Advanced", description: "Master advanced English", level: "advanced" as const, orderIndex: 3 },
    
    // Spanish
    { languageCode: "es", title: "Español - Principiante", description: "Aprende español desde cero", level: "beginner" as const, orderIndex: 1 },
    { languageCode: "es", title: "Español - Intermedio", description: "Mejora tus habilidades en español", level: "intermediate" as const, orderIndex: 2 },
    
    // French
    { languageCode: "fr", title: "Français - Débutant", description: "Apprendre le français de zéro", level: "beginner" as const, orderIndex: 1 },
    { languageCode: "fr", title: "Français - Intermédiaire", description: "Améliorer vos compétences en français", level: "intermediate" as const, orderIndex: 2 },
    
    // German
    { languageCode: "de", title: "Deutsch - Anfänger", description: "Deutsch von Grund auf lernen", level: "beginner" as const, orderIndex: 1 },
    
    // Portuguese
    { languageCode: "pt", title: "Português - Iniciante", description: "Aprenda português do zero", level: "beginner" as const, orderIndex: 1 },
    
    // Japanese
    { languageCode: "ja", title: "日本語 - 初級", description: "ゼロから日本語を学ぶ", level: "beginner" as const, orderIndex: 1 },
  ];

  const insertedCourses: any[] = [];
  for (const course of coursesData) {
    const languageId = langMap.get(course.languageCode);
    if (!languageId) {
      console.warn(`⚠️ Idioma ${course.languageCode} não encontrado, pulando curso ${course.title}`);
      continue;
    }
    const { languageCode, ...courseData } = course;
    const [inserted] = await db.insert(courses).values({ ...courseData, languageId });
    insertedCourses.push({ ...course, id: inserted.insertId, languageId });
  }

  console.log(`✅ ${coursesData.length} cursos adicionados`);

  console.log("📖 Populando lições...");

  // Lições para curso de inglês iniciante
  const englishBeginnerCourse = insertedCourses.find(c => c.languageCode === "en" && c.level === "beginner");
  
  if (englishBeginnerCourse) {
    const lessonsData = [
      { courseId: englishBeginnerCourse.id, title: "Greetings & Introductions", description: "Learn how to greet people and introduce yourself", orderIndex: 1, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Numbers 1-100", description: "Master numbers from 1 to 100", orderIndex: 2, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Colors", description: "Learn about Colors in English", orderIndex: 3, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Family Members", description: "Vocabulary about family relationships", orderIndex: 4, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Days of the Week", description: "Learn the days of the week", orderIndex: 5, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Months & Seasons", description: "Master months and seasons", orderIndex: 6, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Time & Clock", description: "Tell time in English", orderIndex: 7, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Weather", description: "Talk about the weather", orderIndex: 8, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Body Parts", description: "Learn body parts vocabulary", orderIndex: 9, estimatedMinutes: 15 },
      { courseId: englishBeginnerCourse.id, title: "Clothing", description: "Vocabulary about clothes", orderIndex: 10, estimatedMinutes: 15 },
    ];

    for (const lesson of lessonsData) {
      await db.insert(lessons).values(lesson);
    }

    console.log(`✅ ${lessonsData.length} lições adicionadas para English - Beginner`);
  }

  // Lições para curso de espanhol iniciante
  const spanishBeginnerCourse = insertedCourses.find(c => c.languageCode === "es" && c.level === "beginner");
  
  if (spanishBeginnerCourse) {
    const lessonsData = [
      { courseId: spanishBeginnerCourse.id, title: "Saludos y Presentaciones", description: "Aprende a saludar y presentarte", orderIndex: 1, estimatedMinutes: 15 },
      { courseId: spanishBeginnerCourse.id, title: "Números 1-100", description: "Domina los números del 1 al 100", orderIndex: 2, estimatedMinutes: 15 },
      { courseId: spanishBeginnerCourse.id, title: "Colores", description: "Aprende los colores en español", orderIndex: 3, estimatedMinutes: 15 },
      { courseId: spanishBeginnerCourse.id, title: "Familia", description: "Vocabulario sobre relaciones familiares", orderIndex: 4, estimatedMinutes: 15 },
      { courseId: spanishBeginnerCourse.id, title: "Días de la Semana", description: "Aprende los días de la semana", orderIndex: 5, estimatedMinutes: 15 },
    ];

    for (const lesson of lessonsData) {
      await db.insert(lessons).values(lesson);
    }

    console.log(`✅ ${lessonsData.length} lições adicionadas para Español - Principiante`);
  }

  // Lições para curso de francês iniciante
  const frenchBeginnerCourse = insertedCourses.find(c => c.languageCode === "fr" && c.level === "beginner");
  
  if (frenchBeginnerCourse) {
    const lessonsData = [
      { courseId: frenchBeginnerCourse.id, title: "Salutations et Présentations", description: "Apprenez à saluer et vous présenter", orderIndex: 1, estimatedMinutes: 15 },
      { courseId: frenchBeginnerCourse.id, title: "Nombres 1-100", description: "Maîtrisez les nombres de 1 à 100", orderIndex: 2, estimatedMinutes: 15 },
      { courseId: frenchBeginnerCourse.id, title: "Couleurs", description: "Apprenez les couleurs en français", orderIndex: 3, estimatedMinutes: 15 },
      { courseId: frenchBeginnerCourse.id, title: "Famille", description: "Vocabulaire sur les relations familiales", orderIndex: 4, estimatedMinutes: 15 },
      { courseId: frenchBeginnerCourse.id, title: "Jours de la Semaine", description: "Apprenez les jours de la semaine", orderIndex: 5, estimatedMinutes: 15 },
    ];

    for (const lesson of lessonsData) {
      await db.insert(lessons).values(lesson);
    }

    console.log(`✅ ${lessonsData.length} lições adicionadas para Français - Débutant`);
  }

  console.log("\n🎉 Seed completo!");
  console.log("📊 Resumo:");
  console.log(`   - ${languagesData.length} idiomas`);
  console.log(`   - ${coursesData.length} cursos`);
  console.log(`   - Lições adicionadas para 3 idiomas`);
  
  process.exit(0);
}

seedContent().catch(console.error);
