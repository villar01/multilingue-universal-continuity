import { describe, expect, it } from "vitest";
import { createScheduledMaintenanceAssessment, decideMaintenancePublication } from "../shared/continuousMaintenanceContract";

describe("continuous maintenance publication contract", () => {
  it("allows publication only when TypeScript and regression evidence both pass", () => {
    const decision = decideMaintenancePublication([
      { kind: "typescript", status: "passed", evidence: "pnpm check" },
      { kind: "unit_tests", status: "passed", evidence: "pnpm test" },
    ]);

    expect(decision).toEqual({
      canPublish: true,
      state: "eligible",
      reasons: [],
    });
  });

  it("blocks publication when a required verification has not been run", () => {
    const decision = decideMaintenancePublication([
      { kind: "typescript", status: "passed", evidence: "pnpm check" },
    ]);

    expect(decision.canPublish).toBe(false);
    expect(decision.state).toBe("blocked");
    expect(decision.reasons).toContain("Verificação obrigatória não executada: unit_tests.");
  });

  it("blocks publication and preserves evidence when a required verification fails", () => {
    const decision = decideMaintenancePublication([
      { kind: "typescript", status: "failed", evidence: "TS2322 em ImmersiveScene.tsx" },
      { kind: "unit_tests", status: "passed", evidence: "pnpm test" },
    ]);

    expect(decision.canPublish).toBe(false);
    expect(decision.reasons).toContain(
      "Verificação obrigatória reprovada: typescript. Evidência: TS2322 em ImmersiveScene.tsx",
    );
  });

  it("keeps scheduled diagnostics blocked until a candidate change has real validation evidence", () => {
    const assessment = createScheduledMaintenanceAssessment();

    expect(assessment.decision).toMatchObject({
      canPublish: false,
      state: "blocked",
    });
    expect(assessment.verifications).toEqual([
      expect.objectContaining({ kind: "typescript", status: "not_run" }),
      expect.objectContaining({ kind: "unit_tests", status: "not_run" }),
    ]);
  });
});
