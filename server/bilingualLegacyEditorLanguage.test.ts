import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");
const section = source.slice(source.indexOf("editPhrase: protectedProcedure"), source.indexOf("translateRealtime:"));

describe("editor legado bilíngue", () => {
  it("não mantém bloqueio ou modelo presos ao português e inglês", () => {
    expect(section).toContain('suggestions: ""');
    expect(section).toContain("native ${input.nativeLanguage} learner");
    expect(section).toContain("Do not use any third language.");
    expect(section).not.toContain("Escolha uma frase segura da lição");
    expect(section).not.toContain("[PT] Palavra original");
  });
});
