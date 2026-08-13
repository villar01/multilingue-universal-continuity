import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");
const voiceSource = readFileSync(resolve(process.cwd(), "client/src/components/VoiceConversation.tsx"), "utf8");

describe("fallbacks de sugestões bilíngues", () => {
  it("não devolve sugestões em inglês quando a geração no idioma-alvo falha", () => {
    const continueSection = routerSource.slice(
      routerSource.indexOf("continue: protectedProcedure"),
      routerSource.indexOf("editPhrase:")
    );
    expect(continueSection).toContain("suggestions: []");
    expect(continueSection).toContain("let suggestions: string[] = []");
    expect(continueSection).not.toContain('suggestions: ["Yes", "No", "Tell me more"]');
    expect(voiceSource).not.toContain('suggestions: ["Yes", "No", "Tell me more"]');
  });
});
