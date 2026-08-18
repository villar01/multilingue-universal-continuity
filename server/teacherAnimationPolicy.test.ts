import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const avatar = readFileSync(new URL("../client/src/components/EnhancedTeacherAvatar.tsx", import.meta.url), "utf8");
const animatedTeacher = readFileSync(new URL("../client/src/components/AnimatedTeacher.tsx", import.meta.url), "utf8");
const talkingTeacher = readFileSync(new URL("../client/src/components/TalkingTeacher.tsx", import.meta.url), "utf8");
const voiceConversation = readFileSync(new URL("../client/src/components/VoiceConversation.tsx", import.meta.url), "utf8");
const animatedTeacher3D = readFileSync(new URL("../client/src/components/AnimatedTeacher3D.tsx", import.meta.url), "utf8");

describe("política visual por professor", () => {
  it("mantém todos os avatares estáveis sem desativar o áudio neural", () => {
    expect(avatar).toContain("allowsMouthAnimation");
    expect(avatar).toContain("const allowsMouthAnimation = false;");
    expect(avatar).toContain("const supportsValidatedFacialSync = false;");
    expect(avatar).toContain("if (!allowsMouthAnimation)");
    expect(avatar).toContain("AudioCtx && allowsMouthAnimation");
    expect(avatar).toContain("audio.play()");
  });

  it("não substitui retrato, nome ou canal de áudio ao desativar somente a boca", () => {
    expect(avatar).toContain("const imageUrl = photoUrl");
    expect(avatar).toContain("const teacherName = propTeacherName");
    expect(avatar).toContain("audioUrl");
  });

  it("impede vídeo e visemas no fluxo AnimatedTeacher para todos os professores sem interromper o áudio", () => {
    expect(animatedTeacher).toContain("allowsMouthAnimation");
    expect(animatedTeacher).toContain("const allowsMouthAnimation = false;");
    expect(animatedTeacher).toContain("const supportsValidatedFacialSync = false;");
    expect(animatedTeacher).toContain("if (!allowsMouthAnimation)");
    expect(animatedTeacher).toContain("if (allowsMouthAnimation && supportsValidatedFacialSync)");
    expect(animatedTeacher).toContain("videoUrl && supportsValidatedFacialSync");
    expect(animatedTeacher).toContain("lipSyncActive && allowsMouthAnimation");
    expect(animatedTeacher).toContain("audio.play()");
    expect(animatedTeacher).toContain("setMouthOpen(0)");
  });

  it("preserva retrato estável no TalkingTeacher, mantendo o áudio no comando explícito de ouvir", () => {
    expect(talkingTeacher).toContain("const supportsValidatedFacialSync = false;");
    expect(talkingTeacher).toContain("const showSyntheticMouth = false;");
    expect(talkingTeacher).toContain("if (!supportsValidatedFacialSync)");
    expect(talkingTeacher).toContain("videoUrl && supportsValidatedFacialSync");
    expect(talkingTeacher).toContain("showSyntheticMouth && (isSpeaking || state === \"speaking\")");
    expect(talkingTeacher).toContain("speakNaturalVoice(speechText");
  });

  it("mantém respostas abertas da conversa por voz no retrato estável, sem vídeo ou avatar 3D sintético", () => {
    expect(voiceConversation).toContain("respostas abertas não possuem um");
    expect(voiceConversation).toContain("<EnhancedTeacherAvatar");
    expect(voiceConversation).toContain("imageUrl={cachedPortraitUrl || activeTeacher.imageUrl}");
    expect(voiceConversation).not.toContain("TalkingHeadAvatar");
    expect(voiceConversation).not.toContain("animateLivePortrait.mutateAsync");
    expect(voiceConversation).not.toContain('id="photorealistic-video"');
  });

  it("mantém o avatar 3D legado como ilustração estática sem consultar visemas", () => {
    expect(animatedTeacher3D).toContain("const allowsSyntheticFacialMotion = false;");
    expect(animatedTeacher3D).toContain("enabled: allowsSyntheticFacialMotion && isTeaching");
    expect(animatedTeacher3D).toContain("!allowsSyntheticFacialMotion || !isTeaching");
    expect(animatedTeacher3D).toContain("allowsSyntheticFacialMotion ? currentMouth : MOUTH_SHAPES.NEUTRAL");
  });
});
