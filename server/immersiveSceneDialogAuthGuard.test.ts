import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("diálogo roteirizado e sessão da cena imersiva", () => {
  it("abre o diálogo com texto visível, mas sem fala antes de um comando explícito", () => {
    expect(source).toContain("setDlgOpen(true); setDlgStep(0);");
    expect(source).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    const startDialog = source.slice(source.indexOf("const startDialog"), source.indexOf("useEffect(() => {", source.indexOf("const startDialog")));
    expect(startDialog).not.toContain("requestSpeechSafely(");
    expect(source).toContain('requestSpeechSafely(immediateReply.replace(/^[^:]+:\\s*/, ""), scene.teacherLang, scene.teacherGender, "teacher", true);');
  });

  it("mantém sessão protegida como caminho aprimorado sem esconder o diálogo do visitante", () => {
    expect(source).toContain("if (!isAuthenticated) {");
    expect(source).toContain("const effectiveGender = selectedScene?.teacherName === \"James\"");
    expect(source).toContain("playPublicSceneDialogue(text, language, effectiveGender, requestKey)");
    expect(source).toContain("O diálogo com voz neural requer uma sessão protegida.");
  });
});
