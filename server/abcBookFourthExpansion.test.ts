import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("quarto bloco ampliado do Livro ABC", () => {
  it("acrescenta folhas de trabalho, opinião, passado, futuro, comunidade e projetos pessoais", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    expect(book.progressiveLessons.length).toBeGreaterThanOrEqual(87);
    expect(book.progressiveLessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "Funções e lugares de trabalho",
      "Dar uma opinião com motivo",
      "Perguntas no passado",
      "Plano com going to",
      "Resolver uma reclamação",
      "Projeto final: uma apresentação",
    ]));
  });
});
