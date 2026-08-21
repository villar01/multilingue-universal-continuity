import { describe, expect, it } from "vitest";
import {
  SEMANTIC_CONTRAST_LEVEL_ORDER,
  getABCBookDelivery,
  orderSemanticContrastsByLevel,
  type ABCBookSemanticContrast,
} from "./curriculum/abcBookContent";

describe("contrastes semânticos do Livro SOS", () => {
  it("entrega os 29 contrastes contextuais progressivos somente pela rota curricular protegida", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(delivery.available).toBe(true);
    if (!delivery.available) return;

    expect(delivery.semanticContrasts.map((contrast) => contrast.id)).toEqual([
      "frequency-ever-always",
      "movement-bring-take",
      "description-fun-funny",
      "phrasal-turn-on-turn-off",
      "sound-wear-where",
      "perception-listen-hear",
      "screen-see-watch",
      "place-go-visit",
      "sound-there-their-theyre",
      "report-say-tell",
      "quantity-few-little",
      "exchange-borrow-lend",
      "sound-hear-here",
      "phrasal-get-on-get-off",
      "health-sick-ill",
      "quantity-some-any",
      "nature-forest-woods",
      "mountain-climb-hike",
      "farm-field-farm",
      "port-ship-boat",
      "spa-relax-rest",
      "family-airport-pick-up-drop-off",
      "phrasal-look-up-look-for",
      "false-friend-actually-currently",
      "phrasal-work-out-work-on",
      "travel-trip-journey",
      "desert-alone-lonely",
      "history-historic-historical",
      "garden-grow-raise",
    ]);
    expect(delivery.semanticContrasts).toHaveLength(29);
    expect(delivery.semanticContrasts.every((contrast) => contrast.comprehensionPrompt.length > 0 && contrast.paretoPrompt.length > 0)).toBe(true);
    const ranks = delivery.semanticContrasts.map((contrast) => SEMANTIC_CONTRAST_LEVEL_ORDER[contrast.level]);
    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1])).toBe(true);
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
