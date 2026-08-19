import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panelSource = readFileSync(new URL("../client/src/components/ParetoPanel.tsx", import.meta.url), "utf8");
const sceneSource = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");
const cycleSource = readFileSync(new URL("../client/src/components/ParetoPracticeCycle.tsx", import.meta.url), "utf8");

describe("prática Pareto no painel de vocabulário", () => {
  it("abre o ciclo de observação, recuperação, escrita e criação para cada palavra escolhida", () => {
    expect(panelSource).toContain("ParetoPracticeCycle");
    expect(panelSource).toContain("onPractice={() => setPracticeWord(word)}");
    expect(panelSource).toContain("Praticar: lembrar, escrever e criar frase");
  });

  it("mantém a prática em voz neural regional e recebe o nível CEFR da cena", () => {
    expect(panelSource).not.toContain("speakNaturalVoice");
    expect(panelSource).toContain("voiceLang: targetLang, gender: voiceGender");
    expect(sceneSource).toContain('practiceLevel={selectedScene ? sceneCefrLevel(selectedScene) : "A1"}');
  });

  it("mantém o retorno pedagógico legível sobre fundo claro", () => {
    expect(cycleSource).toContain("border-amber-200 bg-amber-50");
    expect(cycleSource).toContain("text-amber-950");
    expect(cycleSource).not.toContain("bg-white/10 p-2 text-sm text-amber-100");
  });
});
