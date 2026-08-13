import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  ACTIVE_LANGUAGE_COUNT,
  AVAILABLE_LANGUAGES,
  COMING_SOON_LANGUAGE_COUNT,
  COMING_SOON_LANGUAGES,
  LANGUAGES_57,
  TOTAL_LANGUAGES,
} from "../client/src/lib/languages";

const selector = readFileSync(new URL("../client/src/components/LanguageSelector.tsx", import.meta.url), "utf8");
const tour = readFileSync(new URL("../client/src/components/TourSpotlight.tsx", import.meta.url), "utf8");
const share = readFileSync(new URL("../client/src/components/SocialShare.tsx", import.meta.url), "utf8");
const arMode = readFileSync(new URL("../client/src/pages/ARMode.tsx", import.meta.url), "utf8");
const arTeacher = readFileSync(new URL("../client/src/pages/ARTeacher.tsx", import.meta.url), "utf8");

describe("catálogo e disponibilidade de idiomas", () => {
  it("declara exatamente 143 idiomas sem códigos duplicados e separa os estados de disponibilidade", () => {
    expect(TOTAL_LANGUAGES).toBe(143);
    expect(LANGUAGES_57).toHaveLength(143);
    expect(ACTIVE_LANGUAGE_COUNT).toBe(58);
    expect(COMING_SOON_LANGUAGE_COUNT).toBe(85);
    expect(AVAILABLE_LANGUAGES.every((language) => language.available)).toBe(true);
    expect(COMING_SOON_LANGUAGES.every((language) => !language.available)).toBe(true);
    expect(new Set(LANGUAGES_57.map((language) => language.code)).size).toBe(143);
  });

  it("não permite selecionar idioma em preparação e informa o estado honestamente", () => {
    expect(selector).toContain("disabled={!l.available}");
    expect(selector).toContain('"Em preparação"');
    expect(selector).toContain("Catálogo de {TOTAL_LANGUAGES} idiomas");
    expect(tour).not.toContain("Aprenda 57 idiomas");
    expect(share).not.toContain("Aprenda 69 idiomas");
    expect(arMode).toContain("ACTIVE_LANGUAGE_LABEL");
    expect(arMode).toContain("CATALOG_LANGUAGE_LABEL");
    expect(`${arMode}\n${arTeacher}`).not.toMatch(/(?:57|69|94) idiomas/);
  });
});
