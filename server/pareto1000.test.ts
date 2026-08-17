import { describe, expect, it } from "vitest";
import { getParetoProgramWords, PARETO_PROGRAM_WORD_COUNT, TOTAL_PARETO_WORDS } from "./curriculum/paretoContent";

describe("Programa Pareto de mil palavras", () => {
  it("expõe termos ingleses únicos sem misturar progresso de entradas legadas repetidas", () => {
    const program = getParetoProgramWords();
    expect(TOTAL_PARETO_WORDS).toBe(PARETO_PROGRAM_WORD_COUNT);
    expect(program.length).toBe(PARETO_PROGRAM_WORD_COUNT);
    expect(new Set(program.map((word) => word.id)).size).toBe(program.length);
    expect(new Set(program.map((word) => word.enUS.toLocaleLowerCase())).size).toBe(program.length);
    expect(program.length).toBe(1000);
  });

  it("mantém sentido, pronúncia e exemplo para cada palavra do ciclo escrito", () => {
    expect(getParetoProgramWords().every((word) => Boolean(word.enUS && word.ptBR && word.pronunciation && word.example))).toBe(true);
  });
});
