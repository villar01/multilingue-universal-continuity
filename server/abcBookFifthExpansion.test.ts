import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco final da expansão inicial do Livro ABC", () => {
  it("ultrapassa 167 folhas próprias sem contar Pareto e entrega produção ampla", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    expect(book.progressiveLessons.length).toBeGreaterThanOrEqual(125);
    expect(book.progressiveLessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "Ouvir antes de repetir",
      "Perguntas no passado",
      "Escrever um e-mail simples",
      "Projeto final: uma apresentação",
      "Revisão geral do volume",
      "Próximo passo de autonomia",
    ]));
  });
});
