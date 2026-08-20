import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de consolidação do primeiro volume ABC", () => {
  it("permanece disponível depois da ampliação do livro sem contar o Pareto", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    expect(book.progressiveLessons.length).toBe(252);
    expect(book.progressiveLessons.map((item) => item.title)).toEqual(expect.arrayContaining([
      "Da frase curta ao parágrafo",
      "Compreender uma história curta",
      "Plano pessoal de continuidade",
    ]));
    expect(book.progressiveLessons.slice(-12).every((item) => item.paretoPrompt.length > 0)).toBe(true);
  });
});
