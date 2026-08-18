import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("comunicação pública de IA local", () => {
  it("não promete operação offline completa na chamada principal", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(source).toContain("Configuração opcional de provedores locais");
    expect(source).not.toContain("Professores virtuais · Operação offline");
  });
});
