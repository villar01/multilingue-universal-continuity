export const salesAssistantPolicy = {
  canExplainApprovedServices: true,
  canQualifyInterest: true,
  canCollectConsent: true,
  canPrepareCampaignDraft: true,
  canPublishCampaign: false,
  canChangeBudget: false,
  canChangePrice: false,
  canGrantDiscount: false,
  canSignContract: false,
  canCreateCharge: false,
  ownerApprovalRequiredFor: [
    "campaign_publication",
    "budget_change",
    "price_change",
    "discount",
    "contract",
    "charge",
  ],
} as const;

export type SalesAssistantAction = keyof typeof salesAssistantPolicy;

export function isSalesAssistantActionAllowed(action: SalesAssistantAction) {
  return salesAssistantPolicy[action] === true;
}
