import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const arModeSource = readFileSync(new URL("../client/src/pages/ARMode.tsx", import.meta.url), "utf8");
const arVocabularySource = readFileSync(new URL("../client/src/components/ARVocabulary.tsx", import.meta.url), "utf8");

describe("vocabulário AR com voz regional e ciclo Pareto", () => {
  it("usa o locale-alvo selecionado em vez de fixar en-US para objetos AR", () => {
    expect(arModeSource).toContain("voiceLang: targetLangCode");
    expect(arModeSource).toContain("languageCode={targetLangCode}");
    expect(arModeSource).not.toContain('voiceLang: "en-US"');
  });

  it("oferece o ciclo Pareto para o objeto AR ativo", () => {
    expect(arVocabularySource).toContain("ParetoPracticeCycle");
    expect(arVocabularySource).toContain("Praticar ciclo Pareto");
    expect(arVocabularySource).toContain("term={{ word: currentWord.word, translation: currentWord.translation");
    expect(arVocabularySource).toContain('level="A1"');
  });
});
