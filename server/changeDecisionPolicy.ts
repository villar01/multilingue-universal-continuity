export type ChangeDecisionAction =
  | "safe_product_improvement"
  | "test_or_regression"
  | "documentation"
  | "external_publication"
  | "ad_spend"
  | "price_change"
  | "discount"
  | "charge"
  | "contract"
  | "sensitive_data_export";

const ownerApprovalActions = new Set<ChangeDecisionAction>([
  "external_publication",
  "ad_spend",
  "price_change",
  "discount",
  "charge",
  "contract",
  "sensitive_data_export",
]);

export function requiresOwnerApproval(action: ChangeDecisionAction) {
  return ownerApprovalActions.has(action);
}

export function canImplementDirectly(action: ChangeDecisionAction) {
  return !requiresOwnerApproval(action);
}
