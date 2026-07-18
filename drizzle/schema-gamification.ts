import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * GAMIFICATION SYSTEM
 * Sistema de XP, níveis, badges e leaderboard
 */

// User XP and Level
export const userGameStats = mysqlTable("user_game_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // XP and Level
  totalXp: int("totalXp").default(0).notNull(),
  currentLevel: int("currentLevel").default(1).notNull(),
  xpToNextLevel: int("xpToNextLevel").default(100).notNull(),
  
  // Streaks
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  
  // Stats
  totalLessonsCompleted: int("totalLessonsCompleted").default(0).notNull(),
  totalExercisesCompleted: int("totalExercisesCompleted").default(0).notNull(),
  totalWordsLearned: int("totalWordsLearned").default(0).notNull(),
  totalMinutesStudied: int("totalMinutesStudied").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Badges/Achievements
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // Emoji or icon name
  category: mysqlEnum("category", ["streak", "lessons", "exercises", "words", "special"]).notNull(),
  requirement: int("requirement").notNull(), // Number needed to unlock
  xpReward: int("xpReward").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// User Badges (many-to-many)
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  badgeId: int("badgeId").notNull().references(() => badges.id),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

// Weekly Leaderboard
export const weeklyLeaderboard = mysqlTable("weekly_leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  rank: int("rank"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserGameStats = typeof userGameStats.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type WeeklyLeaderboard = typeof weeklyLeaderboard.$inferSelect;
