import { describe, expect, it } from "vitest";
import {
  TRIAL_AUTHORIZATION_BLOCK_MS,
  TRIAL_AUTHORIZATION_MAX_NEW_LESSONS_PER_WINDOW,
  TRIAL_AUTHORIZATION_WINDOW_MS,
  checkTrialLessonAuthorizationAttempt,
  clearTrialLessonAuthorizationAttempt,
} from "./trial-authorization-abuse-guard";

describe("proteção contra automação na avaliação", () => {
  it("permite novas lições dentro da janela proporcional", () => {
    const userId = 9_001;
    const now = 1_000_000;
    clearTrialLessonAuthorizationAttempt(userId);

    for (let attempt = 0; attempt < TRIAL_AUTHORIZATION_MAX_NEW_LESSONS_PER_WINDOW; attempt += 1) {
      expect(checkTrialLessonAuthorizationAttempt(userId, now).allowed).toBe(true);
    }
  });

  it("bloqueia apenas tentativas excedentes e libera novamente após o prazo", () => {
    const userId = 9_002;
    const now = 2_000_000;
    clearTrialLessonAuthorizationAttempt(userId);

    for (let attempt = 0; attempt < TRIAL_AUTHORIZATION_MAX_NEW_LESSONS_PER_WINDOW; attempt += 1) {
      checkTrialLessonAuthorizationAttempt(userId, now);
    }

    const blocked = checkTrialLessonAuthorizationAttempt(userId, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.blockedUntil?.getTime()).toBe(now + TRIAL_AUTHORIZATION_BLOCK_MS);
    expect(checkTrialLessonAuthorizationAttempt(userId, now + TRIAL_AUTHORIZATION_BLOCK_MS).allowed).toBe(true);
  });

  it("reinicia a contagem ao fim da janela sem guardar conteúdo ou identificadores externos", () => {
    const userId = 9_003;
    const now = 3_000_000;
    clearTrialLessonAuthorizationAttempt(userId);
    checkTrialLessonAuthorizationAttempt(userId, now);

    expect(checkTrialLessonAuthorizationAttempt(userId, now + TRIAL_AUTHORIZATION_WINDOW_MS).allowed).toBe(true);
  });
});
