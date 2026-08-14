import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/LessonsHub.tsx"), "utf8");

describe("roteiro contínuo das aulas visuais", () => {
  it("mantém as cinco etapas curriculares em uma única sequência", () => {
    expect(source).toContain('useState<"intro" | "vocabulary" | "dialogue" | "practice" | "review">("intro")');
    expect(source).toContain('label: "1. Apresentação"');
    expect(source).toContain('label: "2. Vocabulário"');
    expect(source).toContain('label: "3. Diálogo"');
    expect(source).toContain('label: "4. Prática"');
    expect(source).toContain('label: "5. Revisão"');
  });

  it("exige vocabulário antes do diálogo e prática antes da revisão", () => {
    expect(source).toContain('setLessonStep("dialogue")');
    expect(source).toContain('setLessonStep("practice")');
    expect(source).toContain('else setLessonStep("review")');
    expect(source).toContain('prática de memorização');
  });

  it("preserva cenas, professor, vocabulário e fala por palavra", () => {
    expect(source).toContain('scene.image');
    expect(source).toContain('scene.teacher');
    expect(source).toContain('scene.words.map');
    expect(source).toContain('speakWord(w.word)');
  });
});
