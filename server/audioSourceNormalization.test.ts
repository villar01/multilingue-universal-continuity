import { describe, expect, it } from "vitest";
import { audioBase64ToBlob, audioBase64ToDataUrl } from "../client/src/lib/audioSource";

describe("normalização compartilhada de fontes de áudio", () => {
  const minimalAudioBase64 = "AAECAw==";

  it("aceita base64 puro para todas as cenas", async () => {
    const blob = audioBase64ToBlob(minimalAudioBase64, "audio/mpeg");
    expect(blob.size).toBe(4);
    expect(blob.type).toBe("audio/mpeg");
  });

  it("aceita data URL sem transformar o prefixo em bytes inválidos", async () => {
    const dataUrl = `data:audio/wav;base64,${minimalAudioBase64}`;
    const blob = audioBase64ToBlob(dataUrl, "audio/mpeg");
    expect(blob.size).toBe(4);
    expect(blob.type).toBe("audio/wav");
    expect(audioBase64ToDataUrl(dataUrl)).toBe(dataUrl);
  });
});
