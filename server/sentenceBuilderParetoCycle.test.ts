import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getParetoAssemblyModel } from "../client/src/lib/paretoPracticeCycle";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SentenceBuilder.tsx"), "utf8");

describe("ciclo Pareto do Construtor de Frases", () => {
  it("reutiliza somente vocabulário real da lição e encaminha o CEFR", () => {
    expect(source).toContain("vocabulary.filter");
    expect(source).toContain("ParetoPracticeCycle");
    expect(source).toContain("level={cefrLevel}");
    expect(source).toContain("feedbackLanguage={nativeLanguage}");
  });

  it("não fabrica uma frase em inglês quando a lição não possui modelo do termo", () => {
    expect(getParetoAssemblyModel({ word: "Bonjour", translation: "Olá" })).toBe("Bonjour");
  });
});
