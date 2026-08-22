import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("painel compacto de diálogo da cena", () => {
  it("mantém o diálogo recolhido até solicitação explícita e evita largura de tela inteira", () => {
    expect(page).toContain('const [dlgExpanded, setDlgExpanded] = useState(false);');
    expect(page).toContain('setDialogAuthRequired(false);\n    // Toda nova abertura recomeça compacta para não encobrir professor, hotspots ou controles.\n    setDlgExpanded(false);\n    setDlgOpen(true);');
    expect(page).toContain('width: dlgExpanded ? "min(72vw, 860px)" : "min(92vw, 390px)"');
    expect(page).toContain('bottom: dlgExpanded ? "clamp(112px, 16vh, 150px)" : "18px"');
    expect(page).toContain('aria-expanded={dlgExpanded}');
  });

  it("mantém texto completo, pergunta e controles disponíveis apenas quando o painel é aberto", () => {
    expect(page).toContain('{dlgExpanded && <div className="mt-3">');
    expect(page).toContain("Pergunte ao professor sobre a fala atual, sua resposta, a cena ou uma palavra:");
    expect(page).toContain('immersionMode ? `🔊 ${targetUI.listen}` : `🔊 Ouvir resposta de ${(teachingScene ?? selectedScene).teacherName}`');
  });
});
