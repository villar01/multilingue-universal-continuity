import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/MemoryGameLesson.tsx", import.meta.url), "utf8");

describe("Jogo de memória com CEFR", () => {
  it("aceita somente o tipo CEFR central como nível curricular", () => {
    expect(source).toContain('import type { CEFRLevel } from "@/lib/lesson-levels"');
    expect(source).toContain("level?: CEFRLevel;");
    expect(source).toContain('level = "A1"');
    expect(source).not.toContain('level?: "beginner" | "intermediate" | "advanced"');
  });

  it("entrega a mesma etapa CEFR à prática Pareto", () => {
    expect(source).toContain("level={level}");
    expect(source).not.toContain("resolvePracticeCEFRLevel(level)");
  });
});
