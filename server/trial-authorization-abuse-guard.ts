export const TRIAL_AUTHORIZATION_WINDOW_MS = 60_000;
export const TRIAL_AUTHORIZATION_MAX_NEW_LESSONS_PER_WINDOW = 12;
export const TRIAL_AUTHORIZATION_BLOCK_MS = 15 * 60_000;

type TrialAuthorizationAttempt = {
  windowStartedAt: number;
  attempts: number;
  blockedUntil: number | null;
};

const attemptsByUser = new Map<number, TrialAuthorizationAttempt>();

export function checkTrialLessonAuthorizationAttempt(userId: number, now = Date.now()) {
  const current = attemptsByUser.get(userId);
  if (current?.blockedUntil && current.blockedUntil > now) {
    return { allowed: false, blockedUntil: new Date(current.blockedUntil) };
  }

  const windowExpired = !current || now - current.windowStartedAt >= TRIAL_AUTHORIZATION_WINDOW_MS;
  const attempt: TrialAuthorizationAttempt = windowExpired
    ? { windowStartedAt: now, attempts: 1, blockedUntil: null }
    : { ...current, attempts: current.attempts + 1, blockedUntil: null };

  if (attempt.attempts > TRIAL_AUTHORIZATION_MAX_NEW_LESSONS_PER_WINDOW) {
    attempt.blockedUntil = now + TRIAL_AUTHORIZATION_BLOCK_MS;
    attemptsByUser.set(userId, attempt);
    return { allowed: false, blockedUntil: new Date(attempt.blockedUntil) };
  }

  attemptsByUser.set(userId, attempt);
  return { allowed: true, blockedUntil: null };
}

/** Limpeza oportunista sem temporizador: mantida para testes e para futuras rotinas de encerramento de conta. */
export function clearTrialLessonAuthorizationAttempt(userId: number) {
  attemptsByUser.delete(userId);
}
