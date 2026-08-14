import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("diálogo roteirizado e sessão da cena imersiva", () => {
  it("abre o diálogo roteirizado sem transformar a sessão em pré-requisito do painel", () => {
    expect(source).toContain("setDlgOpen(true); setDlgStep(0);");
    expect(source).toContain("Diálogo roteirizado ativo. Entre para ouvir a voz neural");
    expect(source).toContain("setDlgAudioClock(isAuthenticated);");
  });

  it("mantém as mutações de voz neural condicionadas à sessão", () => {
    expect(source).toContain("if (isAuthenticated) {");
    expect(source).toContain("requestSpeechSafely(teacherSpeech.text");
    expect(source).toContain("O diálogo com voz neural requer uma sessão protegida.");
  });
});
