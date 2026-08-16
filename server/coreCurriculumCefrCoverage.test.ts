import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("cobertura CEFR dos fluxos curriculares centrais", () => {
  it("mantém a conversa livre com seis níveis explícitos e os envia ao serviço", () => {
    const source = read("client/src/pages/FreeTalk.tsx");
    for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(source).toContain(`id: "${level}"`);
    }
    expect(source).toContain("level,");
    expect(source).toContain("resolvePracticeCEFRLevel");
  });

  it("mantém as lições e a prática Pareto ligadas ao contrato CEFR compartilhado", () => {
    const lesson = read("client/src/components/PolyLesson.tsx");
    const pareto = read("client/src/components/ParetoPracticeCycle.tsx");
    expect(lesson).toContain("CEFRLevel");
    expect(pareto).toContain("CEFRLevel");
    expect(pareto).toContain("levelRequirement");
  });
});
