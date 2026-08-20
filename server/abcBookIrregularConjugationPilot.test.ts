import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("piloto de conjugação de irregulares do Livro ABC", () => {
  it("mantém presente por pessoa, passado sem did e exercício de combinação", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("Edição pt-BR → en-US indisponível");

    const titles = book.progressiveLessons.map((lesson) => lesson.title);
    expect(titles).toContain("Irregular por pessoa: drink e drive");
    expect(titles).toContain("Verbos irregulares: combinar, conferir e usar");

    const conjugation = book.progressiveLessons.find((lesson) => lesson.title === "Irregular por pessoa: drink e drive");
    expect(conjugation?.languageFocus).toContain("she drinks");
    expect(conjugation?.examples.some((example) => example.target.includes("We drank"))).toBe(true);
    expect(conjugation?.examples.some((example) => example.target.includes("did drank"))).toBe(false);

    const matching = book.progressiveLessons.find((lesson) => lesson.title === "Verbos irregulares: combinar, conferir e usar");
    expect(matching?.languageFocus).toContain("write–wrote–written");
    expect(matching?.paretoPrompt).toContain("write/wrote/written");
  });
});
