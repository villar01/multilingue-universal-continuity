import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de adjetivos qualificativos e cores do Livro SOS", () => {
  it("preserva posição, inventário, frases-modelo e cores em contexto", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Adjetivos qualificativos e cores");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("Horacio is a tall man.");
    expect(examples).toContain("The blue car is outside.");
    expect(examples).toContain("My father is an honest man.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
