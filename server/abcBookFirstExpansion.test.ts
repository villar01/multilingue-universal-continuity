import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("primeiro bloco ampliado do Livro ABC", () => {
  it("entrega folhas autorais adicionais de sons, palavras frequentes e contextos cotidianos", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    if (!book.available) throw new Error("A edição PT-BR → inglês precisa estar disponível");

    expect(book.progressiveLessons.length).toBeGreaterThanOrEqual(39);
    expect(book.progressiveLessons.map((lesson) => lesson.title)).toEqual(expect.arrayContaining([
      "C e G: um som pode mudar",
      "As pessoas da família",
      "Perguntar sobre hábitos",
      "Pronomes: quem aparece na frase",
      "Números de um a dez: contar e reconhecer",
      "Hora cheia e meia hora",
      "Uma mensagem curta e clara",
      "Da palavra ao pequeno texto",
    ]));
    expect(book.progressiveLessons.every((lesson) => lesson.examples.length >= 3 && lesson.answer.length > 0 && lesson.paretoPrompt.length > 0)).toBe(true);
  });

  it("mostra cada nova lição como uma folha independente e a inclui na contagem", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/ABCBook.tsx"), "utf8");
    expect(page).toContain("book.progressiveLessons.length");
    expect(page).toContain("book.progressiveLessons.map((lesson, lessonIndex)");
    expect(page).toContain("Uma ideia completa por folha");
  });
});
