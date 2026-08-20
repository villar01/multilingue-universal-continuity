import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de verbos regulares do Livro SOS", () => {
  it("preserva verbo-base, passado, particípio, contexto e Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Verbo-base, passado e particípio",
      "Como a escrita muda em verbos regulares",
      "Ações úteis em contextos reais",
      "Passado simples e particípio não têm a mesma função",
      "Aplicação: relato curto de uma atividade",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(5);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("study → studied"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("I have visited"))).toBe(true);
  });
});
