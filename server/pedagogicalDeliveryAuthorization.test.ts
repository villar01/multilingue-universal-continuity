import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const curriculumRouter = readFileSync(resolve(root, "server/curriculum-router.ts"), "utf8");
const mainRouter = readFileSync(resolve(root, "server/routers.ts"), "utf8");
const trialRouter = readFileSync(resolve(root, "server/trial-access-router.ts"), "utf8");

function expectProtected(source: string, procedure: string) {
  expect(source).toMatch(new RegExp(`${procedure}:\\s*protectedProcedure`));
  expect(source).not.toMatch(new RegExp(`${procedure}:\\s*publicProcedure`));
}

describe("autorização da entrega pedagógica", () => {
  it("protege cada rota curricular que entrega livro, Pareto, blocos ou material canônico", () => {
    for (const procedure of [
      "abcBook",
      "studyBase",
      "pareto",
      "localizedPareto",
      "localizedSceneDialogue",
      "sceneCanonicalMaterial",
      "languageBlocks",
    ]) {
      expectProtected(curriculumRouter, procedure);
    }
  });

  it("protege geração, exercícios, livro e lição de cena no roteador principal", () => {
    for (const procedure of [
      "generateExercise",
      "generateLessonContent",
      "generateLessonBook",
      "getExercises",
      "sceneLesson",
    ]) {
      expectProtected(mainRouter, procedure);
    }
  });

  it("mantém a autorização da lição atrás de sessão protegida", () => {
    expectProtected(trialRouter, "authorizeLesson");
  });
});
