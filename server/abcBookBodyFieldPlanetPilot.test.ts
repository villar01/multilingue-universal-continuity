import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de corpo humano, campo e planeta do Livro SOS", () => {
  it("preserva domínios temáticos, plurais contextuais e fenômenos naturais", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");
    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Corpo humano, campo e planeta");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("Children have twenty baby teeth.");
    expect(examples).toContain("The farmer cultivates corn on the farm.");
    expect(examples).toContain("Lightning and thunder often come during a storm.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
