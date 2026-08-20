import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("contagem de idiomas no Desafio Diário", () => {
  it("deriva a disponibilidade das constantes canônicas", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client/src/pages/DailyChallenge.tsx"), "utf8");
    expect(source).toContain("ACTIVE_LANGUAGE_COUNT");
    expect(source).toContain("TOTAL_LANGUAGES");
    expect(source).toContain("idiomas ativos agora");
    expect(source).not.toContain("69 idiomas");
  });
});
