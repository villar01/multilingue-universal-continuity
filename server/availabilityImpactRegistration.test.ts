import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/control-center-router.ts"), "utf8");
const panelSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminControlCenter.tsx"), "utf8");

describe("registro privado de impacto de indisponibilidade", () => {
  it("limita o registro ao proprietário e bloqueia ações financeiras automáticas", () => {
    expect(routerSource).toContain("recordAvailabilityImpact: protectedProcedure");
    expect(routerSource).toContain("deriveAvailabilityGuidance");
    expect(routerSource).toContain("financial_action");
    expect(routerSource).toContain("Créditos, descontos e reembolsos exigem revisão manual");
    expect(routerSource).not.toContain("automaticFinancialAction: true");
  });

  it("mantém o painel como ferramenta de registro e revisão, não de concessão automática", () => {
    expect(panelSource).toContain("Registro de continuidade");
    expect(panelSource).toContain("Registrar impacto parcial");
    expect(panelSource).toContain("Registrar indisponibilidade");
    expect(panelSource).toContain("não concede crédito, desconto, reembolso");
  });
});
