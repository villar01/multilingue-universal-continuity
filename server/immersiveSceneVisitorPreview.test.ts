import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("prévia segura da Cena Imersiva para visitantes", () => {
  it("preserva somente a prévia visual e oculta os elementos pedagógicos até a sessão protegida", () => {
    expect(source).toContain("{isAuthenticated && activeSceneHotspots.map((hotspot) => {");
    expect(source).toContain("{isAuthenticated && activeHotspot && (");
    expect(source).toContain("{isAuthenticated && practiceHotspot && (");
    expect(source).toContain("{isAuthenticated && quizOpen && quizQuestion && (");
    expect(source).toContain("greeting={isAuthenticated ? greetingText : \"\"}");
    expect(source).toContain("showGreeting={isAuthenticated && showGreeting}");
    expect(source).toContain("spokenText={isAuthenticated ? activeSpeechText || greetingText : \"\"}");
  });

  it("oferece ativação de acesso clara sem expor diálogo ou vocabulário", () => {
    expect(source).toContain("Prévia visual disponível.");
    expect(source).toContain("Ative o acesso para liberar objetos, vocabulário, diálogo e prática com o professor.");
    expect(source).toContain('>Ativar acesso</button>');
    expect(source).toContain("window.location.href = getLoginUrl();");
  });

  it("não mantém falas pedagógicas no catálogo de prévias enviado ao navegador", () => {
    const catalog = readFileSync(resolve(process.cwd(), "client/src/lib/immersiveScenesCatalog.ts"), "utf8");
    expect(catalog).not.toContain("teacherGreeting:");
    expect(catalog).not.toContain("greetingPt:");
  });
});
