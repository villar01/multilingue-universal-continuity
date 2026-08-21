/**
 * Expansão Diária de Vocabulário Pareto
 * Rota: POST /api/scheduled/vocab-expand
 * Cron: todo dia às 03:00 UTC
 * Gera +200 palavras/expressões novas usando IA e salva no banco
 */
import { Request, Response } from "express";
import { invokeLLM } from "../_core/llm";
import { sdk } from "../_core/sdk";
import { getDb } from "../db";

const CATEGORIES = [
  "expressions", "verbs", "adjectives", "nouns", "food", "travel",
  "health", "work", "education", "technology", "nature", "social",
  "home", "shopping", "sports", "arts", "finance", "family",
  "transport", "weather", "connectors"
];

const SCENES = [
  "beach", "city", "nature", "work", "home", "education",
  "food", "travel", "health", "sports", "arts", "social",
  "shopping", "weather", "greetings", "family", "technology"
];

export async function handleVocabExpand(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Verificar se já rodou hoje
    const dbConn = await getDb();
    const existing = await (dbConn as any).execute(
      `SELECT COUNT(*) as cnt FROM vocab_expansions WHERE batch_date = ?`,
      [today]
    );
    const count = (existing[0] as any)[0]?.cnt ?? 0;
    if (count >= 200) {
      return res.json({ ok: true, message: `Already expanded today (${count} words)`, skipped: true });
    }

    // Pegar categorias aleatórias para diversidade
    const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 8);
    const batchSize = 200 - count;

    const prompt = `You are a language learning expert specializing in Portuguese (Brazil) and English (American and British variants).

Generate exactly ${batchSize} vocabulary entries for a language learning app following the Pareto principle (high-frequency, most useful words and expressions).

Focus on these categories: ${shuffled.join(", ")}

IMPORTANT RULES:
1. Include a mix of: single words, phrasal verbs, idioms, collocations, and common expressions
2. Each entry must be genuinely useful in daily conversation
3. Include both en-US and en-GB variants when they differ (e.g., "apartment" vs "flat")
4. Vary difficulty: 60% beginner, 30% intermediate, 10% advanced
5. Include real example sentences that sound natural

Return a JSON array with exactly ${batchSize} objects. Each object must have:
{
  "wordId": "unique_id_max_20chars",
  "ptBR": "Portuguese (Brazil) word or expression",
  "enUS": "American English equivalent",
  "enGB": "British English equivalent (if different, otherwise same as enUS)",
  "pronunciation": "IPA pronunciation of enUS",
  "category": "one of: ${CATEGORIES.join(", ")}",
  "frequency": number from 1-10 (10=most common),
  "example": "Natural English sentence using this word",
  "examplePt": "Natural Portuguese sentence using this word",
  "scene": "one of: ${SCENES.join(", ")}"
}

Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a language learning vocabulary expert. Return only valid JSON arrays." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" } as any
    });

    const rawContent = response.choices[0]?.message?.content ?? "[]";
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    let words: any[] = [];

    try {
      const parsed = JSON.parse(content);
      words = Array.isArray(parsed) ? parsed : (parsed.words ?? parsed.entries ?? parsed.vocabulary ?? []);
    } catch {
      // Try to extract JSON array from content
      const match = content.match(/\[[\s\S]*\]/);
      if (match) words = JSON.parse(match[0]);
    }

    if (!words.length) {
      return res.status(500).json({ ok: false, error: "No words generated" });
    }

    // Inserir no banco (ignorar duplicatas)
    let inserted = 0;
    for (const w of words) {
      if (!w.wordId || !w.ptBR || !w.enUS || !w.category) continue;
      try {
        await (dbConn as any).execute(
          `INSERT IGNORE INTO vocab_expansions 
           (word_id, pt_br, en_us, en_gb, pronunciation, category, frequency, example, example_pt, scene, batch_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(w.wordId).slice(0, 20),
            String(w.ptBR).slice(0, 100),
            String(w.enUS).slice(0, 100),
            String(w.enGB ?? w.enUS).slice(0, 100),
            String(w.pronunciation ?? "").slice(0, 100),
            String(w.category).slice(0, 50),
            Number(w.frequency ?? 5),
            String(w.example ?? "").slice(0, 500),
            String(w.examplePt ?? "").slice(0, 500),
            String(w.scene ?? "general").slice(0, 50),
            today
          ]
        );
        inserted++;
      } catch {
        // skip duplicate
      }
    }

    console.log(`[VocabExpand] ${today}: inserted ${inserted}/${words.length} words`);
    return res.json({ ok: true, date: today, inserted, total: words.length });

  } catch (error: any) {
    console.error("[VocabExpand] Error:", error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
