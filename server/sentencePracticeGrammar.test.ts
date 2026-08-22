import { describe, expect, it } from "vitest";
import { getSentencePracticeGrammar } from "./_core/languageLogic";

describe("gramática da prática de frases", () => {
  it("orienta inglês com adjetivo antes do substantivo e contraste para português", () => {
    const grammar = getSentencePracticeGrammar("en-US", "pt-BR");
    expect(grammar.wordOrder).toContain("Subject + Verb + Object");
    expect(grammar.adjectivePosition).toContain("before the noun");
    expect(grammar.portugueseContrast).toContain("ordem do idioma estudado");
  });

  it("orienta alemão com verbo finito em segunda posição", () => {
    const grammar = getSentencePracticeGrammar("de", "pt-BR");
    expect(grammar.wordOrder).toContain("segunda posição");
    expect(grammar.teachingRule).toContain("não copie");
  });

  it("não impõe comparação em português a quem não o escolheu como idioma nativo", () => {
    expect(getSentencePracticeGrammar("fr", "en-US").portugueseContrast).toBeNull();
  });
});
