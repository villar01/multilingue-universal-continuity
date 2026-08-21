import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("prévia segura da Cena Imersiva para visitantes", () => {
  it("preserva somente a prévia visual e oculta os elementos pedagógicos até a sessão protegida", () => {
    expect(source).toContain("const hasAuthorizedSceneMaterial = Boolean(");
    expect(source).toContain("isAuthenticated && activeSceneDialog.length > 0 && !sceneMaterialNeedsAccess");
    expect(source).toContain("{hasAuthorizedSceneMaterial && activeSceneHotspots.map((hotspot) => {");
    expect(source).toContain("{hasAuthorizedSceneMaterial && activeHotspot && (");
    expect(source).toContain("{hasAuthorizedSceneMaterial && practiceHotspot && (");
    expect(source).toContain("{hasAuthorizedSceneMaterial && quizOpen && quizQuestion && (");
    expect(source).toContain("greeting={hasAuthorizedSceneMaterial ? greetingText : \"\"}");
    expect(source).toContain("showGreeting={hasAuthorizedSceneMaterial && showGreeting}");
    expect(source).toContain("spokenText={hasAuthorizedSceneMaterial ? activeSpeechText || greetingText : \"\"}");
    expect(source).toContain("{hasAuthorizedSceneMaterial && (\n                <button");
    expect(source).toContain("isOpen={hasAuthorizedSceneMaterial && paretoOpen}");
    expect(source).toContain("if (!hasAuthorizedSceneMaterial) setParetoOpen(false);");
  });

  it("oferece ativação de acesso clara sem expor diálogo ou vocabulário", () => {
    expect(source).toContain("Prévia visual disponível.");
    expect(source).toContain("Ative o acesso para liberar objetos, vocabulário, diálogo e prática com o professor.");
    expect(source).toContain("? `Explore os objetos de ${scene.name} e pratique com o professor.`");
    expect(source).toContain('>Ativar acesso</button>');
    expect(source).toContain("window.location.href = getLoginUrl();");
  });

  it("não mantém falas pedagógicas no catálogo de prévias enviado ao navegador", () => {
    const catalog = readFileSync(resolve(process.cwd(), "client/src/lib/immersiveScenesCatalog.ts"), "utf8");
    expect(catalog).not.toContain("teacherGreeting:");
    expect(catalog).not.toContain("greetingPt:");
  });

  it("não usa o catálogo público como fallback de diálogo ou hotspots", () => {
    expect(source).toContain("const activeSceneDialog = canonicalSceneMaterialQuery.data?.dialog ?? [];");
    expect(source).toContain("const activeSceneHotspots = canonicalSceneMaterialQuery.data?.hotspots ?? [];");
    expect(source).not.toContain("canonicalSceneMaterialQuery.data?.hotspots || selectedScene?.hotspots");
    expect(source).not.toContain("canonicalSceneMaterialQuery.data?.dialog || selectedScene?.dialog");
  });
});
