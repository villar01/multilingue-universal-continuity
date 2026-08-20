import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("Laboratórios de leitura e ordenação do Livro ABC", () => {
  it("mantém quinze laboratórios autorais depois da expansão de números e horas", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.progressiveLessons).toHaveLength(168);
    expect(book.progressiveLessons.slice(-15).map((lesson) => lesson.title)).toContain("Ler uma rotina completa");
    expect(book.progressiveLessons.slice(-15).map((lesson) => lesson.title)).toContain("Revisar a ordem de uma frase longa");
    expect(book.progressiveLessons.slice(-15).every((lesson) => lesson.scrambled.length >= 6 && Boolean(lesson.answer) && Boolean(lesson.paretoPrompt))).toBe(true);
  });
});
