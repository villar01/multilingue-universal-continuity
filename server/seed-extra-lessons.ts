/**
 * Seed extra: adiciona lições extras para atingir 1000+ lições no total
 * Usa os tópicos existentes e adiciona novos tópicos avançados
 */
import { LESSON_TOPICS } from "./data/lesson-topics.js";

const EXTRA_TOPICS = {
  beginner: [
    { title: "Alphabet & Pronunciation", description: "Learn the alphabet and basic sounds", estimatedMinutes: 15 },
    { title: "Basic Phrases", description: "Essential everyday phrases", estimatedMinutes: 15 },
    { title: "Asking Questions", description: "Form basic questions", estimatedMinutes: 15 },
    { title: "Negative Sentences", description: "Make negative statements", estimatedMinutes: 15 },
    { title: "Adjectives", description: "Describe people and things", estimatedMinutes: 15 },
    { title: "Possessives", description: "Express ownership", estimatedMinutes: 10 },
    { title: "Prepositions", description: "Learn location words", estimatedMinutes: 15 },
    { title: "Conjunctions", description: "Connect ideas", estimatedMinutes: 10 },
    { title: "Verbs: To Be", description: "Use the verb 'to be'", estimatedMinutes: 15 },
    { title: "Verbs: To Have", description: "Use the verb 'to have'", estimatedMinutes: 15 },
    { title: "Present Simple", description: "Describe habitual actions", estimatedMinutes: 20 },
    { title: "Present Continuous", description: "Describe ongoing actions", estimatedMinutes: 20 },
    { title: "Past Simple", description: "Talk about past events", estimatedMinutes: 20 },
    { title: "Future Simple", description: "Talk about future plans", estimatedMinutes: 20 },
    { title: "Ordinal Numbers", description: "First, second, third...", estimatedMinutes: 10 },
  ],
  intermediate: [
    { title: "Conditionals", description: "If/then statements", estimatedMinutes: 25 },
    { title: "Passive Voice", description: "Use passive constructions", estimatedMinutes: 25 },
    { title: "Reported Speech", description: "Report what others say", estimatedMinutes: 25 },
    { title: "Modal Verbs", description: "Can, could, should, must", estimatedMinutes: 20 },
    { title: "Phrasal Verbs", description: "Common phrasal verbs", estimatedMinutes: 25 },
    { title: "Idioms", description: "Common expressions", estimatedMinutes: 20 },
    { title: "Business Vocabulary", description: "Professional language", estimatedMinutes: 25 },
    { title: "Academic Writing", description: "Formal writing skills", estimatedMinutes: 30 },
    { title: "Debate & Discussion", description: "Express opinions", estimatedMinutes: 25 },
    { title: "Storytelling", description: "Tell engaging stories", estimatedMinutes: 25 },
    { title: "News & Media", description: "Understand news language", estimatedMinutes: 25 },
    { title: "Culture & Customs", description: "Cultural knowledge", estimatedMinutes: 20 },
    { title: "Humor & Jokes", description: "Understand humor", estimatedMinutes: 20 },
    { title: "Slang & Informal", description: "Casual language", estimatedMinutes: 20 },
    { title: "Pronunciation Advanced", description: "Perfect your accent", estimatedMinutes: 25 },
  ],
  advanced: [
    { title: "Literature & Poetry", description: "Analyze literary texts", estimatedMinutes: 35 },
    { title: "Philosophy & Ethics", description: "Discuss abstract concepts", estimatedMinutes: 35 },
    { title: "Scientific Language", description: "Technical vocabulary", estimatedMinutes: 30 },
    { title: "Legal Language", description: "Legal terminology", estimatedMinutes: 30 },
    { title: "Medical Vocabulary", description: "Health and medicine terms", estimatedMinutes: 30 },
    { title: "Political Discourse", description: "Political language", estimatedMinutes: 30 },
    { title: "Economic Concepts", description: "Finance and economics", estimatedMinutes: 30 },
    { title: "Art & Aesthetics", description: "Discuss art and beauty", estimatedMinutes: 25 },
    { title: "Technology & AI", description: "Modern tech vocabulary", estimatedMinutes: 30 },
    { title: "Environmental Issues", description: "Climate and environment", estimatedMinutes: 30 },
    { title: "Globalization", description: "World affairs vocabulary", estimatedMinutes: 30 },
    { title: "Psychology", description: "Mental health vocabulary", estimatedMinutes: 30 },
    { title: "Sociology", description: "Society and culture", estimatedMinutes: 30 },
    { title: "History & Heritage", description: "Historical language", estimatedMinutes: 30 },
    { title: "Native Fluency", description: "Achieve native-like fluency", estimatedMinutes: 40 },
  ],
};

export async function seedExtraLessons(
  db: any
): Promise<{ success: boolean; message: string; stats: any }> {
  const { languages: languagesTable, courses: coursesTable, lessons: lessonsTable } = await import("../drizzle/schema.js");
  const { eq, and } = await import("drizzle-orm");

  let stats = { coursesUpdated: 0, lessonsAdded: 0 };

  // Get all languages
  const allLanguages = await db.select().from(languagesTable).where(eq(languagesTable.isActive, true));
  console.log(`Found ${allLanguages.length} active languages`);

  for (const lang of allLanguages) {
    const levels: Array<"beginner" | "intermediate" | "advanced"> = ["beginner", "intermediate", "advanced"];

    for (const level of levels) {
      // Find existing course for this language+level
      const existingCourses = await db.select()
        .from(coursesTable)
        .where(and(eq(coursesTable.languageId, lang.id), eq(coursesTable.level, level)));

      let courseId: number;

      if (existingCourses.length > 0) {
        courseId = existingCourses[0].id;
      } else {
        // Create course if it doesn't exist
        const [result] = await db.insert(coursesTable).values({
          languageId: lang.id,
          title: `${lang.name} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
          description: `Learn ${lang.name} at ${level} level`,
          level,
          isPublished: true,
        });
        courseId = result.insertId;
        stats.coursesUpdated++;
      }

      // Check how many lessons this course already has
      const existingLessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId));
      const existingCount = existingLessons.length;

      // Add extra topics that don't exist yet
      const extraTopics = EXTRA_TOPICS[level];
      const existingTitles = new Set(existingLessons.map((l: any) => l.title));

      let orderIndex = existingCount + 1;
      for (const topic of extraTopics) {
        if (!existingTitles.has(topic.title)) {
          await db.insert(lessonsTable).values({
            courseId,
            title: topic.title,
            description: topic.description,
            orderIndex: orderIndex++,
            estimatedMinutes: topic.estimatedMinutes,
            isPublished: true,
          });
          stats.lessonsAdded++;
        }
      }
    }
  }

  return {
    success: true,
    message: `Extra seed: ${stats.coursesUpdated} cursos criados, ${stats.lessonsAdded} lições adicionadas`,
    stats,
  };
}
