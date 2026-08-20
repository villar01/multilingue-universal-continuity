import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = readFileSync(resolve(process.cwd(), "docs/permanent-control-manifest.md"), "utf8");

describe("permanent control manifesto", () => {
  it("preserves curricular, teacher, audio and continuity controls", () => {
    expect(manifest).toContain("Visitantes não recebem currículo");
    expect(manifest).toContain("James usa voz masculina en-US");
    expect(manifest).toContain("Ricardo permanece com boca estática");
    expect(manifest).toContain("Cada palavra salva precisa tocar no clique explícito");
    expect(manifest).toContain("Uma falha local não pode derrubar a aplicação inteira");
  });

  it("preserves commercial approval and performance rules", () => {
    expect(manifest).toContain("Não manter processos duplicados");
    expect(manifest).toContain("não publica campanha");
    expect(manifest).toContain("aprovação explícita");
  });
});
