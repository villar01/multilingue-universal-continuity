import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("continuação de profissões e vocabulário da casa do Livro SOS", () => {
  it("mantém profissão em contexto e a progressão casa, quarto e banheiro com Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Reconhecer profissões em contexto",
      "Pessoa + profissão: formar frases",
      "A casa: cômodos e objetos do dia a dia",
      "Quarto e banheiro: itens pessoais",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(4);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("Ana is an artist."))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("toothbrush"))).toBe(true);
  });
});
