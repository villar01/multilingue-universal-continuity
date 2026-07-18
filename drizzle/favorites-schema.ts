/**
 * FAVORITES SCHEMA
 * Schema para sistema de favoritos e repetição espaçada
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const phrasalVerbFavorites = sqliteTable("phrasal_verb_favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  phrasalVerbId: integer("phrasal_verb_id").notNull(),
  
  // Spaced Repetition System (SRS) fields
  easeFactor: integer("ease_factor").notNull().default(2500), // 2.5 * 1000 (percentual)
  interval: integer("interval").notNull().default(1), // dias até próxima revisão
  repetitions: integer("repetitions").notNull().default(0), // número de repetições corretas consecutivas
  nextReviewDate: integer("next_review_date").notNull(), // timestamp Unix
  lastReviewedAt: integer("last_reviewed_at"), // timestamp Unix
  
  // Estatísticas
  totalReviews: integer("total_reviews").notNull().default(0),
  correctReviews: integer("correct_reviews").notNull().default(0),
  
  // Metadata
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Nota: Este schema precisa ser integrado ao schema principal
// Adicione ao drizzle/schema.ts:
// export * from "./favorites-schema";
