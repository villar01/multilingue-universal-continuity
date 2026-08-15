import { describe, expect, it } from "vitest";
import { getLanguageBlocks, getLanguageBlocksUpTo, reviewLanguageBlock } from "../client/src/lib/languageBlocks";

describe("Blocos de linguagem por progressão", () => {
  it("mantém A1 em frases essenciais curtas", () => {
    expect(getLanguageBlocks("A1").map((block) => block.english)).toEqual([
      "Can you help me?",
      "I don't understand.",
    ]);
  });

  it("não libera gíria contextual antes do nível B2", () => {
    expect(getLanguageBlocksUpTo("B1").some((block) => block.kind === "contextual_slang")).toBe(false);
    expect(getLanguageBlocksUpTo("B2").some((block) => block.english === "No big deal.")).toBe(true);
  });

  it("exige escrita usando o bloco completo", () => {
    const block = getLanguageBlocks("A1")[0]!;
    expect(reviewLanguageBlock(block, "")).toContain("Escreva uma frase");
    expect(reviewLanguageBlock(block, "I need help.")).toContain("Mantenha");
    expect(reviewLanguageBlock(block, "Can you help me with this, please?")).toContain("Boa criação");
  });
});
