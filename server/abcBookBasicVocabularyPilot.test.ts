import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco fiel de vocabulário básico do Livro SOS", () => {
  it("preserva objetos, posse, pessoas e profissões com prática contextual e Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Objetos do armário: roupa e itens pessoais",
      "De quem são estas coisas?",
      "Pessoas, relações e pronomes",
      "Profissões e funções na comunidade",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(4);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("Whose hat is this?"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("firefighter"))).toBe(true);
  });
});
