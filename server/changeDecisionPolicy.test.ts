import { describe, expect, it } from "vitest";
import { canImplementDirectly, requiresOwnerApproval } from "./changeDecisionPolicy";

describe("change decision policy", () => {
  it("allows direct implementation only for safe internal improvements", () => {
    expect(canImplementDirectly("safe_product_improvement")).toBe(true);
    expect(canImplementDirectly("test_or_regression")).toBe(true);
    expect(canImplementDirectly("documentation")).toBe(true);
  });

  it("requires owner approval for every external, financial, contractual or sensitive action", () => {
    expect(requiresOwnerApproval("external_publication")).toBe(true);
    expect(requiresOwnerApproval("ad_spend")).toBe(true);
    expect(requiresOwnerApproval("price_change")).toBe(true);
    expect(requiresOwnerApproval("discount")).toBe(true);
    expect(requiresOwnerApproval("charge")).toBe(true);
    expect(requiresOwnerApproval("contract")).toBe(true);
    expect(requiresOwnerApproval("sensitive_data_export")).toBe(true);
  });
});
