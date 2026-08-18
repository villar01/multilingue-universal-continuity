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

  it("entrega um manual contínuo de método antes dos capítulos e exercícios", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.manualLeaves).toHaveLength(12);
    expect(book.manualLeaves.map((leaf) => leaf.title)).toEqual(expect.arrayContaining([
      "Estude uma ideia inteira, não uma lista isolada",
      "Agrupe palavras que vivem na mesma situação",
      "Leia para encontrar uma ideia, depois observe como ela foi montada",
      "Junte vocabulário, estrutura e intenção em uma pequena conversa",
    ]));
    expect(book.manualLeaves.every((leaf) => leaf.paragraphs.length === 2 && leaf.model.length > 20 && leaf.practice.length > 30)).toBe(true);
  });

  it("entrega duas perguntas de compreensão revisadas em cada capítulo A1", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.chapters).toHaveLength(10);
    expect(book.chapters.every((chapter) => chapter.comprehensionQuestions.length >= 2)).toBe(true);
    expect(book.chapters.flatMap((chapter) => chapter.comprehensionQuestions).every((question) => question.prompt.trim() && question.options.length >= 3 && question.explanation.trim())).toBe(true);
  });

  it("mantém a cartilha como fonte principal antes da revisão Pareto", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });

    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.chapters.every((chapter) => (
      chapter.reading.trim().length > 80
      && chapter.translation.trim().length > 80
      && chapter.grammarTitle.trim()
      && chapter.grammarExplanation.trim().length > 80
      && chapter.comprehensionQuestions.length >= 2
      && chapter.writingPrompt.trim().length > 30
      && chapter.orderingExercise.prompt.trim()
      && chapter.orderingExercise.answer.trim()
      && chapter.paretoChapter >= 1
    ))).toBe(true);
  });
});
