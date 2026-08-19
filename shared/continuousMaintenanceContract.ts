export type MaintenanceVerificationKind = "typescript" | "unit_tests" | "production_smoke" | "teacher_media";
export type MaintenanceVerificationStatus = "passed" | "failed" | "not_run";

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

/**
 * Contrato mínimo de continuidade. Uma alteração não pode ser considerada apta
 * para publicação sem evidência atual de TypeScript e da suíte de regressão.
 * A decisão é deliberadamente determinística: a IA pode diagnosticar falhas,
 * mas não substitui as verificações nem libera mudanças por conta própria.
 */
export function decideMaintenancePublication(
  verifications: readonly MaintenanceVerification[],
): MaintenancePublicationDecision {
  const required: readonly MaintenanceVerificationKind[] = ["typescript", "unit_tests"];
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
 * publicação. Portanto, ela sempre registra uma proposta bloqueada para revisão
 * até que uma alteração candidata possua evidência de validação fora do job.
 */
export function createScheduledMaintenanceAssessment(): ScheduledMaintenanceAssessment {
  const verifications: readonly MaintenanceVerification[] = [
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
