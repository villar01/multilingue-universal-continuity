import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("exame final e gabarito revisado do Livro SOS", () => {
  it("preserva tradução, lacunas e respostas corrigidas", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");
    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Exame final e gabarito revisado");
    expect(block).toHaveLength(4);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("I need to speak English before March. → Preciso falar inglês antes de março.");
    expect(examples).toContain("Do you speak English?");
    expect(examples).toContain("The flowers need sun and water to live.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
