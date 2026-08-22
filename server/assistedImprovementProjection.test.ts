import { describe, expect, it } from "vitest";
import { projectAssistedImprovement } from "./assistedImprovementProjection";

describe("projeção privada de aperfeiçoamento assistido", () => {
  it("expõe somente contagens agregadas e mantém a execução bloqueada", () => {
    const projection = projectAssistedImprovement({
      id: 7,
      title: "Diagnóstico diário",
      severity: "high",
      createdAt: new Date("2026-08-22T00:00:00.000Z"),
      recommendations: {
        summary: "Revisar uma tendência de falhas.",
        evidence: [{ eventType: "error", occurrences: 4 }],
        proposals: [{ action: "Revisar contrato" }],
        securityAlertCount: 1,
      },
    });

    expect(projection).toMatchObject({
      evidenceCount: 1,
      proposalCount: 1,
      securityAlertCount: 1,
      requiresOwnerReview: true,
      executionState: "blocked_for_owner_review",
    });
    expect(JSON.stringify(projection)).not.toContain("eventType");
    expect(JSON.stringify(projection)).not.toContain("action");
  });
});
