import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("escopo de IA local hospedada", () => {
  it("distingue status do servidor de uma futura integração cliente-local", () => {
    const nativePage = source("client/src/pages/IANativa.tsx");
    const home = source("client/src/pages/Home.tsx");
    const dashboard = source("client/src/pages/DashboardReal.tsx");

    expect(nativePage).toContain("instalação de Ollama no computador do aluno não é detectada automaticamente");
    expect(nativePage).toContain("integração cliente-local");
    expect(home).toContain("ambientes compatíveis");
    expect(dashboard).toContain("integração cliente-local explícita");
    expect(nativePage).not.toContain("O app detecta automaticamente sua IA local");
    expect(nativePage).not.toContain("animação lip-sync perfeita");
  });
});
