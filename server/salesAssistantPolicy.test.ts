import { describe, expect, it } from "vitest";
import { isSalesAssistantActionAllowed, salesAssistantPolicy } from "./salesAssistantPolicy";

describe("sales assistant policy", () => {
  it("allows assistance but blocks sensitive commercial actions", () => {
    expect(isSalesAssistantActionAllowed("canExplainApprovedServices")).toBe(true);
    expect(isSalesAssistantActionAllowed("canQualifyInterest")).toBe(true);
    expect(salesAssistantPolicy.canPublishCampaign).toBe(false);
    expect(salesAssistantPolicy.canChangeBudget).toBe(false);
    expect(salesAssistantPolicy.canChangePrice).toBe(false);
    expect(salesAssistantPolicy.canGrantDiscount).toBe(false);
    expect(salesAssistantPolicy.canCreateCharge).toBe(false);
  });

  it("requires owner approval for every sensitive commercial action", () => {
    expect(salesAssistantPolicy.ownerApprovalRequiredFor).toEqual([
      "campaign_publication",
      "budget_change",
      "price_change",
      "discount",
      "contract",
      "charge",
    ]);
  });
});
