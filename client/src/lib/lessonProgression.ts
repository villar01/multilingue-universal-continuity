export interface ProgressionLesson {
  id: number;
  orderIndex?: number | null;
  [key: string]: unknown;
}

export interface UnlockableLesson extends ProgressionLesson {
  completed: boolean;
  progressLocked: boolean;
  locked: boolean;
}

/**
 * Keeps a course linear: completed lessons stay reviewable and only the first
 * unfinished lesson is open. Paid-plan access remains an independent rule.
 */
export function buildLessonProgression<T extends ProgressionLesson>(
  lessons: T[],
  completedLessonIds: Iterable<number>,
  isPremium: boolean,
  freeLessonsLimit: number,
): Array<T & UnlockableLesson> {
  const completed = new Set(completedLessonIds);
  const ordered = [...lessons].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const firstIncompleteIndex = ordered.findIndex((lesson) => !completed.has(lesson.id));
  const nextUnlockIndex = firstIncompleteIndex === -1 ? ordered.length : firstIncompleteIndex;

  return ordered.map((lesson, index) => ({
    ...lesson,
    completed: completed.has(lesson.id),
    progressLocked: index > nextUnlockIndex,
    locked: !isPremium && index >= freeLessonsLimit,
  }));
}
