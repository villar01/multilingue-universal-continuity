import { describe, expect, it } from "vitest";
import { AVAILABLE_LANGUAGES } from "../client/src/lib/languages";
import { getComplianceForLanguage, isContentAllowedInCountry } from "../client/src/lib/country-compliance";

describe("cobertura universal de conformidade", () => {
  it("retorna um conjunto de regras para todos os idiomas disponíveis", () => {
    expect(AVAILABLE_LANGUAGES.length).toBeGreaterThanOrEqual(57);

    for (const language of AVAILABLE_LANGUAGES) {
      const compliance = getComplianceForLanguage(language.code);
      expect(compliance).toBeDefined();
      expect(compliance.languageCodes).toContain(language.code);
    }
  });

  it("bloqueia uma violação universal mesmo em um idioma sem regra específica", () => {
    const result = isContentAllowedInCountry("child abuse", "eo");

    expect(result.allowed).toBe(false);
    expect(result.rule?.type).toBe("CHILD_ABUSE");
  });
});
