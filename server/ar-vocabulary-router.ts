import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { AR_CORE_WORDS_EN, type ARVocabWord } from "./data/ar-vocabulary";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type CEFRLevel = typeof CEFR_LEVELS[number];

const AR_ADVANCED_WORDS_EN: ARVocabWord[] = [
  { id: "en-ar-b101", word: "appointment", translation: "compromisso agendado", pronunciation: "/əˈpɔɪntmənt/", audioKey: "en_appointment", category: "time", arObject: "📅", cefr: "B1", frequency: 201 },
  { id: "en-ar-b102", word: "neighborhood", translation: "bairro", pronunciation: "/ˈneɪbərhʊd/", audioKey: "en_neighborhood", category: "travel", arObject: "🏘️", cefr: "B1", frequency: 202 },
  { id: "en-ar-b103", word: "environment", translation: "meio ambiente", pronunciation: "/ɪnˈvaɪrənmənt/", audioKey: "en_environment", category: "nature", arObject: "🌿", cefr: "B1", frequency: 203 },
  { id: "en-ar-b104", word: "schedule", translation: "programação", pronunciation: "/ˈskedʒuːl/", audioKey: "en_schedule", category: "time", arObject: "🗓️", cefr: "B1", frequency: 204 },
  { id: "en-ar-b201", word: "sustainable", translation: "sustentável", pronunciation: "/səˈsteɪnəbəl/", audioKey: "en_sustainable", category: "nature", arObject: "♻️", cefr: "B2", frequency: 301 },
  { id: "en-ar-b202", word: "perspective", translation: "perspectiva", pronunciation: "/pərˈspektɪv/", audioKey: "en_perspective", category: "education", arObject: "🔭", cefr: "B2", frequency: 302 },
  { id: "en-ar-b203", word: "reliable", translation: "confiável", pronunciation: "/rɪˈlaɪəbəl/", audioKey: "en_reliable", category: "work", arObject: "✅", cefr: "B2", frequency: 303 },
  { id: "en-ar-c101", word: "hypothesis", translation: "hipótese", pronunciation: "/haɪˈpɑːθəsɪs/", audioKey: "en_hypothesis", category: "education", arObject: "🧪", cefr: "C1", frequency: 401 },
  { id: "en-ar-c102", word: "framework", translation: "estrutura conceitual", pronunciation: "/ˈfreɪmwɜːrk/", audioKey: "en_framework", category: "work", arObject: "🧩", cefr: "C1", frequency: 402 },
  { id: "en-ar-c103", word: "constraint", translation: "restrição", pronunciation: "/kənˈstreɪnt/", audioKey: "en_constraint", category: "work", arObject: "⚖️", cefr: "C1", frequency: 403 },
  { id: "en-ar-c201", word: "paradigm", translation: "paradigma", pronunciation: "/ˈpærədaɪm/", audioKey: "en_paradigm", category: "education", arObject: "🧠", cefr: "C1", frequency: 501 },
  { id: "en-ar-c202", word: "ambiguity", translation: "ambiguidade", pronunciation: "/ˌæmbɪˈɡjuːəti/", audioKey: "en_ambiguity", category: "culture", arObject: "🔍", cefr: "C1", frequency: 502 },
  { id: "en-ar-c203", word: "feasibility", translation: "viabilidade", pronunciation: "/ˌfiːzəˈbɪləti/", audioKey: "en_feasibility", category: "work", arObject: "📊", cefr: "C1", frequency: 503 },
];

function deriveCefrFromCurrentLevel(level: number | null | undefined): CEFRLevel {
  if (!level || level <= 1) return "A1";
  if (level === 2) return "A2";
  if (level === 3) return "B1";
  if (level === 4) return "B2";
  if (level === 5) return "C1";
  return "C2";
}

export function selectARWordsForCefr(level: CEFRLevel): ARVocabWord[] {
  const catalog = [...AR_CORE_WORDS_EN, ...AR_ADVANCED_WORDS_EN];
  const exact = catalog.filter((word) => word.cefr === level);
  if (exact.length >= 6) return exact.slice(0, 6);
  const permittedIndex = CEFR_LEVELS.indexOf(level);
  const permitted = catalog.filter((word) => CEFR_LEVELS.indexOf(word.cefr as CEFRLevel) <= permittedIndex);
  return [...exact, ...permitted.filter((word) => !exact.some((item) => item.id === word.id))].slice(0, 6);
}

export const arVocabularyRouter = router({
  forLearner: protectedProcedure
    .input(z.object({ targetLanguage: z.string().min(2).max(10) }))
    .query(async ({ ctx, input }) => {
      const requestedBase = input.targetLanguage.toLowerCase().split("-")[0];
      const cefrLevel = deriveCefrFromCurrentLevel(ctx.user.currentLevel);
      if (requestedBase !== "en") {
        return { supported: false as const, cefrLevel, words: [] as ARVocabWord[] };
      }
      return { supported: true as const, cefrLevel, words: selectARWordsForCefr(cefrLevel) };
    }),
});
