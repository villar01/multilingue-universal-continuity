import { describe, expect, it } from "vitest";
import { deriveAvailabilityGuidance } from "./serviceAvailabilityPolicy";

describe("política de indisponibilidade", () => {
  it("protege a comunicação ao cliente sem expor detalhes operacionais", () => {
    const guidance = deriveAvailabilityGuidance({
      state: "outage",
      startedAt: 1,
      affectedCapabilities: ["immersive_scene", "audio"],
    });

    expect(guidance.customerMessage).toContain("progresso permanece protegido");
    expect(guidance.customerMessage).not.toMatch(/erro|servidor|banco|rota|ip/i);
    expect(guidance.impactRecord).toEqual({
      scope: ["immersive_scene", "audio"],
      startedAt: 1,
      requiresOwnerReview: true,
    });
  });

  it("nunca automatiza crédito, desconto, reembolso ou condição comercial", () => {
    const guidance = deriveAvailabilityGuidance({
      state: "degraded",
      startedAt: 2,
      affectedCapabilities: ["lesson"],
    });

    expect(guidance.compensation).toEqual({
      status: "owner_review_required",
      automaticFinancialAction: false,
    });
    expect(guidance.recommendedRecovery.join(" ")).toMatch(/alternativas|recuperação/i);
  });

  it("mantém a operação preventiva sem acionar compensação", () => {
    const guidance = deriveAvailabilityGuidance({
      state: "operational",
      startedAt: 3,
      affectedCapabilities: [],
    });

    expect(guidance.compensation.status).toBe("not_applicable");
    expect(guidance.compensation.automaticFinancialAction).toBe(false);
  });
});
