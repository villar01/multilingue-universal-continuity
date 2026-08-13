import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolvePracticeCEFRLevel } from "../client/src/lib/lesson-levels";

describe("resolução CEFR para modalidades de prática", () => {
  it("mapeia grupos pedagógicos ao estágio CEFR correto", () => {
    expect(resolvePracticeCEFRLevel("beginner")).toBe("A1");
    expect(resolvePracticeCEFRLevel("basic")).toBe("A2");
    expect(resolvePracticeCEFRLevel("intermediate")).toBe("B1");
    expect(resolvePracticeCEFRLevel("upper-intermediate")).toBe("B2");
    expect(resolvePracticeCEFRLevel("advanced")).toBe("C1");
    expect(resolvePracticeCEFRLevel("proficient")).toBe("C2");
  });

  it("preserva um nível CEFR explícito e protege entrada ausente como A1", () => {
    expect(resolvePracticeCEFRLevel("B2")).toBe("B2");
    expect(resolvePracticeCEFRLevel()).toBe("A1");
  });

  it("impede desvios de nível nos fluxos Pareto ampliados", () => {
    for (const relativePath of [
      "../client/src/components/DailyMemoryTrainer.tsx",
      "../client/src/components/MemoryGameLesson.tsx",
      "../client/src/pages/ImmersiveScene.tsx",
    ]) {
      const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
      expect(source).toContain("resolvePracticeCEFRLevel");
    }
  });
});
