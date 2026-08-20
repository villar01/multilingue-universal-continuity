import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de auxiliares e respostas curtas do Livro SOS", () => {
  it("preserva auxiliar, pergunta, resposta curta, frase desenvolvida e Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = [
      "Do e does: perguntas no presente",
      "Respostas curtas com do e does",
      "What, where e when em perguntas",
      "Did: perguntas sobre uma ação passada",
      "Aplicação: entrevista curta",
    ];
    const lessons = book.progressiveLessons.filter((lesson) => titles.includes(lesson.title));

    expect(lessons).toHaveLength(5);
    expect(lessons.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("Does she work"))).toBe(true);
    expect(lessons.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("Did you visit"))).toBe(true);
  });
});
