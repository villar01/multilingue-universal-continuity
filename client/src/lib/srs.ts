/**
 * SRS SM-2 Algorithm — roda 100% no browser, sem chamar servidor
 * Baseado no algoritmo SuperMemo-2 (Wozniak, 1987)
 * Calendário: 1d → 3d → 7d → 14d → 30d → 60d → 90d
 */

export interface SRSCard {
  id?: number;
  word: string;
  translation: string;
  targetLanguage: string;
  phonetic?: string;
  audioUrl?: string;
  imageKeyword?: string;
  lessonId?: number;
  source?: string; // 'lesson','ar','vr','dictation'
  easeFactor: number;   // default 2.5
  interval: number;     // days until next review
  repetitions: number;  // times reviewed successfully
  nextReviewAt: Date;
  lastScore?: number;
  createdAt?: Date;
}

/**
 * Calculates next review date using SM-2 algorithm
 * @param card - current card state
 * @param score - 0=forgot, 1=hard, 3=remembered with effort, 5=easy
 */
export function calculateNextReview(card: SRSCard, score: number): SRSCard {
  let { easeFactor, interval, repetitions } = card;

  if (score >= 3) {
    // Correct response
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;
    // Update ease factor
    easeFactor += 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02);
    easeFactor = Math.max(1.3, easeFactor); // minimum ease factor
  } else {
    // Wrong — reset to beginning
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { ...card, easeFactor, interval, repetitions, nextReviewAt, lastScore: score };
}

/**
 * Get cards due for review today
 */
export function getCardsForToday(cards: SRSCard[]): SRSCard[] {
  const now = new Date();
  return cards
    .filter(c => new Date(c.nextReviewAt) <= now)
    .sort((a, b) => +new Date(a.nextReviewAt) - +new Date(b.nextReviewAt));
}

/**
 * Get cards due in the next N days (for planning)
 */
export function getCardsDueInDays(cards: SRSCard[], days: number): SRSCard[] {
  const future = new Date();
  future.setDate(future.getDate() + days);
  return cards.filter(c => new Date(c.nextReviewAt) <= future);
}

/**
 * Create a new card with default SM-2 values
 */
export function createCard(
  word: string,
  translation: string,
  targetLanguage: string,
  options?: Partial<SRSCard>
): SRSCard {
  return {
    word,
    translation,
    targetLanguage,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewAt: new Date(),
    createdAt: new Date(),
    ...options,
  };
}

/**
 * Score labels for UI display
 */
export const SCORE_LABELS: Record<number, string> = {
  0: "Esqueci",
  1: "Difícil",
  3: "Lembrei",
  5: "Fácil",
};

/**
 * Score colors for UI
 */
export const SCORE_COLORS: Record<number, string> = {
  0: "#ef4444",
  1: "#f97316",
  3: "#22c55e",
  5: "#3b82f6",
};

/**
 * Calculate retention percentage based on card stats
 */
export function getRetentionRate(card: SRSCard): number {
  const total = (card.repetitions || 0);
  if (total === 0) return 0;
  // Approximate: higher ease factor = better retention
  return Math.min(100, Math.round((card.easeFactor / 2.5) * 70 + card.repetitions * 3));
}

/**
 * Get streak info from cards
 */
export function getStudyStats(cards: SRSCard[]) {
  const total = cards.length;
  const mastered = cards.filter(c => c.repetitions >= 5).length;
  const dueToday = getCardsForToday(cards).length;
  const avgEase = total > 0
    ? cards.reduce((sum, c) => sum + c.easeFactor, 0) / total
    : 2.5;

  return { total, mastered, dueToday, avgEase };
}
