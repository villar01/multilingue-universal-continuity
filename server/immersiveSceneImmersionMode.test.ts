import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sceneSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);

describe("modo de imersão da cena", () => {
  it("oculta auxiliares nativos e preserva idioma-alvo, fechamento e saída", () => {
    expect(sceneSource).toContain("{!immersionMode && getDlgTranslation(selectedScene.dialog[dlgStep])");
    expect(sceneSource).toContain("{!immersionMode && dlgFeedback &&");
    expect(sceneSource).toContain("{!immersionMode && <>");
    expect(sceneSource).toContain("{immersionMode ? \"?\" : `Ouvir ajuda ${nativeLangLabel}`}");
    expect(sceneSource).toContain('aria-label="Ouvir ajuda na língua nativa"');
    expect(sceneSource).toContain("{immersionMode ? \"Target language\" : \"Estudar idioma\"}");
    expect(sceneSource).toContain("{immersionMode ? \"💬 Start dialogue\" : \"💬 Iniciar Diálogo\"}");
    expect(sceneSource).toContain("{immersionMode ? \"Next →\" : \"Próxima →\"}");
    expect(sceneSource).toContain("{dialogAuthRequired && !isAuthenticated && (");
    expect(sceneSource).toContain("← Voltar");
    expect(sceneSource).toContain("Fechar");
  });
});
