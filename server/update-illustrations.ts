import { getDb } from "./db";
import { lessons } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Mapeamento de títulos para ilustrações
const illustrationMap: Record<string, string> = {
  "Greetings and Introductions": "/lesson-images/family.jpg",
  "My Family": "/lesson-images/family.jpg",
  "At the Restaurant": "/lesson-images/restaurant.jpg",
  "Daily Routine": "/lesson-images/daily-routine.jpg",
  "Shopping for Clothes": "/lesson-images/daily-routine.jpg",
  "At the Doctor": "/lesson-images/daily-routine.jpg",
  "Asking for Directions": "/lesson-images/daily-routine.jpg",
  "Weather and Seasons": "/lesson-images/daily-routine.jpg",
  "Hobbies and Free Time": "/lesson-images/daily-routine.jpg",
  "At the Hotel": "/lesson-images/restaurant.jpg",
  "Planning a Trip": "/lesson-images/daily-routine.jpg",
  "At the Airport": "/lesson-images/daily-routine.jpg",
  "Making Friends": "/lesson-images/family.jpg",
  "Job Interview": "/lesson-images/daily-routine.jpg",
  "Renting an Apartment": "/lesson-images/daily-routine.jpg",
  "At the Bank": "/lesson-images/daily-routine.jpg",
  "Celebrating Holidays": "/lesson-images/family.jpg",
  "Sports and Exercise": "/lesson-images/daily-routine.jpg",
  "Technology and Gadgets": "/lesson-images/daily-routine.jpg",
  "Cooking and Recipes": "/lesson-images/restaurant.jpg",
  "Environmental Issues": "/lesson-images/daily-routine.jpg",
  "Education System": "/lesson-images/daily-routine.jpg",
  "Health and Wellness": "/lesson-images/daily-routine.jpg",
  "Social Media Impact": "/lesson-images/daily-routine.jpg",
  "Career Development": "/lesson-images/daily-routine.jpg",
  "Cultural Differences": "/lesson-images/family.jpg",
  "News and Current Events": "/lesson-images/daily-routine.jpg",
  "Art and Literature": "/lesson-images/daily-routine.jpg",
  "Transportation Systems": "/lesson-images/daily-routine.jpg",
  "Consumer Rights": "/lesson-images/daily-routine.jpg",
  "Business Negotiations": "/lesson-images/daily-routine.jpg",
  "Scientific Discoveries": "/lesson-images/daily-routine.jpg",
  "Political Systems": "/lesson-images/daily-routine.jpg",
  "Economic Trends": "/lesson-images/daily-routine.jpg",
  "Legal Procedures": "/lesson-images/daily-routine.jpg",
  "Psychological Concepts": "/lesson-images/daily-routine.jpg",
  "Historical Events": "/lesson-images/daily-routine.jpg",
  "Philosophical Debates": "/lesson-images/daily-routine.jpg",
  "Artificial Intelligence": "/lesson-images/daily-routine.jpg",
  "Global Trade": "/lesson-images/daily-routine.jpg",
  "Academic Research Methods": "/lesson-images/daily-routine.jpg",
  "Literary Analysis": "/lesson-images/daily-routine.jpg",
  "Advanced Negotiations": "/lesson-images/daily-routine.jpg",
  "Technical Documentation": "/lesson-images/daily-routine.jpg",
  "Public Speaking": "/lesson-images/daily-routine.jpg",
  "Diplomatic Communication": "/lesson-images/daily-routine.jpg",
  "Complex Legal Arguments": "/lesson-images/daily-routine.jpg",
  "Advanced Scientific Discourse": "/lesson-images/daily-routine.jpg",
  "Cultural Critique": "/lesson-images/daily-routine.jpg",
  "Strategic Leadership": "/lesson-images/daily-routine.jpg",
};

async function updateIllustrations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }
  
  console.log("Atualizando illustrationUrl para todas as lições...");
  
  let updated = 0;
  for (const [title, illustrationUrl] of Object.entries(illustrationMap)) {
    await db
      .update(lessons)
      .set({ illustrationUrl })
      .where(eq(lessons.title, title));
    
    console.log(`✓ ${title} → ${illustrationUrl}`);
    updated++;
  }
  
  console.log(`\n✅ ${updated} lições atualizadas com ilustrações!`);
}

updateIllustrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
