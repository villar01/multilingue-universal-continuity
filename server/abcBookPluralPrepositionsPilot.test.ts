import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de plural e preposições do Livro SOS", () => {
  it("preserva regra, exceção, contraste de uso e aplicação com Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Plural regular: -s e -es",
      "Plural com mudança e plural irregular",
      "Preposições: at, in, on e to",
      "Preposições de posição e origem",
      "Aplicação: plural e lugar em frases",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(5);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("children"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("on the table"))).toBe(true);
  });
});
