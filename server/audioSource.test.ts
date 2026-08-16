import { describe, expect, it } from "vitest";
import { audioBase64ToBlob, audioBase64ToDataUrl } from "../client/src/lib/audioSource";

describe("dialogue audio source", () => {
  it("keeps server-returned audio as a durable data URL for the native control", () => {
    const source = audioBase64ToDataUrl("QUJD\nRA==");
    expect(source).toBe("data:audio/mpeg;base64,QUJDRA==");
    expect(source).not.toContain("blob:");
  });

  it("rejects an empty audio payload", () => {
    expect(() => audioBase64ToDataUrl("   ")).toThrow("Áudio vazio");
  });

  it("decodifica o MP3 em Blob antes de criar URL persistente para o controle nativo", () => {
    const blob = audioBase64ToBlob("QUJDRA==", "audio/mp3");
    expect(blob.type).toBe("audio/mp3");
    expect(blob.size).toBe(4);
  });
});
