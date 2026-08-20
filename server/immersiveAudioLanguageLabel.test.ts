import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(
  path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);

describe("rótulos de áudio da Cena Imersiva", () => {
  it("deriva os controles de áudio do idioma efetivamente selecionado", () => {
    expect(source).toContain("function getSpokenLanguageLabel(languageCode: string)");
    expect(source).toContain("Ouvir ${getSpokenLanguageLabel(selectedScene?.teacherLang || targetLang)}");
    expect(source).toContain("Áudio da fala em ${getSpokenLanguageLabel(selectedScene?.teacherLang || targetLang)}");
    expect(source).toContain("Ouvir frase em {getSpokenLanguageLabel(langCode)}");
  });

  it("não mantém rótulos fixos de áudio em inglês", () => {
    expect(source).not.toContain("Ouvir inglês");
    expect(source).not.toContain("Preparando inglês…");
    expect(source).not.toContain("Áudio da fala em inglês");
  });
});
