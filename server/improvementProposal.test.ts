import { describe, expect, it } from "vitest";
import { createAssistedImprovementReport } from "./improvementProposal";

describe("propostas de aperfeiçoamento assistido", () => {
  it("agrega evidências e bloqueia toda proposta para revisão do proprietário", () => {
    const report = createAssistedImprovementReport({
      topIssue: "Falha de reprodução em uma atividade.",
      recommendations: [{ action: "Revisar o contrato de áudio.", priority: "high", estimatedImpact: "Menos falhas" }],
      proposedActions: [],
      securityAlerts: ["Sinal privado"],
      telemetryRows: [{ event_type: "error", count: 4 }, { event_type: "error", count: 2 }],
      totalErrors: 6,
    });

    expect(report.decision).toBe("blocked_for_owner_review");
    expect(report.proposals[0]).toMatchObject({ requiresOwnerApproval: true, executionState: "blocked_for_owner_review" });
    expect(report.evidence).toEqual([{ eventType: "error", occurrences: 6 }]);
    expect(report.securityAlertCount).toBe(1);
  });

  it("não preserva contexto bruto ou permissões de execução nas propostas", () => {
    const report = createAssistedImprovementReport({ telemetryRows: [], totalErrors: 0 });
    expect(report.proposals).toEqual([]);
    expect(JSON.stringify(report)).not.toContain("context");
    expect(JSON.stringify(report)).not.toContain("execute");
  });
});
