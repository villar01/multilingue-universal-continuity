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
    expect(page).toContain("abc-book-index");
    expect(page).toContain("abc-book-page-track");
    expect(page).toContain("moveBookPage");
    expect(page).toContain("goBookPage");
    expect(page).toContain("setActivePage(safePage);");
    expect(page).toContain("firstChapterPage");
    expect(page).toContain("Ir diretamente à folha");
    expect(page).toContain('event.key === "ArrowRight"');
    expect(page).toContain("book.soundLessons.map((lesson, lessonIndex)");
  });

  it("mantém folhas claras com separação, sem retirar a leitura do currículo", () => {
    expect(styles).toContain(".abc-book-page-track > section");
    expect(styles).toContain("background: white");
    expect(styles).toContain("break-inside: avoid");
    expect(styles).toContain(".abc-book-page-track");
    expect(styles).toContain("flex: 0 0 calc(100% / var(--abc-book-page-count))");
    expect(styles).toContain("perspective: 1400px");
  });

  it("coloca cada contexto semântico em uma folha própria", () => {
    expect(page).toContain("book.contextGroups.length");
    expect(page).toContain("book.contextGroups.map((group, groupIndex) => (");
    expect(page).not.toContain("<div className=\"mt-6 space-y-8\">");
  });

  it("separa leitura, estrutura e produção de cada capítulo A1 em folhas próprias", () => {
    expect(page).toContain("book.chapters.flatMap");
    expect(page).toContain("key={`${chapter.title}-leitura`}");
    expect(page).toContain("key={`${chapter.title}-estrutura`}");
    expect(page).toContain("key={`${chapter.title}-producao`}");
    expect(page).toContain("book.chapters.length * 3");
  });
});
