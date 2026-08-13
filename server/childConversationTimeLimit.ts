export type UsageSessionWindow = {
  minutesUsed: number | null;
  sessionStart: Date;
  sessionEnd: Date | null;
};

/** Monday-first index, matching parentalSettings.allowedDays. */
export function parentalWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Counts stored minutes for closed sessions and elapsed time for an active
 * session. The calculation intentionally uses no conversation text.
 */
export function calculateDailyUsageMinutes(sessions: UsageSessionWindow[], now: Date): number {
  return sessions.reduce((total, session) => {
    if (session.sessionEnd) return total + Math.max(0, session.minutesUsed || 0);
    const elapsed = Math.floor((now.getTime() - session.sessionStart.getTime()) / 60_000);
    return total + Math.max(0, elapsed);
  }, 0);
}

export function canUseOnDay(allowedDays: boolean[] | null, now: Date): boolean {
  return !allowedDays || allowedDays.length !== 7 || allowedDays[parentalWeekdayIndex(now)] !== false;
}
