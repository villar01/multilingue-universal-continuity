import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { hasAudibleParentalAlert, isAudibleParentalAlertType } from "../client/src/lib/parentalAlertSound";

const alertSoundSource = readFileSync(new URL("../client/src/lib/parentalAlertSound.ts", import.meta.url), "utf8");

describe("parental alert sound policy", () => {
  it("signals unread content-safety alerts to the responsible adult", () => {
    expect(hasAudibleParentalAlert([{ id: 1, alertType: "inappropriate_content", isRead: false }])).toBe(true);
    expect(hasAudibleParentalAlert([{ id: 2, alertType: "country_compliance_blocked", isRead: false }])).toBe(true);
    expect(hasAudibleParentalAlert([{ id: 3, alertType: "adult_content", isRead: false }])).toBe(true);
    expect(hasAudibleParentalAlert([{ id: 4, alertType: "grooming", isRead: false }])).toBe(true);
    expect(hasAudibleParentalAlert([{ id: 5, alertType: "cyber_threat", isRead: false }])).toBe(true);
  });

  it("does not replay alerts already reviewed or routine progress notifications", () => {
    expect(hasAudibleParentalAlert([{ id: 1, alertType: "inappropriate_content", isRead: true }])).toBe(false);
    expect(hasAudibleParentalAlert([{ id: 2, alertType: "lesson_completed", isRead: false }])).toBe(false);
    expect(isAudibleParentalAlertType("lesson_completed")).toBe(false);
  });

  it("verifica somente alertas já existentes, sem gravar ou alterar histórico do aluno", () => {
    const alerts = [{ id: 7, alertType: "content_blocked", isRead: false }];
    const originalSnapshot = JSON.stringify(alerts);

    expect(hasAudibleParentalAlert(alerts)).toBe(true);
    expect(JSON.stringify(alerts)).toBe(originalSnapshot);
    expect(alertSoundSource).not.toMatch(/\b(fetch|trpc|mutation|storagePut|\.insert\()\b/);
  });
});
