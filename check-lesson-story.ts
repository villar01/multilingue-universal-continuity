import { getDb } from "./server/db";

async function checkLessonStory() {
  const db = await getDb();
  if (!db) throw new Error("DB not connected");
  
  const result = await db.execute("SELECT id, title, storyText FROM lessons WHERE id = 360006");
  const lesson = (result as any)[0][0];
  
  console.log("Lição:", lesson.title);
  console.log("\n=== HISTÓRIA COMPLETA ===");
  console.log(lesson.storyText);
  console.log("\n=== ESTATÍSTICAS ===");
  console.log("Total de caracteres:", lesson.storyText?.length);
  console.log("Total de palavras:", lesson.storyText?.split(" ").length);
}

checkLessonStory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro:", error);
    process.exit(1);
  });
