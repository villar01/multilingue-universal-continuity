import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("folhas de estrutura e escrita do Livro ABC", () => {
  it("amplia a sequência inicial da frase até a produção curta", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.sections.length).toBeGreaterThanOrEqual(17);
    expect(book.sections.map((section) => section.title)).toEqual(expect.arrayContaining([
      "Monte a frase em blocos",
      "Faça perguntas com do e does",
      "Negue com do not e does not",
      "Ligue duas ideias",
      "Escreva um pequeno retrato",
    ]));
    expect(book.sections.filter((section) => section.paretoPrompt).length).toBeGreaterThanOrEqual(10);
    expect(book.sections.every((section) => section.text.length > 80 && section.example.includes(" "))).toBe(true);
  });
});
