import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("segundo bloco fiel de numeração e horas do Livro SOS", () => {
  it("preserva a sequência números–composição–uso real–horas–calendário e adiciona Pareto por folha", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    const titles = book.progressiveLessons.map((lesson) => lesson.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Números de um a dez: contar e reconhecer",
      "Dezenas, centenas e milhares: formar um número",
      "Preço, telefone, página e endereço",
      "Hora cheia e meia hora",
      "Minutos passados e minutos para a próxima hora",
      "Dia, mês e horário em um compromisso",
    ]));

    const numberAndTimeLeaves = book.progressiveLessons.filter((lesson) => [
      "Números de um a dez: contar e reconhecer",
      "Dezenas, centenas e milhares: formar um número",
      "Preço, telefone, página e endereço",
      "Hora cheia e meia hora",
      "Minutos passados e minutos para a próxima hora",
      "Dia, mês e horário em um compromisso",
    ].includes(lesson.title));

    expect(numberAndTimeLeaves).toHaveLength(6);
    expect(numberAndTimeLeaves.every((lesson) => lesson.examples.length === 3 && lesson.paretoPrompt.startsWith("No Pareto"))).toBe(true);
    expect(numberAndTimeLeaves.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("twenty-one"))).toBe(true);
    expect(numberAndTimeLeaves.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("quarter past seven"))).toBe(true);
  });
});
