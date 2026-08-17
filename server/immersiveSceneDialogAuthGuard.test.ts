import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("diálogo roteirizado e sessão da cena imersiva", () => {
  it("abre o diálogo e prepara a primeira fala no próprio gesto de início", () => {
    expect(source).toContain("setDlgOpen(true); setDlgStep(0);");
    expect(source).toContain("primeDialogAudioFromGesture();");
    expect(source).toContain("setDlgWords(words); setDlgWordIdx(0);");
    expect(source).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);");
  });

  it("mantém sessão protegida como caminho aprimorado sem esconder o diálogo do visitante", () => {
    expect(source).toContain("if (!isAuthenticated) {");
    expect(source).toContain("playPublicSceneDialogue(text, language, gender || \"female\", requestKey)");
    expect(source).toContain("O diálogo com voz neural requer uma sessão protegida.");
  });
});
