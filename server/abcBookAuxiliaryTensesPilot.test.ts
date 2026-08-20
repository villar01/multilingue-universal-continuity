import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("bloco de auxiliares e tempos verbais do Livro SOS", () => {
  it("separa auxiliares, modais, perfect e contínuo com exemplos corrigidos", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    const block = book.progressiveLessons.filter((lesson) => lesson.section === "Auxiliares, modais e tempos em contexto");
    expect(block).toHaveLength(6);
    expect(block.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "Do, does e did: auxiliar não substitui o verbo",
      "Will e would: futuro não é a única função",
      "Have, has e had: posse, obrigação e experiência",
      "Be + -ing: ação em andamento",
    ]));
    const examples = block.flatMap((lesson) => lesson.examples.map((example) => example.target));
    expect(examples).toContain("They were waiting for the bus.");
    expect(examples.some((target) => target.includes("They were waiting the bus"))).toBe(false);
    expect(block.every((lesson) => Boolean(lesson.paretoPrompt) && Boolean(lesson.answer))).toBe(true);
  });
});
