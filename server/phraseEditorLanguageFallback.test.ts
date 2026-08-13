import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const section = source.slice(source.indexOf("editPhrase: protectedProcedure"), source.indexOf("addToVocabulary:"));

describe("fallback linguístico do editor de frases", () => {
  it("bloqueia sem inserir uma mensagem em português ou inglês fixos", () => {
    expect(section).toContain('const safeFallback = { suggestions: "", blocked: true }');
    expect(section).toContain("native ${input.nativeLanguage} learner");
    expect(section).toContain("Do not use any third language.");
    expect(section).not.toContain("Vamos praticar uma frase segura da lição.");
  });
});
