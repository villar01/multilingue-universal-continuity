import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("comunicação pública prudente de proteção", () => {
  it("explica benefícios sem divulgar detalhes de mecanismos defensivos", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(home).toContain("Privacidade, acesso protegido e continuidade");
    expect(home).toContain("Verificações preventivas ajudam");
    expect(home).toContain('href="/terms"');
    expect(home).not.toMatch(/rate.?limit|sql.?injection|xss|scanner|firewall/i);
  });
});
