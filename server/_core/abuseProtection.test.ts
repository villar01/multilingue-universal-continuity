import { describe, expect, it, afterEach } from "vitest";
import {
  __resetAbuseProtectionForTests,
  isTemporarilyAbuseBlocked,
  recordAbuseSignal,
} from "./abuseProtection";

describe("temporary abuse containment", () => {
  afterEach(() => __resetAbuseProtectionForTests());

  it("does not block an isolated suspicious signal", () => {
    const result = recordAbuseSignal("198.51.100.40", "scanner", 1_000);
    expect(result.temporarilyBlocked).toBe(false);
    expect(isTemporarilyAbuseBlocked("198.51.100.40", 1_001)).toBe(false);
  });

  it("temporarily blocks repeated technical abuse without retaining the raw address", () => {
    for (let count = 0; count < 6; count += 1) {
      recordAbuseSignal("198.51.100.41", "malicious-input", 2_000);
    }
    expect(isTemporarilyAbuseBlocked("198.51.100.41", 2_001)).toBe(true);
    expect(isTemporarilyAbuseBlocked("198.51.100.42", 2_001)).toBe(false);
    expect(isTemporarilyAbuseBlocked("198.51.100.41", 2_000 + 30 * 60 * 1000)).toBe(false);
  });
});
