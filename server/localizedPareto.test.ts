import { describe, expect, it } from "vitest";
import { PARETO_VOCAB } from "./curriculum/paretoContent";
import {
  INITIAL_COMMERCIAL_LANGUAGE_CODES,
  isInitialCommercialLanguageCode,
  resolveDirectParetoWords,
} from "./curriculum/localizedPareto";

describe("Pareto localizado por dupla universal de idiomas", () => {
  it("define as seis línguas de cobertura comercial inicial sem limitar pares futuros", () => {
    expect(INITIAL_COMMERCIAL_LANGUAGE_CODES).toEqual(["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"]);
    expect(isInitialCommercialLanguageCode("ja-JP")).toBe(false);
  });

  it("reutiliza somente o conteúdo canônico revisado para os pares direto inglês-português", () => {
    const localized = resolveDirectParetoWords(PARETO_VOCAB.slice(0, 2), "en-US", "pt-BR");
    expect(localized).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "g001", targetWord: "Hello", nativeTranslation: "Olá" }),
    ]));
  });

  it("usa a grafia britânica revisada apenas quando a dupla a solicita e informa a alternativa no inglês americano", () => {
    const goodbye = PARETO_VOCAB.find((word) => word.enUS === "Goodbye" && word.enGB === "Cheerio");
    expect(goodbye).toBeDefined();
    const american = resolveDirectParetoWords([goodbye!], "en-US", "pt-BR");
    const british = resolveDirectParetoWords([goodbye!], "en-GB", "pt-BR");
    expect(american?.[0]).toMatchObject({ targetWord: "Goodbye", regionalVariant: { locale: "en-GB", word: "Cheerio" } });
    expect(british?.[0]).toMatchObject({ targetWord: "Cheerio" });
    expect(british?.[0].regionalVariant).toBeUndefined();
  });

  it("aceita qualquer código no contrato e nunca devolve outro idioma como fallback direto", () => {
    expect(resolveDirectParetoWords(PARETO_VOCAB.slice(0, 1), "es-ES", "ja-JP")).toBeNull();
    expect(resolveDirectParetoWords(PARETO_VOCAB.slice(0, 1), "fr-FR", "de-DE")).toBeNull();
  });
});
