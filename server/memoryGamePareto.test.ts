import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/MemoryGameLesson.tsx", import.meta.url), "utf8");

describe("jogos de memorização com ciclo Pareto", () => {
  it("disponibiliza o ciclo completo como modo da lição", () => {
    expect(source).toContain('type GameMode = "flashcards" | "match-pairs" | "fill-blank" | "pareto"');
    expect(source).toContain("Ciclo Pareto");
    expect(source).toContain("ParetoPracticeCycle");
    expect(source).toContain("Próxima palavra Pareto");
  });

  it("envia a palavra pelo TTS neural do idioma da lição e aplica CEFR por nível", () => {
    expect(source).toContain("voiceLang: languageCode");
    expect(source).toContain("level={resolvePracticeCEFRLevel(level)}");
  });
});
