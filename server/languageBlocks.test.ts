import { describe, expect, it } from "vitest";
import { getLanguageBlocks, getLanguageBlocksUpTo } from "../client/src/lib/languageBlocks";

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
});
