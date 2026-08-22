import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/VoiceConversation.tsx"), "utf8");

describe("conversação por voz no modo de imersão", () => {
  it("oculta apoio nativo não essencial e preserva fala, transcrição, microfone e ajuda", () => {
    expect(source).toContain("const { profile, immersionMode } = useLanguage()");
    expect(source).toContain("const targetUI = getUIStrings(languageCode)");
    expect(source).toContain("const visibleMessageContent");
    expect(source).toContain("!immersionMode && <span className=\"text-green-600\">Online");
    expect(source).toContain("{visibleMessageContent(msg.content)}");
    expect(source).toContain("{immersionMode ? targetUI.cancel : \"Parar Gravação\"}");
    expect(source).toContain("UserGuide");
    expect(source).toContain("microphoneErrorMessage(error)");
  });
});
