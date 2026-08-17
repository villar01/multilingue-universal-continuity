import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const protectedContent = readFileSync(path.join(root, "server/curriculum/abcBookContent.ts"), "utf8");
const bookPage = readFileSync(path.join(root, "client/src/pages/ABCBook.tsx"), "utf8");

describe("ficha de termo do Livro ABC", () => {
  it("mantém os campos pedagógicos no contrato curricular protegido", () => {
    expect(protectedContent).toContain("termCard:");
    expect(protectedContent).toContain('term: "need"');
    expect(protectedContent).toContain("grammar:");
    expect(protectedContent).toContain("pronunciation:");
    expect(protectedContent).toContain("paretoPrompt:");
    expect(protectedContent).toContain("additionalTermCards:");
    expect(protectedContent).toContain('term: "help"');
    expect(protectedContent).toContain('term: "water"');
    expect(protectedContent).toContain('term: "where"');
    expect(protectedContent).toContain('term: "airport"');
    expect(protectedContent).toContain("A1_CHAPTERS");
    expect(protectedContent).toContain("STRUCTURED_A1_UNITS");
    expect(protectedContent).toContain("chapters: A1_CHAPTERS");
    expect(protectedContent).toContain("isPortugueseEnglish");
    expect(protectedContent).toContain("available: false");
  });

  it("renderiza a ficha simples a partir da entrega protegida, sem duplicar o termo no cliente", () => {
    expect(bookPage).toContain("Ficha de termo");
    expect(bookPage).toContain("book.termCard.term");
    expect(bookPage).toContain("book.termCard.paretoPrompt");
    expect(bookPage).toContain("book.additionalTermCards.map");
    expect(bookPage).toContain("book.chapters.map");
    expect(bookPage).toContain("Capítulos contínuos para estudar");
    expect(bookPage).toContain("chapter.writingPrompt");
    expect(bookPage).toContain("/base-de-estudos?unit=");
    expect(bookPage).toContain("if (!book.available)");
    expect(bookPage).toContain("Edição em preparação");
    expect(bookPage).not.toContain('const TERM_CARD');
  });
});
