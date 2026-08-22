export type ImprovementPriority = "low" | "medium" | "high" | "critical";

export interface ImprovementTelemetryEvidence {
  eventType: string;
  occurrences: number;
}

export interface OwnerReviewProposal {
  action: string;
  priority: ImprovementPriority;
  estimatedImpact: string;
  category: "reliability" | "security" | "learning" | "operations";
  requiresOwnerApproval: true;
  executionState: "blocked_for_owner_review";
}

export interface AssistedImprovementReport {
  decision: "blocked_for_owner_review";
  summary: string;
  evidence: ImprovementTelemetryEvidence[];
  proposals: OwnerReviewProposal[];
  securityAlertCount: number;
  totalErrors: number;
}

type CandidateProposal = {
  action?: unknown;
  priority?: unknown;
  estimatedImpact?: unknown;
  isSecurity?: unknown;
};

type TelemetryRow = { event_type: string; count: number };

const PRIORITIES: readonly ImprovementPriority[] = ["low", "medium", "high", "critical"];

function normalizePriority(value: unknown): ImprovementPriority {
  return typeof value === "string" && PRIORITIES.includes(value as ImprovementPriority)
    ? value as ImprovementPriority
    : "medium";
}

function normalizeText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== "string") return fallback;
  const compact = value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return compact ? compact.slice(0, maxLength) : fallback;
}

function buildEvidence(rows: readonly TelemetryRow[]): ImprovementTelemetryEvidence[] {
  const byType = new Map<string, number>();
  for (const row of rows) {
    const eventType = normalizeText(row.event_type, "evento", 80);
    const count = Number.isFinite(row.count) && row.count > 0 ? Math.floor(row.count) : 0;
    byType.set(eventType, (byType.get(eventType) || 0) + count);
  }
  return [...byType.entries()]
    .map(([eventType, occurrences]) => ({ eventType, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);
}

export function createAssistedImprovementReport(input: {
  topIssue?: unknown;
  recommendations?: unknown;
  proposedActions?: unknown;
  securityAlerts?: unknown;
  telemetryRows: readonly TelemetryRow[];
  totalErrors: number;
}): AssistedImprovementReport {
  const candidates = [
    ...(Array.isArray(input.recommendations) ? input.recommendations : []),
    ...(Array.isArray(input.proposedActions) ? input.proposedActions : []),
  ] as CandidateProposal[];
  const securityAlerts = Array.isArray(input.securityAlerts) ? input.securityAlerts : [];
  const proposals: OwnerReviewProposal[] = candidates.slice(0, 8).map((candidate) => ({
    action: normalizeText(candidate.action, "Revisar evidência agregada no painel privado.", 240),
    priority: normalizePriority(candidate.priority),
    estimatedImpact: normalizeText(candidate.estimatedImpact, "Impacto a confirmar após revisão.", 160),
    category: (candidate.isSecurity === true ? "security" : "reliability") as OwnerReviewProposal["category"],
    requiresOwnerApproval: true as const,
    executionState: "blocked_for_owner_review" as const,
  }));

  return {
    decision: "blocked_for_owner_review",
    summary: normalizeText(input.topIssue, "Diagnóstico assistido aguardando revisão do proprietário.", 240),
    evidence: buildEvidence(input.telemetryRows),
    proposals,
    securityAlertCount: securityAlerts.length,
    totalErrors: Math.max(0, Math.floor(input.totalErrors || 0)),
  };
}
