import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco ampliado de pronúncia do Livro ABC", () => {
  it("entrega padrões sonoros graduais protegidos para PT-BR→inglês", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.soundLessons.length).toBeGreaterThanOrEqual(11);
    expect(book.soundLessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "I curto e I longo",
      "TH de thank e this",
      "R, L e final da palavra",
    ]));
    expect(book.soundLessons.every((lesson) => lesson.examples.length >= 3 && lesson.writingPrompt.length > 20)).toBe(true);
  });
});
