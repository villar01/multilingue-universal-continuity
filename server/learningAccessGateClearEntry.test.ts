import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync("client/src/components/LearningAccessGate.tsx", "utf8");

describe("entrada clara para conteúdo protegido", () => {
  it("não mantém visitante sem sessão em verificação escura indefinida", () => {
    expect(gate).toContain("authWaitExceeded");
    expect(gate).toContain("Preparando sua entrada segura…");
    expect(gate).toContain("if (!isAuthenticated || authWaitExceeded)");
    expect(gate).toContain("Criar conta ou entrar");
    expect(gate).not.toContain("Verificando acesso protegido…");
  });
});
