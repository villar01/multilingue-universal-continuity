import { describe, expect, it } from "vitest";
import { allowsBrowserSpeechFallback } from "../client/src/lib/immersiveSpeechPolicy";

describe("immersive neural speech policy", () => {
  it("never degrades object vocabulary pronunciation to browser speech", () => {
    expect(allowsBrowserSpeechFallback("hotspot")).toBe(false);
  });

  it("retains browser speech only as a last-resort fallback for non-object teacher dialogue", () => {
    expect(allowsBrowserSpeechFallback("teacher")).toBe(true);
  });
});
