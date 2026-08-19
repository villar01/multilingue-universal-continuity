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
});
