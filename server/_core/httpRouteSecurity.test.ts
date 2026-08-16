import { beforeEach, describe, expect, it } from "vitest";
import {
  consumePublicErrorReportQuota,
  resetPublicErrorReportQuotaForTest,
  sanitizePublicErrorReport,
} from "./httpRouteSecurity";

describe("HTTP route data protection", () => {
  beforeEach(() => resetPublicErrorReportQuotaForTest());

  it("discards free-form telemetry, stack traces and URLs", () => {
    const sanitized = sanitizePublicErrorReport({
      context: "lesson/error?",
      eventType: "unhandledrejection",
      message: "student@example.com token=secret",
      stack: "private source trace",
      url: "https://example.test/lesson/12?email=student@example.com#private",
    });

    expect(sanitized).toEqual({
      eventType: "client-error",
      context: "lessonerror",
    });
  });

  it("limits public error telemetry per client window", () => {
    const now = 1_000;
    for (let count = 0; count < 20; count += 1) {
      expect(consumePublicErrorReportQuota("198.51.100.7", now)).toBe(true);
    }
    expect(consumePublicErrorReportQuota("198.51.100.7", now)).toBe(false);
    expect(consumePublicErrorReportQuota("198.51.100.7", now + 5 * 60 * 1000)).toBe(true);
  });
});
