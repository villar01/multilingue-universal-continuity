export function completedProgramCount(completedWordIds: ReadonlySet<string>, authorizedWordCount: number): number {
  return Math.min(completedWordIds.size, Math.max(authorizedWordCount, 0));
}
