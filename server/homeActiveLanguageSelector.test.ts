import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACTIVE_LANGUAGE_COUNT, AVAILABLE_LANGUAGES } from "../client/src/lib/languages";

describe("seletor inicial de idiomas ativos", () => {
  it("deriva as escolhas do catálogo canônico disponível", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(ACTIVE_LANGUAGE_COUNT).toBe(58);
    expect(AVAILABLE_LANGUAGES).toHaveLength(58);
    expect(source).toContain('import { AVAILABLE_LANGUAGES } from "@/lib/languages"');
    expect(source).toContain("const POPULAR_LANGS = AVAILABLE_LANGUAGES.map");
  });

  it("não oferece idiomas em preparação como opções iniciais", () => {
    expect(AVAILABLE_LANGUAGES.every((language) => language.available)).toBe(true);
  });
});
