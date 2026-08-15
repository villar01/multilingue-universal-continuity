import { describe, expect, it } from "vitest";
import { hasLearningAccess, requiresLearningEnrollment } from "../client/src/lib/learningAccess";

describe("learning access gate", () => {
  it("keeps presentation and enrollment paths public", () => {
    expect(requiresLearningEnrollment("/")).toBe(false);
    expect(requiresLearningEnrollment("/pricing")).toBe(false);
    expect(requiresLearningEnrollment("/terms")).toBe(false);
    expect(requiresLearningEnrollment("/onboarding")).toBe(false);
  });

  it("requires enrollment for course and practice routes", () => {
    expect(requiresLearningEnrollment("/base-de-estudos")).toBe(true);
    expect(requiresLearningEnrollment("/pareto-1000")).toBe(true);
    expect(requiresLearningEnrollment("/immersive-scene")).toBe(true);
    expect(requiresLearningEnrollment("/lesson/42")).toBe(true);
  });

  it("requires both an authenticated account and accepted protection terms", () => {
    expect(hasLearningAccess({ isAuthenticated: false, acceptedProtectionTerms: false })).toBe(false);
    expect(hasLearningAccess({ isAuthenticated: true, acceptedProtectionTerms: false })).toBe(false);
    expect(hasLearningAccess({ isAuthenticated: true, acceptedProtectionTerms: true })).toBe(true);
  });
});
