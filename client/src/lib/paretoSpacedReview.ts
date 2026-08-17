export type ParetoReviewRecord = {
  repetitions: number;
  dueAt: number;
  updatedAt: number;
};

export type ParetoReviewSchedule = Record<string, ParetoReviewRecord>;

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function recordSuccessfulParetoReview(
  schedule: ParetoReviewSchedule,
  wordId: string,
  completedAt: number = Date.now(),
): ParetoReviewSchedule {
  const repetitions = (schedule[wordId]?.repetitions ?? 0) + 1;
  const intervalDays = REVIEW_INTERVAL_DAYS[Math.min(repetitions - 1, REVIEW_INTERVAL_DAYS.length - 1)]!;

  return {
    ...schedule,
    [wordId]: {
      repetitions,
      dueAt: completedAt + intervalDays * DAY_IN_MS,
      updatedAt: completedAt,
    },
  };
}

export function getDueParetoReviewIds(schedule: ParetoReviewSchedule, now: number = Date.now()): string[] {
  return Object.entries(schedule)
    .filter(([, review]) => review.dueAt <= now)
    .sort(([, first], [, second]) => first.dueAt - second.dueAt)
    .map(([wordId]) => wordId);
}

export function getParetoProgramIndex(wordId: string): number | null {
  const match = /^pareto-(\d+)-/.exec(wordId);
  if (!match?.[1]) return null;
  const index = Number(match[1]) - 1;
  return Number.isSafeInteger(index) && index >= 0 ? index : null;
}
