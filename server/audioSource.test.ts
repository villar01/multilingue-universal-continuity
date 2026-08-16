import { describe, expect, it } from "vitest";
import { audioBase64ToDataUrl } from "../client/src/lib/audioSource";

describe("dialogue audio source", () => {
  it("keeps server-returned audio as a durable data URL for the native control", () => {
    const source = audioBase64ToDataUrl("QUJD\nRA==");
    expect(source).toBe("data:audio/mpeg;base64,QUJDRA==");
    expect(source).not.toContain("blob:");
  });

  it("rejects an empty audio payload", () => {
    expect(() => audioBase64ToDataUrl("   ")).toThrow("Áudio vazio");
  });
});
