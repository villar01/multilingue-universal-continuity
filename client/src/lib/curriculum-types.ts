import type { CEFRLevel } from "@/lib/lesson-levels";

export type StudyEntryKind = "vocabulary" | "grammar" | "situation";

export interface StudyEntry {
  id: string;
  unit: string;
  kind: StudyEntryKind;
  cefr: CEFRLevel;
  title: string;
  subtitle: string;
  targetText: string;
  nativeExplanation: string;
  figurativePronunciation?: string;
  example: string;
  exampleTranslation: string;
  paretoWord: string;
  paretoTranslation: string;
  relatedScene: string;
  searchTerms: string[];
}

export interface StudyComprehensionQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StructuredStudyUnit {
  id: string;
  unit: string;
  objective: string;
  readingTitle: string;
  reading: string;
  readingTranslation: string;
  grammarTitle: string;
  grammarExplanation: string;
  writingPrompt: string;
  questions: StudyComprehensionQuestion[];
}

export type ParetoCategory =
  | "greetings" | "numbers" | "time" | "family" | "body"
  | "food" | "colors" | "nature" | "city" | "transport"
  | "work" | "emotions" | "actions" | "adjectives" | "questions"
  | "directions" | "shopping" | "health" | "technology" | "education"
  | "travel" | "weather" | "home" | "clothes" | "animals"
  | "sports" | "arts" | "business" | "phrases" | "connectors"
  | "social" | "expressions" | "verbs" | "nouns" | "finance"
  | "beach" | "paris" | "newyork" | "tokyo" | "forest" | "kitchen"
  | "mountains" | "desert" | "countryside" | "general";

export interface ParetoWord {
  id: string;
  ptBR: string;
  enUS: string;
  enGB?: string;
  pronunciation: string;
  pronunciationGB?: string;
  category: ParetoCategory;
  frequency: number;
  example: string;
  examplePt: string;
  scene?: string;
}

export type LanguageBlockKind = "essential_phrase" | "everyday_expression" | "natural_reply" | "contextual_slang";

export type LanguageBlock = {
  id: string;
  cefr: CEFRLevel;
  kind: LanguageBlockKind;
  english: string;
  portuguese: string;
  figurativePronunciation: string;
  example: string;
  examplePortuguese: string;
  writingPrompt: string;
  safetyNote?: string;
};
