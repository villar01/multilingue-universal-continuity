import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/CompleteLesson.tsx", import.meta.url), "utf8");

describe("CompleteLesson teacher voice", () => {
  it("uses the learner-selected teacher and language pair for lesson conversation", () => {
    expect(source).toContain('localStorage.getItem("ml_selected_teacher")');
    expect(source).toContain("targetLanguage: targetLanguageCode");
    expect(source).toContain("nativeLanguage: nativeLanguageCode");
    expect(source).not.toContain('targetLanguage: "English"');
    expect(source).not.toContain('nativeLanguage: "Portuguese"');
  });

  it("routes TTS and the avatar through the selected regional teacher profile", () => {
    expect(source).toContain("languageCode: teacherVoiceLanguage");
    expect(source).toContain("voiceGender: teacherVoiceGender");
    expect(source).not.toContain('languageCode: "en-US"');
    expect(source).not.toContain('voiceGender: "FEMALE"');
    expect(source).toContain("teacherId={selectedTeacherId}");
    expect(source).toContain("imageUrl={lessonTeacher?.photoUrl || lessonTeacher?.photo_url}");
    expect(source).toContain("currentText={activeTeacherSpeechText || lesson.storyText || \"\"}");
  });

  it("uses the learner CEFR level and target locale instead of fixed A1 and English inputs", () => {
    expect(source).toContain('resolvePracticeCEFRLevel(localStorage.getItem("ml_current_level") || "A1")');
    expect(source).toContain("userLevel: learnerCefrLevel");
    expect(source).toContain('language: targetLanguageCode.split("-")[0]');
    expect(source).not.toContain('userLevel: "A1"');
    expect(source).not.toContain('language: "en"');
  });
});
