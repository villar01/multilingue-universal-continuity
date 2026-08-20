export const NATURAL_LESSON_GENERATION_TIMEOUT_MS = 8_000;

type TimerId = ReturnType<typeof setTimeout>;

type GenerationGuardOptions = {
  onTimeout: () => void;
  timeoutMs?: number;
  schedule?: (callback: () => void, timeoutMs: number) => TimerId;
  clear?: (timerId: TimerId) => void;
};

export function createLessonGenerationGuard({
  onTimeout,
  timeoutMs = NATURAL_LESSON_GENERATION_TIMEOUT_MS,
  schedule = setTimeout,
  clear = clearTimeout,
}: GenerationGuardOptions) {
  let acceptsResult = true;
  const timeoutId = schedule(() => {
    if (!acceptsResult) return;
    acceptsResult = false;
    onTimeout();
  }, timeoutMs);

  const finish = (callback: () => void) => {
    if (!acceptsResult) return false;
    acceptsResult = false;
    clear(timeoutId);
    callback();
    return true;
  };

  return {
    finish,
    cancel: () => {
      acceptsResult = false;
      clear(timeoutId);
    },
  };
}
