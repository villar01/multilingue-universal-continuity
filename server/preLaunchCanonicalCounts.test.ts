import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACTIVE_LANGUAGE_COUNT, COMING_SOON_LANGUAGE_COUNT, TOTAL_LANGUAGES } from "../client/src/lib/languages";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/PreLaunch.tsx"), "utf8");

describe("contagens canônicas da página de pré-lançamento", () => {
  it("deriva a disponibilidade do catálogo compartilhado", () => {
    expect(TOTAL_LANGUAGES).toBe(143);
    expect(ACTIVE_LANGUAGE_COUNT).toBe(58);
    expect(COMING_SOON_LANGUAGE_COUNT).toBe(85);
    expect(source).toContain("ACTIVE_LANGUAGE_COUNT, COMING_SOON_LANGUAGE_COUNT, TOTAL_LANGUAGES");
    expect(source).toContain("{TOTAL_LANGUAGES} idiomas no catálogo");
    expect(source).toContain("{ACTIVE_LANGUAGE_COUNT} disponíveis agora e {COMING_SOON_LANGUAGE_COUNT} em preparação");
  });

  it("não mantém os números contraditórios anteriores", () => {
    expect(source).not.toContain("em 54 idiomas");
    expect(source).not.toContain(">54 Idiomas<");
    expect(source).not.toContain("69 idiomas — mais do que qualquer outro app do mundo");
  });
});
