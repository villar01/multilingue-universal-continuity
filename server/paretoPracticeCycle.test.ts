import { describe, expect, it } from "vitest";
import {
  checkParetoRecall,
  checkParetoSentence,
  getParetoLevelRequirement,
  nextParetoStep,
} from "../client/src/lib/paretoPracticeCycle";
import { getDueParetoReviewIds, recordSuccessfulParetoReview } from "../client/src/lib/paretoSpacedReview";

const term = { word: "water", translation: "água" };

describe("Pareto practice cycle", () => {
  it("requires active spelling recall before marking the word as remembered", () => {
    expect(checkParetoRecall(" Water ", term).correct).toBe(true);
    expect(checkParetoRecall("juice", term).correct).toBe(false);
  });

  it("requires a new sentence to contain the learned word and meaningful length", () => {
    expect(checkParetoSentence("I drink water.", term).correct).toBe(true);
    expect(checkParetoSentence("Water!", term).correct).toBe(false);
    expect(checkParetoSentence("I drink juice.", term).correct).toBe(false);
  });

  it("keeps the Pareto sequence from observation through sentence creation", () => {
    expect(nextParetoStep("observe")).toBe("recall");
    expect(nextParetoStep("recall")).toBe("write");
    expect(nextParetoStep("write")).toBe("create");
    expect(nextParetoStep("create")).toBeNull();
  });

  it("raises sentence depth gradually for CEFR levels while keeping an upper boundary", () => {
    const a1 = getParetoLevelRequirement("A1");
    const b2 = getParetoLevelRequirement("B2");
    expect(a1.minSentenceWords).toBeLessThan(b2.minSentenceWords);
    expect(checkParetoSentence("My water is clean", term, b2).correct).toBe(false);
    expect(checkParetoSentence("My water is clean because I always use a reusable bottle at school", term, b2).correct).toBe(true);
  });

  it("agenda a mesma palavra em 1, 3, 7, 14 e 30 dias e a traz de volta quando vencer", () => {
    const startedAt = Date.UTC(2026, 7, 18, 12, 0, 0);
    const expectedDays = [1, 3, 7, 14, 30];
    let schedule = {};

    for (const days of expectedDays) {
      schedule = recordSuccessfulParetoReview(schedule, "pareto-001-water", startedAt);
      expect(schedule["pareto-001-water"]?.dueAt).toBe(startedAt + days * 24 * 60 * 60 * 1000);
    }

    expect(getDueParetoReviewIds(schedule, startedAt + 29 * 24 * 60 * 60 * 1000)).toEqual([]);
    expect(getDueParetoReviewIds(schedule, startedAt + 30 * 24 * 60 * 60 * 1000)).toEqual(["pareto-001-water"]);
  });
});
