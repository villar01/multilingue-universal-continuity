import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sceneSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);

describe("modo de imersão da cena", () => {
  it("oculta auxiliares nativos e preserva idioma-alvo, fechamento e saída", () => {
    expect(sceneSource).toContain("{!immersionMode && getDlgTranslation(activeSceneDialog[dlgStep])");
    expect(sceneSource).toContain("{dlgFeedback && (");
    expect(sceneSource).not.toContain("{!immersionMode && dlgFeedback &&");
    expect(sceneSource).toContain("{!immersionMode && canUseAuthorizedSceneInteractions && <>");
    expect(sceneSource).toContain("{immersionMode ? \"?\" : `Ouvir ajuda ${nativeLangLabel}`}");
    expect(sceneSource).toContain('aria-label="Ouvir ajuda na língua nativa"');
    expect(sceneSource).toContain(">Estudar idioma</div>");
    expect(sceneSource).not.toContain("immersionTargetLanguageLabel");
    expect(sceneSource).toContain("{isAuthenticated");
    expect(sceneSource).toContain('"Ativar acesso para iniciar"');
    expect(sceneSource).toContain('immersionMode ? `🔊 ${targetUI.listen}` : `🔊 Ouvir apresentação de ${(teachingScene ?? selectedScene).teacherName}`');
    expect(sceneSource).toContain('immersionMode ? `${targetUI.next} →` : "Próxima →"');
    expect(sceneSource).toContain("{dialogAuthRequired && !isAuthenticated && (");
    expect(sceneSource).toContain("← Voltar");
    expect(sceneSource).toContain("Fechar");
  });
});
