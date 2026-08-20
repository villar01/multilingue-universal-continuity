import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("orientação de estrutura de frase no Livro SOS", () => {
  it("preserva sujeito, verbo e complemento sem copiar a ordem do português", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");
    expect(book.sentenceStructure.sharedPattern).toContain("sujeito + verbo + complemento");
    expect(book.sentenceStructure.englishPattern).toContain("I need water");
    expect(book.sentenceStructure.portuguesePattern).toContain("sujeito pode ficar implícito");
    expect(book.sentenceStructure.questionPattern).toContain("Do you need help?");
    const guidedProgression = book.manualLeaves.find((leaf) => leaf.model.includes("I study English at home"));
    expect(guidedProgression?.paragraphs.join(" ")).toContain("quem vive a ideia");
    expect(guidedProgression?.model).toContain("I study English");
  });
});
