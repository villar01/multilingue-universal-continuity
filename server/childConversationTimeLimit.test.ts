import { describe, expect, it } from "vitest";
import { calculateDailyUsageMinutes, canUseOnDay, parentalWeekdayIndex } from "./childConversationTimeLimit";
import { buildSafeConversationAlert } from "./parentalConversationAlert";

describe("child conversation time limit", () => {
  const monday = new Date("2026-08-10T12:00:00.000Z");

  it("uses the Monday-first ordering configured by parental allowed days", () => {
    expect(parentalWeekdayIndex(monday)).toBe(0);
    expect(canUseOnDay([true, false, false, false, false, false, false], monday)).toBe(true);
    expect(canUseOnDay([false, true, true, true, true, true, true], monday)).toBe(false);
  });

  it("counts stored sessions and elapsed active time without accessing conversation text", () => {
    expect(calculateDailyUsageMinutes([
      { minutesUsed: 12, sessionStart: new Date("2026-08-10T08:00:00.000Z"), sessionEnd: new Date("2026-08-10T08:12:00.000Z") },
      { minutesUsed: 0, sessionStart: new Date("2026-08-10T11:40:00.000Z"), sessionEnd: null },
    ], monday)).toBe(32);
  });

  it("describes a time-limit alert without exposing any conversation content", () => {
    expect(buildSafeConversationAlert("daily_time_limit")).toMatchObject({
      alertType: "daily_time_limit_reached",
      detail: expect.not.stringContaining("mensagem"),
    });
  });
});
