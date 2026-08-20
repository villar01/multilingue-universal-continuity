import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de preposições, phrasal verbs e conjunções do Livro SOS", () => {
  it("mantém inventário, contraste de uso, verbos com partículas e conectores com correções verificáveis", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Preposições, phrasal verbs e conjunções");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("I will be there in a few minutes.");
    expect(examples).toContain("Please take the dog away from the kitchen.");
    expect(examples.some((target) => target.includes("in few minutes") || target.includes("Take away that dog"))).toBe(false);
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
