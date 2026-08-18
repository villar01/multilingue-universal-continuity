import { describe, expect, it } from "vitest";
import { deriveAudioViseme } from "../client/src/lib/audioDrivenVisemes";

describe("audio driven visemes", () => {
  it("keeps the mouth closed when the same audio clock is silent", () => {
    expect(deriveAudioViseme(0.02, 0.9)).toEqual({ open: 0, round: 0, active: false });
  });

  it("derives a limited mouth shape from audio intensity rather than text timing", () => {
    expect(deriveAudioViseme(0.5, 0.6)).toEqual({ open: 0.5, round: 0.3, active: true });
  });
});
