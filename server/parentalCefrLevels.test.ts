import { describe, expect, it } from "vitest";
import { normalizeParentalCefrLevels } from "../shared/parental-cefr";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("níveis CEFR parentais", () => {
  it("expande agrupamentos legados sem perder a ordem da progressão", () => {
    expect(normalizeParentalCefrLevels(["beginner"])).toEqual(["A1", "A2"]);
    expect(normalizeParentalCefrLevels(["intermediate", "advanced"])).toEqual(["B1", "B2", "C1", "C2"]);
  });

  it("preserva níveis explícitos, remove duplicatas e usa A1 como limite seguro", () => {
    expect(normalizeParentalCefrLevels(["C1", "A2", "C1"])).toEqual(["A2", "C1"]);
    expect(normalizeParentalCefrLevels(["unknown"])).toEqual(["A1"]);
  });

  it("impede que o painel volte a apresentar apenas três rótulos legados", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ParentalControlPanel.tsx"), "utf8");
    expect(source).toContain("PARENTAL_CEFR_LEVELS.map");
    expect(source).not.toContain("['beginner', 'intermediate', 'advanced'].map");
  });
});
