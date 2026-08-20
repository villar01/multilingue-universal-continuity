import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de comparativos e superlativos do Livro SOS", () => {
  it("separa formas curtas, longas, irregulares e prática contextual", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Comparativos e superlativos");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("This book is more interesting than that one.");
    expect(examples).toContain("Kate is the most intelligent girl in the class.");
    expect(examples).toContain("This is the best option for today.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
