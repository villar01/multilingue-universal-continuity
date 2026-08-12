import { describe, expect, it } from "vitest";
import { assessChildSafety } from "./childSafetyPolicy";

describe("child safety policy", () => {
  it("never allows a parent override for illegal or high-risk content", () => {
    const assessment = assessChildSafety("sexual_content", "block");
    expect(assessment.decision).toBe("absolute_block");
    expect(assessment.canParentOverride).toBe(false);
  });

  it("allows only age-inappropriate but legal content to enter temporary parental review", () => {
    const assessment = assessChildSafety("age_restricted", "review");
    expect(assessment.decision).toBe("parental_review");
    expect(assessment.canParentOverride).toBe(true);
  });

  it("does not create an override flow for ordinary safe content", () => {
    expect(assessChildSafety(null, null).decision).toBe("allow");
  });
});
