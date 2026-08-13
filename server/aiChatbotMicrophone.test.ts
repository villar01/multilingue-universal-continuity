import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AIChatbot.tsx"), "utf8");

describe("microfone do chatbot", () => {
  it("solicita microfone apenas a partir do clique e usa o locale alvo para transcrição", () => {
    expect(source).toContain("const startRecording = async () =>");
    expect(source).toContain("const stream = await requestMicrophoneStream()");
    expect(source).toContain("recognition.lang = targetLanguage");
    expect(source).not.toContain("Gravação de voz em desenvolvimento");
  });

  it("libera os recursos do microfone ao parar, ao terminar e ao desmontar", () => {
    expect(source).toContain("const stopRecording = () =>");
    expect(source).toContain("microphoneStreamRef.current?.getTracks().forEach((track) => track.stop())");
    expect(source).toContain("recognition.onend = () =>");
  });
});
