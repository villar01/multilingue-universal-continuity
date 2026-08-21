import { describe, expect, it } from "vitest";
import { INITIAL_COMMERCIAL_TARGET_BLOCKS } from "../shared/commercialLanguageBlocks";
import { getCommercialLanguageA1Units } from "./curriculum/commercialLanguageUnits";

describe("unidades autorais A1 por idioma comercial", () => {
  it("entrega duas unidades próprias para cada um dos cinco blocos iniciais", () => {
    for (const block of INITIAL_COMMERCIAL_TARGET_BLOCKS) {
      const units = getCommercialLanguageA1Units(block.targetLocale);
      expect(units).toHaveLength(2);
      expect(units?.every((unit) => unit.targetBlockId === block.id && unit.targetLocale === block.targetLocale)).toBe(true);
    }
  });

  it("mantém o ciclo Pareto, diálogo, escrita, pergunta, professor e revisão em cada unidade", () => {
    const allUnits = INITIAL_COMMERCIAL_TARGET_BLOCKS.flatMap((block) => getCommercialLanguageA1Units(block.targetLocale) ?? []);
    for (const unit of allUnits) {
      expect(unit.paretoVocabulary.length).toBeGreaterThanOrEqual(3);
      expect(unit.dialogue).toHaveLength(2);
      expect(unit.teacherCue).not.toHaveLength(0);
      expect(unit.writingPrompt).not.toHaveLength(0);
      expect(unit.question.expectedAnswer).not.toHaveLength(0);
      expect(unit.reviewAnchor).not.toHaveLength(0);
    }
  });

  it("não reutiliza unidades de um idioma como fallback de outro", () => {
    expect(getCommercialLanguageA1Units("ja-JP")).toBeNull();
    expect(new Set(INITIAL_COMMERCIAL_TARGET_BLOCKS.flatMap((block) =>
      (getCommercialLanguageA1Units(block.targetLocale) ?? []).map((unit) => unit.id),
    )).size).toBe(10);
  });
});
