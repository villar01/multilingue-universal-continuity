import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/LessonsHub.tsx"), "utf8");

describe("Trilhas CEFR numeradas no hub de lições", () => {
  it("atribui uma ordem local a cada cena do estágio selecionado", () => {
    expect(source).toContain("const curricularLessonNumber = index + 1;");
    expect(source).toContain("Aula {selectedLevel}.{curricularLessonNumber}");
    expect(source).toContain("Aulas {selectedLevel} — sequência curricular");
    expect(source).toContain("{scenes.length} aulas");
  });

  it("mantém a mesma referência numerada dentro da cena aberta", () => {
    expect(source).toContain("const curricularLessonNumber = scene ? scenes.findIndex");
    expect(source).toContain("Aula ${selectedLevel}.${curricularLessonNumber} · ${scene?.titlePt}");
    expect(source).toContain("curricularLessonNumber={curricularLessonNumber}");
    expect(source).toContain("Aula {cefrLevel}.{curricularLessonNumber}");
  });
});
