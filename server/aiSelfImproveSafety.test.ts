import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"), "utf8");

describe("autoaperfeiçoamento agendado seguro", () => {
  it("bloqueia a análise quando o backup verificável não está disponível", () => {
    expect(source).toContain('if (backupVerification.status !== "passed")');
    expect(source).toContain("Manutenção bloqueada: não há backup recente e verificável.");
    expect(source).toContain("Nenhuma alteração foi aplicada ao aplicativo.");
  });

  it("gera somente propostas registradas e não executa publicação ou alteração de código", () => {
    expect(source).toContain("O diagnóstico é sempre uma proposta bloqueada");
    expect(source).toContain("nunca altera produção por conta própria");
    expect(source).toContain('INSERT INTO ai_insights');
    expect(source).toContain('INSERT INTO maintenance_runs');
    expect(source).not.toMatch(/\b(exec|spawn|fork|writeFile|rmSync|git\s|publish)\b/);
  });

  it("mantém o diagnóstico local e sem fallback remoto", () => {
    expect(source).toContain('preferredProvider: "ollama"');
    expect(source).toContain("allowRemoteFallback: false");
    expect(source).toContain("Nunca sugira correções automáticas para: autenticação, permissões, dados de usuários, pagamentos, chaves de API.");
  });
});
