import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");

describe("trilhas comerciais de idioma no painel", () => {
  it("separa as seis trilhas comerciais iniciais do catálogo de idiomas", () => {
    expect(source).toContain("seis trilhas comerciais iniciais");
    expect(source).toContain("6 trilhas comerciais iniciais");
    expect(source).toContain("Inglês A1 como piloto curricular");
    expect(source).not.toContain("58 idiomas ativos agora");
    expect(source).not.toContain("+{ACTIVE_LANGUAGE_COUNT} idiomas ativos");
  });
});
