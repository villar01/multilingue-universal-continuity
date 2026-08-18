import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/VoiceConversation.tsx", import.meta.url), "utf8");

describe("avatar da conversa por voz", () => {
  it("encaminha o texto efetivamente enviado ao TTS ao ciclo visual do professor", () => {
    expect(source).toContain("const teacherSpeechText = targetText.trim()");
    expect(source).toContain("if (!teacherSpeechText)");
    expect(source).toContain("setActiveTeacherSpeechText(teacherSpeechText)");
    expect(source).toContain("setActiveTeacherAudioUrl(ttsResult.audioUrl)");
    expect(source).toContain("setActiveTeacherSpeechText(\"\")");
    expect(source).toContain("setActiveTeacherAudioUrl(null)");
  });

  it("preserva retrato, gênero, locale e estado de fala do professor ativo no avatar estável", () => {
    const avatarStart = source.lastIndexOf("<EnhancedTeacherAvatar");
    const avatarSegment = source.slice(avatarStart, source.indexOf("/>", avatarStart) + 2);
    expect(avatarSegment).toContain("imageUrl={cachedPortraitUrl || activeTeacher.imageUrl}");
    expect(avatarSegment).toContain("teacherName={activeTeacher.name}");
    expect(avatarSegment).toContain("gender={activeTeacher.gender}");
    expect(avatarSegment).toContain("isTeaching={isSpeaking}");
    expect(avatarSegment).toContain("currentText={activeTeacherSpeechText}");
    expect(avatarSegment).toContain("audioUrl={activeTeacherAudioUrl}");
    expect(avatarSegment).toContain("syncOnly");
    expect(avatarSegment).toContain("languageCode={activeTeacher.fallbackLanguage}");
    expect(source).not.toContain("<EnhancedTeacherAvatar />");
  });
});
