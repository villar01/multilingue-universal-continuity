import { describe, expect, it } from "vitest";
import { COMMERCIAL_RHETORICAL_FIGURE_PAIRS, getCommercialRhetoricalFigures } from "./curriculum/commercialRhetoricalFigures";

describe("catálogo comercial protegido de figuras de linguagem", () => {
  it("mantém exemplos próprios para cada par comercial aprovado", () => {
    expect(COMMERCIAL_RHETORICAL_FIGURE_PAIRS).toEqual(["pt-es", "pt-fr", "pt-it", "pt-de", "en-pt"]);
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "pt-BR", targetLanguage: "es-ES" })?.examples).toHaveLength(5);
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "pt-BR", targetLanguage: "fr-FR" })?.examples).toHaveLength(5);
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "pt-BR", targetLanguage: "it-IT" })?.examples).toHaveLength(5);
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "pt-BR", targetLanguage: "de-DE" })?.examples).toHaveLength(5);
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "en-US", targetLanguage: "pt-BR" })?.examples).toHaveLength(5);
  });

  it("não entrega exemplos para pares ainda não autorizados", () => {
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "pt-BR", targetLanguage: "ja-JP" })).toBeNull();
    expect(getCommercialRhetoricalFigures({ nativeLanguage: "es-ES", targetLanguage: "en-US" })).toBeNull();
  });
});
