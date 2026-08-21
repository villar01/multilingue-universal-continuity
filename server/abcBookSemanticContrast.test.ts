import { describe, expect, it } from "vitest";
import {
  SEMANTIC_CONTRAST_LEVEL_ORDER,
  getABCBookDelivery,
  orderSemanticContrastsByLevel,
  type ABCBookSemanticContrast,
} from "./curriculum/abcBookContent";

describe("contrastes semânticos do Livro SOS", () => {
  it("entrega contrastes progressivos somente pela rota curricular protegida", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(delivery.available).toBe(true);
    if (!delivery.available) return;

    expect(delivery.semanticContrasts.map((contrast) => contrast.id)).toEqual([
      "frequency-ever-always",
      "movement-bring-take",
      "description-fun-funny",
      "sound-there-their-theyre",
      "report-say-tell",
      "quantity-few-little",
      "exchange-borrow-lend",
      "phrasal-look-up-look-for",
      "false-friend-actually-currently",
    ]);
    expect(delivery.semanticContrasts.map((contrast) => contrast.level)).toEqual([
      "initial",
      "initial",
      "initial",
      "intermediate",
      "intermediate",
      "intermediate",
      "intermediate",
      "advanced",
      "advanced",
    ]);
    expect(delivery.semanticContrasts.every((contrast) => contrast.comprehensionPrompt.length > 0)).toBe(true);
  });

  it("ordena o contrato de contraste por nível sem depender da ordem de inserção", () => {
    const contrasts = [
      { id: "advanced", level: "advanced" },
      { id: "initial", level: "initial" },
      { id: "intermediate", level: "intermediate" },
    ] as ABCBookSemanticContrast[];
    const ordered = orderSemanticContrastsByLevel(contrasts);
    const ranks = ordered.map((contrast) => SEMANTIC_CONTRAST_LEVEL_ORDER[contrast.level]);

    expect(ordered.map((contrast) => contrast.id)).toEqual(["initial", "intermediate", "advanced"]);
    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1])).toBe(true);
  });
});
