import { describe, expect, it } from "vitest";
import { requiresLearningHttpGate } from "./learning-http-gate";
import { TRIAL_LESSON_LIMIT, decideTrialLessonAccess } from "./trial-access-router";

describe("fluxo de privacidade e acesso curricular", () => {
  it("mantém somente apresentação e proteção pública fora da barreira curricular", () => {
    for (const route of ["/", "/pricing", "/terms", "/language-detect"] as const) {
      expect(requiresLearningHttpGate(route)).toBe(false);
    }
  });

  it("exige conta autorizada antes de entregar áreas de estudo", () => {
    for (const route of ["/abc-book", "/pareto-1000", "/immersive-scene", "/lesson/1", "/practice"] as const) {
      expect(requiresLearningHttpGate(route)).toBe(true);
    }
  });

  it("permite apenas a avaliação temporária de dez lições antes do bloqueio", () => {
    expect(TRIAL_LESSON_LIMIT).toBe(10);
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 0, lessonLimit: TRIAL_LESSON_LIMIT, isPreviouslyAuthorized: false }).allowed).toBe(true);
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 10, lessonLimit: TRIAL_LESSON_LIMIT, isPreviouslyAuthorized: false }).allowed).toBe(false);
  });
});
