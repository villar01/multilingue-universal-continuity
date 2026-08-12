import { describe, expect, it } from "vitest";
import {
  checkParetoRecall,
  checkParetoSentence,
  nextParetoStep,
} from "../client/src/lib/paretoPracticeCycle";

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
});
