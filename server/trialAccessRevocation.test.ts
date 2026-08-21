import { describe, expect, it } from "vitest";
import { isTrialRevoked } from "./trial-access-policy";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/trial-access-router.ts"), "utf8");
const gateSource = readFileSync(resolve(process.cwd(), "client/src/components/LearningAccessGate.tsx"), "utf8");

describe("revogação do acesso de avaliação", () => {
  it("reconhece somente o estado persistente de revogação", () => {
    expect(isTrialRevoked("revoked")).toBe(true);
    expect(isTrialRevoked("active")).toBe(false);
    expect(isTrialRevoked("expired")).toBe(false);
    expect(isTrialRevoked(null)).toBe(false);
  });

  it("bloqueia entregas de avaliação e oferece uma revogação persistente no aplicativo", () => {
    expect(routerSource).toContain('message: "O acesso de avaliação desta conta foi encerrado."');
    expect(routerSource).toContain("revoke: protectedProcedure");
    expect(routerSource).toContain('status: "revoked"');
    expect(routerSource).toContain("revokedAt: now");
  });

  it("não apresenta a revogação de avaliação como revogação da sessão OAuth", () => {
    const policySource = readFileSync(resolve(process.cwd(), "server/trial-access-policy.ts"), "utf8");
    expect(policySource).toContain("não a sessão OAuth do provedor");
  });

  it("mostra no portão pedagógico o encerramento voluntário, sem confundi-lo com o limite de lições", () => {
    expect(gateSource).toContain('trialState === "revoked"');
    expect(gateSource).toContain("Acesso de avaliação encerrado");
    expect(gateSource).toContain('"revoked" in result && result.revoked');
  });
});
