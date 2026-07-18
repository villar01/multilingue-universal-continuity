/**
 * PHRASAL VERBS SCHEMA
 * Banco de dados de phrasal verbs com exemplos e exercícios
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const phrasalVerbs = sqliteTable("phrasal_verbs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  verb: text("verb").notNull(), // ex: "break"
  particle: text("particle").notNull(), // ex: "up"
  phrasalVerb: text("phrasal_verb").notNull(), // ex: "break up"
  meaning: text("meaning").notNull(), // significado principal
  translations: text("translations").notNull(), // JSON: ["terminar relacionamento", "separar", "dividir"]
  category: text("category").notNull(), // ex: "relationships", "work", "daily_life"
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  examples: text("examples").notNull(), // JSON: [{en: "They broke up last month", pt: "Eles terminaram mês passado"}]
  synonyms: text("synonyms"), // JSON: ["split up", "separate"]
  relatedPhrases: text("related_phrases"), // JSON: ["break down", "break in", "break out"]
  notes: text("notes"), // dicas de uso
  languageCode: text("language_code").notNull().default("en"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const phrasalVerbExercises = sqliteTable("phrasal_verb_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phrasalVerbId: integer("phrasal_verb_id").notNull(),
  type: text("type", { enum: ["fill_blank", "multiple_choice", "translation", "matching"] }).notNull(),
  question: text("question").notNull(),
  options: text("options"), // JSON para múltipla escolha
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
