import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("referência auditiva nativa do Livro ABC", () => {
  it("entrega ao leitor explicações de som sem símbolos fonéticos técnicos", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;

    expect(book.alphabetLetters.every((letter) => !letter.guide.includes("/"))).toBe(true);
    expect(book.soundLessons.every((lesson) => !lesson.explanation.includes("/") && lesson.examples.every((example) => !example.pronunciation.includes("/")))).toBe(true);
    expect(book.termCard.pronunciation).toContain("Ouça a palavra em inglês nativo");
  });

  it("mostra botões de fala nativa e não renderiza campos de notação técnica", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ABCBook.tsx"), "utf8");
    expect(source).toContain('import { speakEdgeTTS } from "@/lib/edgeTTSClient";');
    expect(source).toContain("Ouvir inglês nativo");
    expect(source).not.toContain("{item.guide}");
    expect(source).not.toContain("{example.pronunciation}");
    expect(source).not.toContain("{book.termCard.pronunciation}");
    expect(source).not.toContain("{card.pronunciation}");
  });
});
