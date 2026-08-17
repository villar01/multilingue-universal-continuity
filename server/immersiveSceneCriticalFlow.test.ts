import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const sceneSource = readFileSync(resolve(projectRoot, "client/src/pages/ImmersiveScene.tsx"), "utf8");
const serviceWorkerSource = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");

describe("contrato crítico da cena imersiva", () => {
  it("mantém currículo protegido fora do cache do navegador", () => {
    expect(serviceWorkerSource).toContain("if (url.pathname.startsWith('/api/trpc')) return;");
  });

  it("abre o diálogo pelo gesto principal e mantém o fechamento do cartão ativo", () => {
    expect(sceneSource).toContain("const startDialog = useCallback((scene: Scene) => {");
    expect(sceneSource).toContain("onClick={(e) => { e.stopPropagation(); startDialog(selectedScene); }}");
    expect(sceneSource).toContain("setActiveHotspot(null);");
    expect(sceneSource).toContain("setDlgStep(0)");
  });

  it("mantém Pareto como painel independente e acionável", () => {
    expect(sceneSource).toContain("const [paretoOpen, setParetoOpen] = useState(false);");
    expect(sceneSource).toContain("onClick={() => setParetoOpen(true)}");
    expect(sceneSource).toContain("isOpen={paretoOpen}");
  });

  it("exige ação explícita para a voz de James", () => {
    expect(sceneSource).toContain("▶ Ouvir James");
    expect(sceneSource).toContain("Voz de James pronta. Toque em Ouvir James para iniciar.");
    expect(sceneSource).toContain("await audio.play()");
  });
});
