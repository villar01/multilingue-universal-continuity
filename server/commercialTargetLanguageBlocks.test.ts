import { describe, expect, it } from "vitest";
import {
  INITIAL_COMMERCIAL_TARGET_BLOCKS,
  getInitialCommercialTargetBlock,
} from "../shared/commercialLanguageBlocks";

describe("contratos de blocos comerciais por idioma-alvo", () => {
  it("define cinco blocos alvo independentes com locale canônico", () => {
    expect(INITIAL_COMMERCIAL_TARGET_BLOCKS.map((block) => block.id)).toEqual([
      "english", "spanish", "french", "italian", "german",
    ]);
    expect(new Set(INITIAL_COMMERCIAL_TARGET_BLOCKS.map((block) => block.targetLocale)).size).toBe(5);
  });

  it("mantém cada bloco no servidor e sem fallback curricular entre idiomas", () => {
    expect(INITIAL_COMMERCIAL_TARGET_BLOCKS.every(
      (block) => block.contentBoundary === "server-only-target-specific",
    )).toBe(true);
    expect(getInitialCommercialTargetBlock("en-GB")?.id).toBe("english");
    expect(getInitialCommercialTargetBlock("es-MX")?.id).toBe("spanish");
    expect(getInitialCommercialTargetBlock("fr-CA")?.id).toBe("french");
    expect(getInitialCommercialTargetBlock("it-IT")?.id).toBe("italian");
    expect(getInitialCommercialTargetBlock("de-AT")?.id).toBe("german");
  });

  it("declara somente o piloto inglês A1 como conteúdo de bloco disponível", () => {
    const english = getInitialCommercialTargetBlock("en-US");
    expect(english).toMatchObject({ status: "pilot", availableLevels: ["A1"] });
    expect(INITIAL_COMMERCIAL_TARGET_BLOCKS.filter((block) => block.id !== "english")
      .every((block) => block.status === "preparing" && block.availableLevels.length === 0)).toBe(true);
  });
});
