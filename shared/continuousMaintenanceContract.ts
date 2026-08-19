export type MaintenanceVerificationKind = "backup_snapshot" | "typescript" | "unit_tests" | "production_smoke" | "teacher_media";
export type MaintenanceVerificationStatus = "passed" | "failed" | "not_run";

export interface BackupSnapshotEvidence {
  status: string;
  checksum: string | null;
  completedAtMs: number | null;
}

export interface MaintenanceVerification {
  kind: MaintenanceVerificationKind;
  status: MaintenanceVerificationStatus;
  evidence: string;
}

export interface MaintenancePublicationDecision {
  canPublish: boolean;
  state: "eligible" | "blocked";
  reasons: string[];
}

export interface ScheduledMaintenanceAssessment {
  verifications: readonly MaintenanceVerification[];
  decision: MaintenancePublicationDecision;
}

export const MAX_BACKUP_AGE_MS = 8 * 60 * 60 * 1000;

export function assessBackupForMaintenance(
  snapshot: BackupSnapshotEvidence | null,
  nowMs = Date.now(),
): MaintenanceVerification {
  if (!snapshot || snapshot.status !== "completed") {
    return {
      kind: "backup_snapshot",
      status: "failed",
      evidence: "Não existe snapshot concluído disponível para a manutenção.",
    };
  }

  if (!snapshot.checksum) {
    return {
      kind: "backup_snapshot",
      status: "failed",
      evidence: "O snapshot concluído não possui checksum verificável.",
    };
  }

  if (!snapshot.completedAtMs || nowMs - snapshot.completedAtMs > MAX_BACKUP_AGE_MS) {
    return {
      kind: "backup_snapshot",
      status: "failed",
      evidence: "O snapshot verificado está vencido para uma ação de manutenção.",
    };
  }

  return {
    kind: "backup_snapshot",
    status: "passed",
    evidence: "Snapshot concluído, recente e com checksum registrado.",
  };
}

/**
 * Contrato mínimo de continuidade. Uma alteração não pode ser considerada apta
 * para publicação sem backup atual, TypeScript e suíte de regressão aprovados.
 * A decisão é determinística: a IA diagnostica, mas não libera mudanças.
 */
export function decideMaintenancePublication(
  verifications: readonly MaintenanceVerification[],
): MaintenancePublicationDecision {
  const required: readonly MaintenanceVerificationKind[] = ["backup_snapshot", "typescript", "unit_tests"];
  const reasons = required.flatMap((kind) => {
    const verification = verifications.find((candidate) => candidate.kind === kind);

    if (!verification || verification.status === "not_run") {
      return [`Verificação obrigatória não executada: ${kind}.`];
    }

    if (verification.status === "failed") {
      return [`Verificação obrigatória reprovada: ${kind}. Evidência: ${verification.evidence}`];
    }

    return [];
  });

  return {
    canPublish: reasons.length === 0,
    state: reasons.length === 0 ? "eligible" : "blocked",
    reasons,
  };
}

/**
 * A tarefa agendada observa telemetria, mas não executa compilação, testes nem
 * publicação. Mesmo com backup válido, ela permanece bloqueada para revisão.
 */
export function createScheduledMaintenanceAssessment(
  backupVerification: MaintenanceVerification,
): ScheduledMaintenanceAssessment {
  const verifications: readonly MaintenanceVerification[] = [
    backupVerification,
    {
      kind: "typescript",
      status: "not_run",
      evidence: "O diagnóstico agendado não executa compilação nem publica alterações.",
    },
    {
      kind: "unit_tests",
      status: "not_run",
      evidence: "O diagnóstico agendado não executa a suíte de regressão.",
    },
  ];

  return {
    verifications,
    decision: decideMaintenancePublication(verifications),
  };
}
