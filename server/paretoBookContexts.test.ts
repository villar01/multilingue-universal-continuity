import { describe, expect, it } from "vitest";
import { getParetoBookContext, getParetoBookContextWords, PARETO_BOOK_CONTEXTS } from "./curriculum/paretoBookContexts";

describe("Pareto ligado ao Livro ABC", () => {
  it("preserva contextos de livro com estrutura e recuperação próprias", () => {
    expect(PARETO_BOOK_CONTEXTS.family.grammarFocus).toContain("my");
    expect(PARETO_BOOK_CONTEXTS.family.orderAnswer).toBe("My family is small.");
    expect(PARETO_BOOK_CONTEXTS["social-circle"].recallPrompt).toContain("círculo social");
  });

  it("resolve apenas palavras canônicas do programa Pareto para cada contexto", () => {
    const familyWords = getParetoBookContextWords("family");
    expect(familyWords).toHaveLength(PARETO_BOOK_CONTEXTS.family.wordIds.length);
    expect(familyWords?.every((word) => word.id.startsWith("pareto-"))).toBe(true);
    expect(familyWords?.map((word) => word.enUS)).toContain("Family");
    expect(getParetoBookContextWords("unknown-context")).toBeNull();
    expect(getParetoBookContext("social-circle")?.title).toBe("Círculo social");
  });
});
