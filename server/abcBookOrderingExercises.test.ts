import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const curriculum = readFileSync("server/curriculum/abcBookContent.ts", "utf8");
const page = readFileSync("client/src/pages/ABCBook.tsx", "utf8");

describe("exercícios de ordenação no Livro ABC", () => {
  it("mantém uma prática gradual protegida depois de cada capítulo", () => {
    expect(curriculum).toContain("A1_ORDERING_EXERCISES");
    expect(curriculum).toContain("My friend studies English with me every morning.");
    expect(curriculum).toContain("Can you help me with this word, please?");
    expect(curriculum).toContain("orderingExercise: A1_ORDERING_EXERCISES[index]");
    expect(curriculum).toContain("A1_PARETO_CONTEXTS");
  });

  it("exibe palavras embaralhadas, explicação e continuação de escrita", () => {
    expect(page).toContain("Prática depois do texto");
    expect(page).toContain("chapter.orderingExercise.scrambled.join");
    expect(page).toContain("Conferir ordem");
    expect(page).toContain("Resposta-modelo:");
    expect(page).toContain("Agora continue:");
    expect(page).toContain("bookContext=${encodeURIComponent(chapter.paretoContext)}");
  });
});
