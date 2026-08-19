import { describe, expect, it } from "vitest";
import { assessBackupForMaintenance, createScheduledMaintenanceAssessment, decideMaintenancePublication } from "../shared/continuousMaintenanceContract";

const validBackup = () => assessBackupForMaintenance({
  status: "completed",
  checksum: "sha256",
  completedAtMs: Date.now(),
});

describe("continuous maintenance publication contract", () => {
  it("allows publication only when backup, TypeScript and regression evidence all pass", () => {
    const decision = decideMaintenancePublication([
      validBackup(),
      { kind: "typescript", status: "passed", evidence: "pnpm check" },
      { kind: "unit_tests", status: "passed", evidence: "pnpm test" },
    ]);

    expect(decision).toEqual({ canPublish: true, state: "eligible", reasons: [] });
  });

  it("blocks publication when a required verification has not been run", () => {
    const decision = decideMaintenancePublication([
      validBackup(),
      { kind: "typescript", status: "passed", evidence: "pnpm check" },
    ]);

    expect(decision.canPublish).toBe(false);
    expect(decision.reasons).toContain("Verificação obrigatória não executada: unit_tests.");
  });

  it("blocks publication and preserves evidence when a required verification fails", () => {
    const decision = decideMaintenancePublication([
      validBackup(),
      { kind: "typescript", status: "failed", evidence: "TS2322 em ImmersiveScene.tsx" },
      { kind: "unit_tests", status: "passed", evidence: "pnpm test" },
    ]);

    expect(decision.canPublish).toBe(false);
    expect(decision.reasons).toContain(
      "Verificação obrigatória reprovada: typescript. Evidência: TS2322 em ImmersiveScene.tsx",
    );
  });

  it("keeps scheduled diagnostics blocked even when their backup is valid", () => {
    const assessment = createScheduledMaintenanceAssessment(validBackup());

    expect(assessment.decision).toMatchObject({ canPublish: false, state: "blocked" });
    expect(assessment.verifications).toEqual([
      expect.objectContaining({ kind: "backup_snapshot", status: "passed" }),
      expect.objectContaining({ kind: "typescript", status: "not_run" }),
      expect.objectContaining({ kind: "unit_tests", status: "not_run" }),
    ]);
  });

  it("blocks every maintenance action when the latest backup is missing, old or lacks checksum", () => {
    expect(assessBackupForMaintenance(null)).toMatchObject({ kind: "backup_snapshot", status: "failed" });
    expect(assessBackupForMaintenance({ status: "completed", checksum: null, completedAtMs: Date.now() })).toMatchObject({ status: "failed" });
    expect(assessBackupForMaintenance({ status: "completed", checksum: "sha256", completedAtMs: 0 })).toMatchObject({ status: "failed" });
  });
});
