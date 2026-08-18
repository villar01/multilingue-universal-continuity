import { describe, expect, it } from "vitest";
import { getLanguageBlocks, getLanguageBlocksUpTo, LANGUAGE_BLOCKS } from "./curriculum/languageBlocksContent";

describe("progressão dos blocos de linguagem", () => {
  it("mantém frases essenciais curtas no A1 e amplia o registro gradualmente", () => {
    expect(getLanguageBlocks("A1").every((block) => block.kind === "essential_phrase")).toBe(true);
    expect(getLanguageBlocks("A2").every((block) => block.kind === "everyday_expression")).toBe(true);
    expect(getLanguageBlocks("B1").every((block) => block.kind === "natural_reply")).toBe(true);
    expect(getLanguageBlocks("B2").every((block) => block.kind === "contextual_slang" && block.safetyNote)).toBe(true);
    expect(getLanguageBlocks("C1").every((block) => block.kind === "contextual_slang" && block.safetyNote)).toBe(true);
  });

  it("não antecipa expressões de nível posterior na revisão acumulada", () => {
    expect(getLanguageBlocksUpTo("A1").every((block) => block.cefr === "A1")).toBe(true);
    expect(getLanguageBlocksUpTo("B1").every((block) => ["A1", "A2", "B1"].includes(block.cefr))).toBe(true);
    expect(getLanguageBlocksUpTo("B1").some((block) => block.kind === "contextual_slang")).toBe(false);
    expect(getLanguageBlocksUpTo("C1").some((block) => block.cefr === "C1" && block.safetyNote)).toBe(true);
  });

  it("mantém todos os blocos com sentido, pronúncia, exemplo e escrita", () => {
    expect(LANGUAGE_BLOCKS.every((block) => (
      block.english.trim()
      && block.portuguese.trim()
      && block.figurativePronunciation.trim()
      && block.example.trim()
      && block.examplePortuguese.trim()
      && block.writingPrompt.trim()
    ))).toBe(true);
  });
});
