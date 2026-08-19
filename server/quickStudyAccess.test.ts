import { describe, expect, it } from "vitest";
import { getQuickStudyHref } from "../client/src/lib/quickStudyAccess";

describe("Livro ABC de Socorro global", () => {
  it("preserva a página de estudo e seus parâmetros como destino de retorno", () => {
    expect(getQuickStudyHref("/structured-lesson?teacher=james")).toBe("/abc-book?returnTo=%2Fstructured-lesson%3Fteacher%3Djames");
  });

  it("permite consulta no curso e não duplica o atalho no livro, na cena ou em rotas administrativas", () => {
    expect(getQuickStudyHref("/base-de-estudos")).toBe("/abc-book?returnTo=%2Fbase-de-estudos");
    expect(getQuickStudyHref("/abc-book")).toBeNull();
    expect(getQuickStudyHref("/immersive-scene")).toBeNull();
    expect(getQuickStudyHref("/admin/updates")).toBeNull();
  });

  it("oferece o livro em outros blocos de aprendizagem", () => {
    expect(getQuickStudyHref("/word-game?mode=daily")).toBe("/abc-book?returnTo=%2Fword-game%3Fmode%3Ddaily");
    expect(getQuickStudyHref("/free-talk")).toBe("/abc-book?returnTo=%2Ffree-talk");
  });
});
