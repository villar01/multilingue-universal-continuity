import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const rootRouter = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const coreTts = readFileSync(new URL("./_core/tts.ts", import.meta.url), "utf8");
const enhancedAvatar = readFileSync(new URL("../client/src/components/EnhancedTeacherAvatar.tsx", import.meta.url), "utf8");
const voiceConversation = readFileSync(new URL("../client/src/components/VoiceConversation.tsx", import.meta.url), "utf8");
const completeLesson = readFileSync(new URL("../client/src/pages/CompleteLesson.tsx", import.meta.url), "utf8");
const immersiveScene = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("relógio neural de áudio dos avatares", () => {
  it("liga tts.generate ao provedor Google Neural usado pela CompleteLesson", () => {
    expect(rootRouter).toContain("generate: publicProcedure");
    expect(rootRouter).toContain("return await textToSpeech(input)");
    expect(coreTts).toContain("GOOGLE CLOUD");
    expect(coreTts).toContain("texttospeech.googleapis.com/v1/text:synthesize");
  });

  it("propaga MP3 neural aos três fluxos e evita áudio audível duplicado", () => {
    expect(voiceConversation).toContain("audioUrl={activeTeacherAudioUrl}");
    expect(completeLesson).toContain("audioUrl={activeTeacherAudioUrl}");
    expect(voiceConversation).toContain("syncOnly");
    expect(completeLesson).toContain("syncOnly");
    expect(immersiveScene).toContain("ttsGoogle");
    expect(enhancedAvatar).toContain("audio.muted = syncOnly");
  });

  it("mantém sincronismo textual somente como fallback resiliente ao relógio do MP3", () => {
    expect(enhancedAvatar).toContain("Start text timing as a resilient fallback");
    expect(enhancedAvatar).toContain("if (audioUrl && audioUrl !== lastPlayedUrlRef.current)");
    expect(enhancedAvatar).toContain("clearTimeouts();");
  });
});
