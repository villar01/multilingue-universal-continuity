export interface AssistedImprovementProjection {
  id: number;
  title: string;
  summary: string;
  priority: "low" | "medium" | "high" | "critical";
  evidenceCount: number;
  proposalCount: number;
  securityAlertCount: number;
  requiresOwnerReview: true;
  executionState: "blocked_for_owner_review";
  createdAt: number | null;
}

function boundedText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const compact = value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return compact ? compact.slice(0, 240) : fallback;
}

function priorityOf(value: unknown): AssistedImprovementProjection["priority"] {
  return value === "low" || value === "medium" || value === "high" || value === "critical" ? value : "medium";
}

export function projectAssistedImprovement(row: {
  id: number;
  title: string;
  recommendations: unknown;
  severity: unknown;
  createdAt: Date | null;
}): AssistedImprovementProjection {
  const report = row.recommendations && typeof row.recommendations === "object"
    ? row.recommendations as Record<string, unknown>
    : {};
  const evidence = Array.isArray(report.evidence) ? report.evidence : [];
  const proposals = Array.isArray(report.proposals) ? report.proposals : [];
  const securityAlertCount = typeof report.securityAlertCount === "number" && report.securityAlertCount > 0
    ? Math.floor(report.securityAlertCount)
    : 0;

  return {
    id: row.id,
    title: boundedText(row.title, "Diagnóstico assistido"),
    summary: boundedText(report.summary, "Diagnóstico aguardando revisão do proprietário."),
    priority: priorityOf(row.severity),
    evidenceCount: evidence.length,
    proposalCount: proposals.length,
    securityAlertCount,
    requiresOwnerReview: true,
    executionState: "blocked_for_owner_review",
    createdAt: row.createdAt?.getTime() ?? null,
  };
}
