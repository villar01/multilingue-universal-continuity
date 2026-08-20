import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("bloqueio de diálogo imersivo sem sessão", () => {
  it("não aciona voz pública, navegador ou fallback local quando o aluno não está autenticado", () => {
    const start = source.indexOf("const requestSpeechSafely = useCallback");
    const end = source.indexOf("primeVisemeAudio();", start);
    const unauthenticatedBranch = source.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(unauthenticatedBranch).toContain("if (!isAuthenticated) {");
    expect(unauthenticatedBranch).toContain("setDialogAuthRequired(true);");
    expect(unauthenticatedBranch).toContain("Ative o acesso protegido para ouvir a fala do professor nesta cena.");
    expect(unauthenticatedBranch).not.toContain("playPublicSceneDialogue");
    expect(unauthenticatedBranch).not.toContain("playLocalDialogFallback");
    expect(unauthenticatedBranch).not.toContain("synth.speak");
  });

  it("mantém o visitante na ativação de acesso em vez de oferecer comando de reprodução", () => {
    expect(source).toContain('"Ativar acesso para ouvir"');
    expect(source).toContain('window.location.href = getLoginUrl();');
    expect(source).not.toContain("playGuestBrowserVoice");
    expect(source).not.toContain("Usar voz do navegador");
  });

  it("bloqueia a apresentação inicial antes de abrir o diálogo quando não há sessão", () => {
    const introButton = source.slice(
      source.indexOf('{!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && activeSceneDialog.length > 0 && ('),
      source.indexOf('{!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && sceneMaterialIsPreparing && ('),
    );

    expect(introButton).toContain("if (!isAuthenticated) {");
    expect(introButton).toContain("setDialogAuthRequired(true);");
    expect(introButton).toContain("Ative o acesso protegido para iniciar o diálogo desta cena.");
    expect(introButton).toContain('"Ativar acesso para iniciar"');
    expect(introButton.indexOf("if (!isAuthenticated) {")).toBeLessThan(introButton.indexOf("startDialog(selectedScene);"));
  });
});
