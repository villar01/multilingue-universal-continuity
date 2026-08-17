import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getQuickLessonsHref, getQuickParetoHref, getQuickSceneHref, getQuickStudyHref, getQuickTeacherHref } from "../client/src/components/QuickStudyAccess";

describe("atalhos globais com retorno contextual", () => {
  it("preserva unidade e item curricular ao abrir a Base de Estudos", () => {
    expect(getQuickStudyHref("/structured-lesson?unit=2&entry=a1-where-is"))
      .toBe("/base-de-estudos?returnTo=%2Fstructured-lesson%3Funit%3D2%26entry%3Da1-where-is");
  });

  it("preserva todos os parâmetros ao abrir o professor", () => {
    expect(getQuickTeacherHref("/lesson/390001?mode=practice&unit=2"))
      .toBe("/free-talk?returnTo=%2Flesson%2F390001%3Fmode%3Dpractice%26unit%3D2");
  });

  it("oferece memorização, lições e cena com o mesmo retorno contextual", () => {
    const origin = "/lesson/390001?mode=practice&unit=2";
    const encoded = "%2Flesson%2F390001%3Fmode%3Dpractice%26unit%3D2";
    expect(getQuickParetoHref(origin)).toBe(`/pareto-1000?returnTo=${encoded}`);
    expect(getQuickLessonsHref(origin)).toBe(`/lessons-hub?returnTo=${encoded}`);
    expect(getQuickSceneHref(origin)).toBe(`/immersive-scene?returnTo=${encoded}`);
  });

  it("expõe grupos por objetivo de aprendizagem em vez de uma lista solta de atalhos", () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/components/QuickStudyAccess.tsx"), "utf8");
    expect(source).toContain('aria-label="Caminhos de aprendizagem"');
    expect(source).toContain(">Entender<");
    expect(source).toContain(">Memorizar<");
    expect(source).toContain(">Praticar<");
    expect(source).toContain(">Aplicar<");
  });
});
