/**
 * Seed massivo: 65 idiomas + 100 lições por idioma = 6.500+ lições
 * Executar via tRPC mutation
 */

import { LANGUAGES } from "./data/languages.js";
import { LESSON_TOPICS, SLANG_IDIOM_TOPICS } from "./data/lesson-topics.js";

export interface SeedProgress {
  totalLanguages: number;
  processedLanguages: number;
  totalLessons: number;
  processedLessons: number;
  currentLanguage: string;
  percentage: number;
}

export async function seedMassiveContent(
  db: any,
  onProgress?: (progress: SeedProgress) => void
): Promise<{ success: boolean; message: string; stats: any }> {
  
  const { languages: languagesTable, courses: coursesTable, lessons: lessonsTable } = await import("../drizzle/schema.js");
  const { eq, and } = await import("drizzle-orm");
  
  let stats = {
    languagesAdded: 0,
    coursesAdded: 0,
    lessonsAdded: 0,
  };

  const totalLanguages = LANGUAGES.length;
  const lessonsPerLanguage = 130; // 100 lições (3 níveis) + 30 gírias/idiomáticas
  const totalLessons = totalLanguages * lessonsPerLanguage;

  let processedLanguages = 0;
  let processedLessons = 0;

  // 1. Popular idiomas
  console.log(`🌍 Populando ${totalLanguages} idiomas...`);
  
  for (const lang of LANGUAGES) {
    await db.insert(languagesTable).values({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      isActive: true,
    }).onDuplicateKeyUpdate({ set: { isActive: true } });
    
    stats.languagesAdded++;
    processedLanguages++;

    if (onProgress) {
      onProgress({
        totalLanguages,
        processedLanguages,
        totalLessons,
        processedLessons,
        currentLanguage: lang.name,
        percentage: Math.floor((processedLanguages / totalLanguages) * 100),
      });
    }
  }

  console.log(`✅ ${stats.languagesAdded} idiomas adicionados`);

  // 2. Buscar IDs dos idiomas
  const languageRecords = await db.select().from(languagesTable);
  const languageMap = new Map(languageRecords.map((l: any) => [l.code, l.id]));

  // 3. Criar cursos e lições para cada idioma
  console.log(`📚 Criando cursos e lições...`);

  for (const lang of LANGUAGES) {
    const languageId = languageMap.get(lang.code);
    if (!languageId) continue;

    // Criar 3 cursos por idioma (iniciante, intermediário, avançado)
    const levels: Array<"beginner" | "intermediate" | "advanced"> = ["beginner", "intermediate", "advanced"];
    
    for (const level of levels) {
      // Verificar se curso já existe
      const allCourses = await db.select().from(coursesTable);
      const existingCourses = allCourses.filter((c: any) => c.languageId === languageId && c.level === level);

      let courseId: number;
      if (existingCourses.length > 0) {
        courseId = existingCourses[0].id;
      } else {
        const [courseResult] = await db.insert(coursesTable).values({
          languageId,
          title: `${lang.name} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
          description: `Learn ${lang.name} at ${level} level`,
          level,
          isPublished: true,
        });
        courseId = courseResult.insertId;
        stats.coursesAdded++;
      }

      // Selecionar TODOS os 100 tópicos para este nível
      const topics = LESSON_TOPICS[level];
      const lessonsToCreate = topics; // Usar todos os 100 tópicos

      for (let i = 0; i < lessonsToCreate.length; i++) {
        const topic = lessonsToCreate[i];
        
        await db.insert(lessonsTable).values({
          courseId,
          title: topic.title,
          description: topic.description,
          orderIndex: i + 1,
          estimatedMinutes: topic.estimatedMinutes,
          isPublished: true,
        });

        stats.lessonsAdded++;
        processedLessons++;

        // Atualizar progresso a cada 10 lições
        if (processedLessons % 10 === 0 && onProgress) {
          onProgress({
            totalLanguages,
            processedLanguages,
            totalLessons,
            processedLessons,
            currentLanguage: lang.name,
            percentage: Math.floor((processedLessons / totalLessons) * 100),
          });
        }
      }
    }
  }

  // 4. Criar curso de Gírias e Expressões Idiomáticas para cada idioma
  console.log(`🎭 Criando cursos de Gírias e Expressões Idiomáticas...`);

  for (const lang of LANGUAGES) {
    const languageId = languageMap.get(lang.code);
    if (!languageId) continue;

    // Verificar se curso de gírias já existe
    const allCourses = await db.select().from(coursesTable);
    const existingSlangCourse = allCourses.filter(
      (c: any) => c.languageId === languageId && c.level === 'slang'
    );

    let slangCourseId: number;
    if (existingSlangCourse.length > 0) {
      slangCourseId = existingSlangCourse[0].id;
    } else {
      const [courseResult] = await db.insert(coursesTable).values({
        languageId,
        title: `${lang.name} - Gírias & Expressões Idiomáticas`,
        description: `Master ${lang.name} slang, idioms, and cultural expressions`,
        level: 'slang',
        isPublished: true,
      });
      slangCourseId = courseResult.insertId;
      stats.coursesAdded++;
    }

    // Criar as 30 lições de gírias
    for (let i = 0; i < SLANG_IDIOM_TOPICS.length; i++) {
      const topic = SLANG_IDIOM_TOPICS[i];
      await db.insert(lessonsTable).values({
        courseId: slangCourseId,
        title: topic.title,
        description: topic.description,
        orderIndex: i + 1,
        estimatedMinutes: topic.estimatedMinutes,
        isPublished: true,
      });
      stats.lessonsAdded++;
      processedLessons++;
    }
  }

  console.log(`✅ ${stats.coursesAdded} cursos criados`);
  console.log(`✅ ${stats.lessonsAdded} lições criadas`);

  return {
    success: true,
    message: `Seed completo: ${stats.languagesAdded} idiomas, ${stats.coursesAdded} cursos, ${stats.lessonsAdded} lições (incl. 30 gírias/idiomáticas por idioma)`,
    stats,
  };
}
