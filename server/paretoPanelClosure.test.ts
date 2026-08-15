import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const panelPath = path.resolve(process.cwd(), "client/src/components/ParetoPanel.tsx");
const panelSource = fs.readFileSync(panelPath, "utf8");

describe("fechamento acessível do painel Pareto", () => {
  it("expõe uma ação textual e nomeada para fechar o painel", () => {
    expect(panelSource).toContain('aria-label="Fechar vocabulário Pareto"');
    expect(panelSource).toContain('title="Fechar vocabulário Pareto"');
    expect(panelSource).toContain("<span>Fechar</span>");
  });

  it("encerra áudio e prática antes de devolver o controle à cena", () => {
    expect(panelSource).toContain("const closePanel = useCallback");
    expect(panelSource).toContain("practiceAudioRef.current.pause();");
    expect(panelSource).toContain("setPracticeWord(null);");
    expect(panelSource).toContain("onClick={closePanel}");
  });
});
