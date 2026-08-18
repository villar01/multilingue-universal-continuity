import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("client/src/pages/ABCBook.tsx", "utf8");
const styles = readFileSync("client/src/index.css", "utf8");

describe("folhas sequenciais do Livro ABC", () => {
  it("separa abertura, blocos e capítulos em folhas visuais", () => {
    expect(page).toContain("abc-book-manuscript");
    expect(page).toContain("abc-book-leaf");
    expect(page).toContain("abc-book-pages");
    expect(page).toContain("abc-book-chapter-leaf");
    expect(page).toContain("abc-book-page-controls");
    expect(page).toContain("moveBookPage");
    expect(page).toContain("goBookPage");
    expect(page).toContain("book.soundLessons.map((lesson, lessonIndex)");
  });

  it("mantém folhas claras com separação, sem retirar a leitura do currículo", () => {
    expect(styles).toContain(".abc-book-pages > section");
    expect(styles).toContain("background: white");
    expect(styles).toContain("break-inside: avoid");
    expect(styles).toContain("scroll-snap-type: x mandatory");
    expect(styles).toContain("grid-auto-flow: column");
  });
});
