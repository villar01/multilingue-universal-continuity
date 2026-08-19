import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const boundarySource = readFileSync(resolve(projectRoot, "client/src/components/ImmersiveSceneRecoveryBoundary.tsx"), "utf8");
const appSource = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");

describe("recuperação local da Cena Imersiva", () => {
  it("mantém opções de recuperação e saída sem recarregar o aplicativo inteiro", () => {
    expect(boundarySource).toContain("static getDerivedStateFromError");
    expect(boundarySource).toContain("autoRecoveryUsed");
    expect(boundarySource).toContain("Restaurando a cena");
    expect(boundarySource).toContain("window.setTimeout");
    expect(boundarySource).toContain("}, 250);");
    expect(boundarySource).toContain("componentWillUnmount");
    expect(boundarySource).toContain("Tentar esta cena");
    expect(boundarySource).toContain("Continuar nas lições");
    expect(boundarySource).toContain("Voltar ao painel");
    expect(boundarySource).toContain('window.location.assign("/lessons-hub")');
    expect(boundarySource).toContain('window.location.assign("/dashboard")');
    expect(boundarySource).not.toContain("window.location.reload()");
  });

  it("envolve somente a rota da Cena Imersiva e preserva o restante do aplicativo", () => {
    expect(appSource).toContain("<ImmersiveSceneRecoveryBoundary>");
    expect(appSource).toContain('<Route path="/immersive-scene" component={ResilientImmersiveScene} />');
  });
});
