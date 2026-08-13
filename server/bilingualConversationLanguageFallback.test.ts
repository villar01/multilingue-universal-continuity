import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");
const startSection = source.slice(source.indexOf("start: protectedProcedure"), source.indexOf("continue: protectedProcedure"));
const continueSection = source.slice(source.indexOf("continue: protectedProcedure"), source.indexOf("editPhrase:"));

describe("fallbacks linguísticos da conversa bilíngue", () => {
  it("não mostra português ou inglês fixos quando a resposta não pode ser gerada com o par selecionado", () => {
    expect(startSection).toContain('return { question: "", suggestions: [], blocked: true }');
    expect(startSection).not.toContain("Hello! How are you today?");
    expect(continueSection).toContain('const safeResponse = ""');
    expect(continueSection).toContain('return { response: "", suggestions: [], blocked: true }');
    expect(continueSection).not.toContain("Vamos continuar com uma frase segura da lição.");
    expect(continueSection).not.toContain("Sorry, I had a technical issue.");
  });
});
