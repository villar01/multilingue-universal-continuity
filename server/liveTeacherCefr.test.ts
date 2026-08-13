import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Professor ao Vivo e progressão CEFR", () => {
  it("aceita somente os seis estágios CEFR e descreve cada estágio no prompt", () => {
    const router = source("server/live-teacher-router.ts");

    expect(router).toContain('const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const');
    expect(router).toContain('level: z.enum(CEFR_LEVELS).default("A1")');
    expect(router).toContain('A1: "A1 — introduza vocabulário concreto');
    expect(router).toContain('C2: "C2 — proponha debate');
    expect(router).not.toContain('z.enum(["beginner", "intermediate", "advanced"])');
  });

  it("exibe o estágio CEFR selecionado ao lado do rótulo pedagógico", () => {
    const component = source("client/src/components/LiveLessonTeacher.tsx");

    expect(component).toContain('level?: CEFRLevel');
    expect(component).toContain('level = "A1"');
    expect(component).toContain('{level} · {CEFR_LEVELS[level].label}');
  });
});
