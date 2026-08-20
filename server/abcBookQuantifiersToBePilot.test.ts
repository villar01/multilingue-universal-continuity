import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de alimentos, quantificadores e auxiliares do Livro SOS", () => {
  it("mantém a sequência de quantidade, existência, be e can com Pareto separado", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const titles = book.progressiveLessons.map((lesson) => lesson.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Alimentos contáveis e não contáveis",
      "Some, any e no em contexto",
      "There is: existe uma coisa ou uma quantidade não contável",
      "There are: existem várias coisas",
      "Be no presente: am, is e are",
      "Be no passado: was e were",
      "Can: habilidade, possibilidade e permissão",
      "Prática integrada: preparar uma mesa",
    ]));

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Alimentos, quantidade e auxiliares");
    expect(block).toHaveLength(8);
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && lesson.scrambled.length >= 3 && Boolean(lesson.answer))).toBe(true);
    expect(block.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("She cans"))).toBe(false);
    expect(block.flatMap((lesson) => lesson.examples).some((example) => example.target.includes("There is no salt"))).toBe(true);
  });
});
