import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco fiel de demonstrativos e posse do Livro SOS", () => {
  it("preserva demonstrativos, possessivos, perguntas e prática contextual com Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Demonstrativos: this, that, these e those",
      "Possessivos antes do nome: de quem é?",
      "Possessivos sem nome: mine, yours, hers e theirs",
      "Whose, who, what e which: perguntar com objetivo",
      "Objetos, donos e perguntas em uma cena",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(5);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("Whose coffee is that?"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("This book is mine."))).toBe(true);
  });
});
