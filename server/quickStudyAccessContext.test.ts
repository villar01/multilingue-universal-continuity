import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getABCBookHref } from "../client/src/components/FlyingSOSBook";
import { getQuickStudyHref } from "../client/src/components/QuickStudyAccess";
import { getPedagogicalShortcutHrefs, shouldShowPedagogicalQuickAccess } from "../client/src/components/PedagogicalQuickAccess";

describe("Socorro SOS com retorno contextual", () => {
  it("preserva unidade e item curricular ao abrir o Livro ABC", () => {
    expect(getQuickStudyHref("/structured-lesson?unit=2&entry=a1-where-is"))
      .toBe("/abc-book?returnTo=%2Fstructured-lesson%3Funit%3D2%26entry%3Da1-where-is");
  });

  it("preserva todos os parâmetros da cena no acesso voluntário", () => {
    expect(getABCBookHref("/immersive-scene?scene=beach&mode=quiz"))
      .toBe("/abc-book?returnTo=%2Fimmersive-scene%3Fscene%3Dbeach%26mode%3Dquiz");
  });

  it("não mostra o atalho global dentro do próprio livro, da cena ou da lição", () => {
    expect(getQuickStudyHref("/abc-book")).toBeNull();
    expect(getQuickStudyHref("/immersive-scene?scene=beach")).toBeNull();
    expect(getQuickStudyHref("/lesson/390001")).toBeNull();
  });

  it("agrupa atalhos de entender, memorizar, praticar e aplicar com retorno contextual", () => {
    const hrefs = getPedagogicalShortcutHrefs("/lesson/390001?unit=2");
    expect(hrefs.understand).toBe("/abc-book?returnTo=%2Flesson%2F390001%3Funit%3D2");
    expect(hrefs.memorize).toBe("/pareto-1000?returnTo=%2Flesson%2F390001%3Funit%3D2");
    expect(hrefs.practice).toBe("/base-de-estudos?returnTo=%2Flesson%2F390001%3Funit%3D2");
    expect(hrefs.apply).toBe("/immersive-scene?scene=beach&returnTo=%2Flesson%2F390001%3Funit%3D2");
    expect(shouldShowPedagogicalQuickAccess("/immersive-scene?scene=beach")).toBe(true);
    expect(shouldShowPedagogicalQuickAccess("/abc-book")).toBe(false);
  });

  it("registra a rota do Livro ABC e coloca SOS em cena e lição", () => {
    const appSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/App.tsx"), "utf8");
    const sceneSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"), "utf8");
    const lessonSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/Lesson.tsx"), "utf8");
    const bookSource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/ABCBook.tsx"), "utf8");

    expect(appSource).toContain('path="/abc-book"');
    expect(sceneSource).toContain("FlyingSOSBook");
    expect(lessonSource).toContain("FlyingSOSBook");
    expect(bookSource).toContain("getSafeReturnTo");
    expect(bookSource).toContain("pareto-1000?returnTo=");
    expect(appSource).toContain("QuickStudyAccess");
  });
});
