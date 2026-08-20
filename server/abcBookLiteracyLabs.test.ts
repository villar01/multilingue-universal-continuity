import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("Laboratórios de leitura e ordenação do Livro ABC", () => {
  it("mantém quinze laboratórios autorais depois da expansão de números e horas", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.progressiveLessons).toHaveLength(202);
    const labs = book.progressiveLessons.filter((lesson) => lesson.section === "Laboratório de leitura e escrita");
    expect(labs).toHaveLength(15);
    expect(labs.map((lesson) => lesson.title)).toContain("Ler uma rotina completa");
    expect(labs.map((lesson) => lesson.title)).toContain("Revisar a ordem de uma frase longa");
    expect(labs.every((lesson) => lesson.scrambled.length >= 6 && Boolean(lesson.answer) && Boolean(lesson.paretoPrompt))).toBe(true);
  });
});
