import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const panelPath = path.resolve(process.cwd(), "client/src/components/ParetoPanel.tsx");
const cyclePath = path.resolve(process.cwd(), "client/src/components/ParetoPracticeCycle.tsx");
const panelSource = fs.readFileSync(panelPath, "utf8");
const cycleSource = fs.readFileSync(cyclePath, "utf8");

describe("ciclo Pareto guiado por cena", () => {
  it("explica as etapas e apresenta o progresso da cena", () => {
    expect(panelSource).toContain("Como praticar esta cena");
    expect(panelSource).toContain("Progresso da cena:");
    expect(panelSource).toContain("Começar ciclo da cena");
  });

  it("avança para a próxima palavra e mostra conclusão real", () => {
    expect(panelSource).toContain("const practiceNextSceneWord");
    expect(cycleSource).toContain("Memória concluída:");
    expect(cycleSource).toContain("Praticar próxima palavra");
    expect(cycleSource).toContain("onComplete?.();");
  });
});
