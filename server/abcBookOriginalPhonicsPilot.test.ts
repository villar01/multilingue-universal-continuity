import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("piloto fiel de alfabeto e sons do Livro SOS", () => {
  it("preserva a progressão letra–som–palavra–escrita, mas oferece ponte pt-BR e Pareto separados", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.alphabetLetters).toHaveLength(26);
    expect(book.soundLessons.length).toBeGreaterThanOrEqual(11);
    expect(book.soundLessons.every((lesson) => lesson.examples.length >= 3)).toBe(true);
    expect(book.soundLessons.every((lesson) => Boolean(lesson.nativeBridge?.trim()) && !lesson.nativeBridge?.includes("/"))).toBe(true);
    expect(book.soundLessons.every((lesson) => lesson.paretoPrompt?.startsWith("No Pareto"))).toBe(true);
  });
});
