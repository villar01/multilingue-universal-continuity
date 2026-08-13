import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const voiceConversation = readFileSync(resolve(process.cwd(), "client/src/components/VoiceConversation.tsx"), "utf8");
const bilingualRouter = readFileSync(resolve(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");

describe("conversa por voz bilíngue CEFR", () => {
  it("encaminha o perfil nativo e o CEFR selecionado sem valores legados", () => {
    expect(voiceConversation).toContain("const nativeLanguage = profile.nativeCode");
    expect(voiceConversation).toContain("nativeLanguage,");
    expect(voiceConversation).toContain("userLevel: level");
    expect(voiceConversation).not.toContain('userLevel: "beginner"');
  });

  it("usa marcadores dinâmicos no servidor e no analisador da conversa por voz", () => {
    expect(bilingualRouter).toContain("const cefrLevelSchema = z.enum(CEFR_LEVELS)");
    expect(bilingualRouter).toContain("const nativeTag = localeTag(input.nativeLanguage)");
    expect(bilingualRouter).toContain("const targetTag = localeTag(input.targetLanguage)");
    expect(voiceConversation).toContain("const nativeMarker = `[${nativeTag}]`");
    expect(voiceConversation).toContain("const targetMarker = `[${targetTag}]`");
  });
});
