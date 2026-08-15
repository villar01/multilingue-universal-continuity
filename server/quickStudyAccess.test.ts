import { describe, expect, it } from "vitest";
import { getQuickStudyHref } from "../client/src/components/QuickStudyAccess";

describe("Consulta Rápida e Total global", () => {
  it("preserva a página de estudo como destino de retorno", () => {
    expect(getQuickStudyHref("/structured-lesson?teacher=james")).toBe("/base-de-estudos?returnTo=%2Fstructured-lesson");
  });

  it("não duplica o atalho na própria consulta, na cena ou em rotas administrativas", () => {
    expect(getQuickStudyHref("/base-de-estudos")).toBeNull();
    expect(getQuickStudyHref("/immersive-scene")).toBeNull();
    expect(getQuickStudyHref("/admin/updates")).toBeNull();
  });
});
