import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de negações, perfect e pronomes reflexivos do Livro SOS", () => {
  it("mantém a progressão do original e corrige perfect negativo e usos de -self", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Negações, perfect e pronomes reflexivos");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("We hadn't climbed the mountain.");
    expect(examples.some((target) => target.includes("hadn't climb the mountain"))).toBe(false);
    expect(examples).toContain("The teacher herself answered the question.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
