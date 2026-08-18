import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

describe("observação bilíngue do Pareto", () => {
  it("entrega a tradução da frase de exemplo ao ciclo de memória", () => {
    const practiceCycle = readFileSync(resolve(projectRoot, "client/src/components/ParetoPracticeCycle.tsx"), "utf8");
    const practiceCycleLib = readFileSync(resolve(projectRoot, "client/src/lib/paretoPracticeCycle.ts"), "utf8");
    const paretoPage = readFileSync(resolve(projectRoot, "client/src/pages/Pareto1000.tsx"), "utf8");

    expect(practiceCycleLib).toContain("exampleTranslation?: string");
    expect(practiceCycle).toContain("Em português:");
    expect(practiceCycle).toContain("Primeiro compreenda o sentido em português");
    expect(paretoPage).toContain("Em português: {word.examplePt}");
    expect(paretoPage).toContain("exampleTranslation: practiceWord.examplePt");
  });

  it("mantém a tradução canônica da expressão usada no ciclo de observação", () => {
    const paretoContent = readFileSync(resolve(projectRoot, "server/curriculum/paretoContent.ts"), "utf8");

    expect(paretoContent).toContain('example:"Feel free to ask a question.", examplePt:"Sinta-se à vontade para fazer uma pergunta."');
  });
});
