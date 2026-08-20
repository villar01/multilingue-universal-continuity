import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de phrasal verbs e idioms do Livro SOS", () => {
  it("preserva expressões, verbos-base e significado contextual", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");
    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Phrasal verbs e idioms");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("We have to call off the meeting.");
    expect(examples).toContain("We need to get in touch with the manager.");
    expect(examples).toContain("Look over the contract before you sign it.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
