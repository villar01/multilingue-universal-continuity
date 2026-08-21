import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const sceneSource = readFileSync(resolve(projectRoot, "client/src/pages/ImmersiveScene.tsx"), "utf8");
const serviceWorkerSource = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");
const startDialogIndex = sceneSource.indexOf("const startDialog = useCallback((scene: Scene) => {");
const startDialogBlock = sceneSource.slice(startDialogIndex, sceneSource.indexOf("  useEffect(() => {", startDialogIndex));

describe("contrato crítico da cena imersiva", () => {
  it("mantém currículo protegido fora do cache do navegador", () => {
    expect(serviceWorkerSource).toContain("if (url.pathname.startsWith('/api/trpc')) return;");
  });

  it("fecha cartão e áudio de objeto antes de abrir o diálogo pelo gesto principal", () => {
    expect(sceneSource).toContain("const startDialog = useCallback((scene: Scene) => {");
    expect(sceneSource).toContain("if (!isAuthenticated) {");
    expect(sceneSource).toContain("setDialogAuthRequired(true);");
    expect(sceneSource).toContain("Ative o acesso protegido para iniciar o diálogo desta cena.");
    expect(sceneSource).toContain("startDialog(selectedScene);");
    expect(startDialogBlock).toContain("setActiveHotspot(null);");
    expect(startDialogBlock).toContain("setPracticeHotspot(null);");
    expect(startDialogBlock).toContain("stopTeacherAudio();");
    expect(startDialogBlock.indexOf("setActiveHotspot(null);")).toBeLessThan(startDialogBlock.indexOf("setDlgOpen(true)"));
    expect(startDialogBlock.indexOf("stopTeacherAudio();")).toBeLessThan(startDialogBlock.indexOf("setDlgOpen(true)"));
  });

  it("mantém o comando Iniciar Diálogo acima do cartão de vocabulário aberto", () => {
    expect(sceneSource).toContain('className="immersive-start-dialog absolute z-[80]');
    expect(sceneSource).toContain('className="absolute z-50 rounded-2xl shadow-2xl overflow-hidden"');
    expect(sceneSource).toContain('top: "108px", left: "50%"');
    expect(sceneSource).toContain('.immersive-start-dialog { top: 108px !important; bottom: auto !important; }');
  });

  it("mantém Pareto como painel independente e acionável somente com material autorizado", () => {
    expect(sceneSource).toContain("const [paretoOpen, setParetoOpen] = useState(false);");
    expect(sceneSource).toContain("onClick={() => setParetoOpen(true)}");
    expect(sceneSource).toContain("isOpen={hasAuthorizedSceneMaterial && paretoOpen}");
    expect(sceneSource).toContain("if (!hasAuthorizedSceneMaterial) setParetoOpen(false);");
  });

  it("preserva o seletor avançado de voz fora da faixa estreita da cena", () => {
    expect(sceneSource).toContain('<div className="hidden sm:block">');
    expect(sceneSource).toContain("<VoiceSelector");
  });

  it("mantém o modo imersão como controle compacto no cabeçalho da cena", () => {
    expect(sceneSource).toContain("<ImmersionModeToggle compact />");
  });

  it("exige ação explícita para a voz de James", () => {
    expect(sceneSource).toContain("▶ Ouvir James");
    expect(sceneSource).toContain("Voz de James pronta. Toque em Ouvir James para iniciar.");
    expect(sceneSource).toContain("await audio.play()");
  });
});
