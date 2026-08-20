import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("continuação de verbos regulares", () => {
  it("mantém verbos contextuais, passado regular e Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;
    const lessons = book.progressiveLessons.filter((lesson) => ["Decidir, comparar e organizar", "Comunicar e responder", "Produção: um registro de trabalho ou estudo"].includes(lesson.title));
    expect(lessons).toHaveLength(3);
    expect(lessons.every((lesson) => lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((item) => item.target.includes("decided"))).toBe(true);
  });
});
