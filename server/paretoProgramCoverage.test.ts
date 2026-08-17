import { describe, expect, it } from "vitest";
import { PARETO_CORE_ADDITIONS } from "./curriculum/paretoCoreAdditions";
import { PARETO_PROGRAM_WORD_COUNT, PARETO_VOCAB, getParetoProgramWords } from "./curriculum/paretoContent";

const normalizedEnglish = (word: string) => word.trim().toLocaleLowerCase("en-US");

describe("cobertura canônica do programa Pareto", () => {
  it("inclui o lote autoral de 220 termos funcionais", () => {
    expect(PARETO_CORE_ADDITIONS).toHaveLength(220);
    expect(new Set(PARETO_CORE_ADDITIONS.map((word) => normalizedEnglish(word.enUS))).size).toBe(220);
    expect(PARETO_CORE_ADDITIONS.every((word) => word.example.trim() && word.examplePt.trim())).toBe(true);
  });

  it("entrega exatamente mil formas inglesas únicas para a primeira trilha", () => {
    const program = getParetoProgramWords();
    expect(PARETO_PROGRAM_WORD_COUNT).toBe(1000);
    expect(PARETO_VOCAB).toHaveLength(1000);
    expect(new Set(PARETO_VOCAB.map((word) => normalizedEnglish(word.enUS))).size).toBe(1000);
    expect(program).toHaveLength(1000);
    expect(new Set(program.map((word) => normalizedEnglish(word.enUS))).size).toBe(1000);
    expect(new Set(program.map((word) => word.id)).size).toBe(1000);
  });
});
