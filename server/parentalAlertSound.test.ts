import { describe, expect, it } from "vitest";
import { hasAudibleParentalAlert } from "../client/src/lib/parentalAlertSound";

describe("parental alert sound policy", () => {
  it("signals unread content-safety alerts to the responsible adult", () => {
    expect(hasAudibleParentalAlert([{ id: 1, alertType: "inappropriate_content", isRead: false }])).toBe(true);
    expect(hasAudibleParentalAlert([{ id: 2, alertType: "country_compliance_blocked", isRead: false }])).toBe(true);
  });

  it("does not replay alerts already reviewed or routine progress notifications", () => {
    expect(hasAudibleParentalAlert([{ id: 1, alertType: "inappropriate_content", isRead: true }])).toBe(false);
    expect(hasAudibleParentalAlert([{ id: 2, alertType: "lesson_completed", isRead: false }])).toBe(false);
  });
});
