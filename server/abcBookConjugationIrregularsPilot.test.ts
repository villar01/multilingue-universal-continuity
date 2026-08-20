import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("conjugação e irregulares", () => {
  it("corrige o uso de did e introduz padrões irregulares com Pareto", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;
    const lessons = book.progressiveLessons.filter((lesson) => lesson.section === "Conjugação e tempos");
    expect(lessons).toHaveLength(2);
    expect(lessons[0].explanation).toContain("não usa auxiliar");
    expect(lessons[1].languageFocus).toContain("drink–drank–drunk");
    expect(lessons.every((lesson) => lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
  });
});
