import { describe, expect, it } from "vitest";
import { getJamesSceneHref, getQuickStudyHref, getQuickTeacherHref } from "../client/src/components/QuickStudyAccess";

describe("Consulta Rápida e Total global", () => {
  it("preserva a página de estudo como destino de retorno", () => {
    expect(getQuickStudyHref("/structured-lesson?teacher=james")).toBe("/base-de-estudos?returnTo=%2Fstructured-lesson");
  });

  it("não duplica o atalho na própria consulta, na cena ou em rotas administrativas", () => {
    expect(getQuickStudyHref("/base-de-estudos")).toBeNull();
    expect(getQuickStudyHref("/immersive-scene")).toBeNull();
    expect(getQuickStudyHref("/admin/updates")).toBeNull();
  });

  it("leva ao professor e preserva o retorno ao setor de estudo", () => {
    expect(getQuickTeacherHref("/word-game?mode=daily")).toBe("/free-talk?returnTo=%2Fword-game");
    expect(getQuickTeacherHref("/free-talk")).toBeNull();
    expect(getQuickTeacherHref("/immersive-scene")).toBeNull();
  });

  it("mantém a Cena James disponível por atalho em todo o aplicativo, exceto dentro da própria cena", () => {
    expect(getJamesSceneHref("/dashboard")).toBe("/immersive-scene?scene=beach");
    expect(getJamesSceneHref("/structured-lesson?teacher=james")).toBe("/immersive-scene?scene=beach");
    expect(getJamesSceneHref("/immersive-scene?scene=beach")).toBeNull();
  });
});
