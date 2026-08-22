import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("acessibilidade do modo imersão", () => {
  it("mantém o seletor da cena independente de resolvedores opcionais durante a recuperação de estabilidade", () => {
    const sceneSource = fs.readFileSync(
      path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"),
      "utf8",
    );

    expect(sceneSource).not.toContain("getImmersionTargetLanguageLabel");
    expect(sceneSource).toContain('title="Mudar idioma a estudar"');
    expect(sceneSource).toContain(">Estudar idioma</div>");
  });

  it("usa rótulos no idioma-alvo e oculta auxiliares nativos sem remover ajuda ou saída", () => {
    const sceneSource = fs.readFileSync(
      path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"),
      "utf8",
    );
    const toggleSource = fs.readFileSync(
      path.resolve(import.meta.dirname, "../client/src/components/ImmersionModeToggle.tsx"),
      "utf8",
    );

    expect(sceneSource).toContain('const targetUI = getUIStrings(profile.targetCode)');
    expect(sceneSource).toContain('immersionMode ? `${targetUI.next} →`');
    expect(sceneSource).toContain('!immersionMode && localizedSceneDialogueQuery.data?.status === "ready"');
    expect(sceneSource).toContain('immersionMode ? "?" : `Ouvir ajuda ${nativeLangLabel}`');
    expect(sceneSource).toContain('immersionMode ? targetUI.cancel : "Fechar"');
    expect(toggleSource).toContain('{targetUI.immersive}');
    expect(toggleSource).not.toContain('"Modo imersão"');
  });
});
