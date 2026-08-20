import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de saudações, despedidas e calendário do Livro SOS", () => {
  it("preserva registro comunicativo, dias, meses e estações com contexto", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Saudações, despedidas e calendário");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("Nice to meet you, Mr. Brown.");
    expect(examples).toContain("I have to work on Saturday.");
    expect(examples).toContain("I will go to Mexico next winter.");
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
