import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/DailyMemoryTrainer.tsx", import.meta.url), "utf8");

describe("treino diário com ciclo Pareto", () => {
  it("oferece o ciclo de recuperação ativa para a palavra do dia", () => {
    expect(source).toContain("ParetoPracticeCycle");
    expect(source).toContain("Praticar ciclo Pareto desta palavra");
    expect(source).toContain("term={{ word: currentCard.word, translation: currentCard.translation, example: currentCard.exampleSentence }}");
  });

  it("usa voz neural da variante regional ativa e aumenta o requisito por nível", () => {
    expect(source).toContain("voiceLang: activeVariant?.lang || languageCode");
    expect(source).toContain('level={level === "advanced" ? "C1" : level === "intermediate" ? "B1" : "A1"}');
  });
});
