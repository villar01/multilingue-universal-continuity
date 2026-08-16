import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("orientação do ciclo Pareto", () => {
  const source = readFileSync("client/src/components/ParetoPracticeCycle.tsx", "utf8");

  it("expõe as quatro etapas do ciclo de memória", () => {
    expect(source).toContain('observe: "1. Observe"');
    expect(source).toContain('recall: "2. Lembre"');
    expect(source).toContain('write: "3. Escreva"');
    expect(source).toContain('create: "4. Crie"');
  });

  it("descreve a ação esperada e confirma a conclusão", () => {
    expect(source).toContain("Leia, ouça e associe a palavra ao objeto");
    expect(source).toContain("Sem olhar: escreva");
    expect(source).toContain("Escreva novamente a palavra");
    expect(source).toContain("Use <strong>{term.word}</strong> em uma nova frase");
    expect(source).toContain("Memória concluída: você lembrou, escreveu e criou uma frase");
  });
});
