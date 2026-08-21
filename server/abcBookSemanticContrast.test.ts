import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("contrastes semânticos do Livro SOS", () => {
  it("entrega contrastes progressivos somente pela rota curricular protegida", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(delivery.available).toBe(true);
    if (!delivery.available) return;

    expect(delivery.semanticContrasts.map((contrast) => contrast.id)).toEqual([
      "frequency-ever-always",
      "sound-there-their-theyre",
      "report-say-tell",
      "phrasal-look-up-look-for",
    ]);
    expect(delivery.semanticContrasts.map((contrast) => contrast.level)).toEqual([
      "initial",
      "intermediate",
      "intermediate",
      "advanced",
    ]);
    expect(delivery.semanticContrasts.every((contrast) => contrast.comprehensionPrompt.length > 0)).toBe(true);
  });
});
