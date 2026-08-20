import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de advérbios, produção e viagens do Livro SOS", () => {
  it("preserva a progressão lista, frase, produção e viagem com correções verificáveis", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Advérbios, produção guiada e viagens");
    expect(block).toHaveLength(5);
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("My mother cooks as well as my grandmother.");
    expect(examples).toContain("Please fasten your seat belt.");
    expect(examples.some((target) => target.includes("coffe shop") || target.includes("seat bealts"))).toBe(false);
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
