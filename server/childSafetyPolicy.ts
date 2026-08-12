export type ChildSafetyDecision = "allow" | "parental_review" | "absolute_block";

export interface ChildSafetyAssessment {
  decision: ChildSafetyDecision;
  canParentOverride: boolean;
  reason: string;
}

const ABSOLUTE_BLOCK_CATEGORIES = new Set([
  "sexual_exploitation",
  "sexual_content",
  "pornography",
  "grooming",
  "self_harm",
  "suicide",
  "illegal_activity",
  "severe_violence",
]);

const REVIEW_CATEGORIES = new Set([
  "mature_language",
  "age_restricted",
  "age_content_review",
  "sensitive_topic",
  "moderate_violence",
]);

/** Conteúdo ilegal ou de alto risco nunca é liberado por decisão manual. */
export function assessChildSafety(category: string | null | undefined, severity: string | null | undefined): ChildSafetyAssessment {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  const normalizedSeverity = String(severity || "").trim().toLowerCase();

  if (ABSOLUTE_BLOCK_CATEGORIES.has(normalizedCategory) || normalizedSeverity === "critical") {
    return { decision: "absolute_block", canParentOverride: false, reason: "Conteúdo ilegal ou de alto risco permanece bloqueado para proteger o menor." };
  }

  if (REVIEW_CATEGORIES.has(normalizedCategory) || normalizedSeverity === "review") {
    return { decision: "parental_review", canParentOverride: true, reason: "Conteúdo legal, porém inadequado à faixa atual; requer decisão temporária do responsável." };
  }

  return { decision: "allow", canParentOverride: false, reason: "Não há classificação de bloqueio para esta interação." };
}
