import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getImmersionTargetLanguageLabel } from "../client/src/lib/immersionTargetLanguageLabel";
import { AVAILABLE_LANGUAGES } from "../client/src/lib/languages";

describe("acessibilidade do modo imersão", () => {
  it("usa rótulo do idioma-alvo sem fallback fixo em inglês", () => {
    expect(getImmersionTargetLanguageLabel("es-ES", "Español")).toBe("Cambiar idioma de estudio");
    expect(getImmersionTargetLanguageLabel("fr-FR", "Français")).toBe("Changer la langue d’étude");
    expect(getImmersionTargetLanguageLabel("pt-BR", "Português")).toBe("Mudar idioma de estudo");
    expect(getImmersionTargetLanguageLabel("ja-JP", "日本語")).toBe("日本語");
  });

  it("oferece um rótulo legível para todos os idiomas ativos", () => {
    expect(AVAILABLE_LANGUAGES).toHaveLength(58);

    for (const language of AVAILABLE_LANGUAGES) {
      const label = getImmersionTargetLanguageLabel(language.code, language.name);
      expect(label.trim().length).toBeGreaterThan(0);
      expect(label).not.toBe(language.code);
    }
  });

  it("conecta o resolvedor dinâmico ao seletor da cena", () => {
    const sceneSource = fs.readFileSync(
      path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"),
      "utf8",
    );

    expect(sceneSource).toContain("const immersionTargetLanguageLabel = getImmersionTargetLanguageLabel(targetLang, currentLangInfo.name);");
    expect(sceneSource).toContain('title={immersionMode ? immersionTargetLanguageLabel : "Mudar idioma a estudar"}');
  });
});
