import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("bloqueio de autenticação da Cena Imersiva", () => {
  const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

  it("interrompe a renderização pedagógica enquanto a sessão ainda está sendo verificada", () => {
    expect(source).toContain("if (isAuthLoading) {");
    expect(source).toContain("Preparando seu espaço de aprendizagem");
  });

  it("não renderiza a cena para visitantes e oferece somente o acesso autenticado", () => {
    const gateStart = source.indexOf("if (!isAuthenticated) {");
    const sceneViewStart = source.indexOf("// ── Scene View ──", gateStart);
    const gate = source.slice(gateStart, sceneViewStart);
    expect(gate).toContain("Entrar para aprender");
    expect(gate).toContain("window.location.href = getLoginUrl()");
    expect(gate).not.toContain("ParetoPanel");
    expect(gate).not.toContain("selectedScene.hotspots");
    expect(gate).not.toContain("Diálogo da cena");
  });
});
