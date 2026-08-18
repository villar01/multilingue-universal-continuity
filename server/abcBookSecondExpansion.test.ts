import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("segundo bloco ampliado do Livro ABC", () => {
  it("acrescenta folhas completas de casa, cidade, alimentação, viagem, saúde e comunicação", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    expect(book.progressiveLessons.length).toBeGreaterThanOrEqual(63);
    expect(book.progressiveLessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "Partes da casa",
      "Perguntar pelo caminho",
      "Pedir comida e bebida",
      "Hotel e reserva",
      "Conselho simples com should",
      "Revisão: conte uma pequena história",
    ]));
    expect(book.progressiveLessons.every((lesson) => lesson.examples.length >= 3 && lesson.answer.length > 0 && lesson.writingPrompt.length > 20)).toBe(true);
  });
});
