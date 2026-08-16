import { describe, expect, it } from "vitest";
import {
  getCommercialLanguageBlock,
  INITIAL_COMMERCIAL_LANGUAGE_CODES,
  isInitialCommercialTargetLanguage,
} from "../shared/commercialLanguageBlocks";
import { localizeParetoWords } from "./curriculum/localizedPareto";

describe("blocos comerciais de idioma", () => {
  it("mantém os seis idiomas iniciais como oferta comercial por idioma-alvo", () => {
    expect(INITIAL_COMMERCIAL_LANGUAGE_CODES).toEqual(["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"]);
    expect(isInitialCommercialTargetLanguage("en-GB")).toBe(true);
    expect(isInitialCommercialTargetLanguage("es-MX")).toBe(true);
    expect(isInitialCommercialTargetLanguage("ja-JP")).toBe(false);
  });

  it("mantém idiomas futuros em bloco planejado sem substituir conteúdo de uma língua lançada", async () => {
    expect(getCommercialLanguageBlock("fr-FR")).toBe("initial");
    expect(getCommercialLanguageBlock("ja-JP")).toBe("future");

    const result = await localizeParetoWords({
      words: [],
      targetLanguage: "ja-JP",
      nativeLanguage: "pt-BR",
      userId: 1,
    });
    expect(result).toEqual({ status: "planned_language_block", items: [] });
  });
});
