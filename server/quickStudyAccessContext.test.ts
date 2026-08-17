import { describe, expect, it } from "vitest";
import { getQuickStudyHref, getQuickTeacherHref } from "../client/src/components/QuickStudyAccess";

describe("atalhos globais com retorno contextual", () => {
  it("preserva unidade e item curricular ao abrir a Base de Estudos", () => {
    expect(getQuickStudyHref("/structured-lesson?unit=2&entry=a1-where-is"))
      .toBe("/base-de-estudos?returnTo=%2Fstructured-lesson%3Funit%3D2%26entry%3Da1-where-is");
  });

  it("preserva todos os parâmetros ao abrir o professor", () => {
    expect(getQuickTeacherHref("/lesson/390001?mode=practice&unit=2"))
      .toBe("/free-talk?returnTo=%2Flesson%2F390001%3Fmode%3Dpractice%26unit%3D2");
  });
});
