import { describe, expect, it } from "vitest";
import { getParetoProgramWords, getParetoWordsForChapter, PARETO_CHAPTER_COUNT, PARETO_WORDS_PER_CHAPTER } from "./curriculum/paretoContent";
import { getABCBookDelivery } from "./curriculum/abcBookContent";
import { readFileSync } from "node:fs";

describe("distribuição Pareto pelos capítulos A1", () => {
  it("divide as 1.000 formas únicas em dez percursos cumulativos, sem sobreposição", () => {
    const program = getParetoProgramWords();
    const chapterWords = Array.from({ length: PARETO_CHAPTER_COUNT }, (_, index) => getParetoWordsForChapter(index + 1, program));
    expect(chapterWords.every((words) => words.length > 0)).toBe(true);
    expect(chapterWords.every((words) => words.length === PARETO_WORDS_PER_CHAPTER)).toBe(true);
    expect(new Set(chapterWords.flat().map((word) => word.enUS.toLowerCase())).size).toBe(1_000);
  });

  it("vincula os dez capítulos A1 ao percurso correspondente e preserva a entrega protegida", () => {
    const book = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(book.available).toBe(true);
    if (!book.available) return;
    expect(book.chapters.map((chapter) => chapter.paretoChapter)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const clientSource = readFileSync("client/src/pages/ABCBook.tsx", "utf8");
    expect(clientSource).toContain("chapter=${chapter.paretoChapter}");
  });
});
