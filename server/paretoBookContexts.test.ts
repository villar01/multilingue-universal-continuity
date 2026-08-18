import { describe, expect, it } from "vitest";
import { getParetoBookContext, getParetoBookContextWords, PARETO_BOOK_CONTEXTS } from "./curriculum/paretoBookContexts";

describe("Pareto ligado ao Livro ABC", () => {
  it("preserva contextos de livro com estrutura e recuperação próprias", () => {
    expect(PARETO_BOOK_CONTEXTS.family.grammarFocus).toContain("my");
    expect(PARETO_BOOK_CONTEXTS.family.orderAnswer).toBe("My family is small.");
    expect(PARETO_BOOK_CONTEXTS["social-circle"].recallPrompt).toContain("círculo social");
    expect(PARETO_BOOK_CONTEXTS["routine-time"].orderAnswer).toBe("I study English every morning.");
    expect(PARETO_BOOK_CONTEXTS.home.orderAnswer).toBe("I cook in the kitchen.");
    expect(PARETO_BOOK_CONTEXTS.transport.orderAnswer).toBe("I take the bus to the station.");
  });

  it("resolve apenas palavras canônicas do programa Pareto para cada contexto", () => {
    const familyWords = getParetoBookContextWords("family");
    expect(familyWords).toHaveLength(PARETO_BOOK_CONTEXTS.family.wordIds.length);
    expect(familyWords?.every((word) => word.id.startsWith("pareto-"))).toBe(true);
    expect(familyWords?.map((word) => word.enUS)).toContain("Family");
    expect(getParetoBookContextWords("routine-time")).toHaveLength(PARETO_BOOK_CONTEXTS["routine-time"].wordIds.length);
    expect(getParetoBookContextWords("home")).toHaveLength(PARETO_BOOK_CONTEXTS.home.wordIds.length);
    expect(getParetoBookContextWords("transport")).toHaveLength(PARETO_BOOK_CONTEXTS.transport.wordIds.length);
    expect(getParetoBookContextWords("unknown-context")).toBeNull();
    expect(getParetoBookContext("social-circle")?.title).toBe("Círculo social");
  });
});
