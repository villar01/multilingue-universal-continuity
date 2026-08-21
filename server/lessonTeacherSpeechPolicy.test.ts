import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveTeacherSpeechVoice } from "../client/src/lib/voiceConversationTeacher";

const pronunciation = readFileSync(new URL("../client/src/components/PronunciationExercise.tsx", import.meta.url), "utf8");

describe("política de voz do professor na lição", () => {
  it("mantém locale regional e gênero do professor selecionado", () => {
    expect(resolveTeacherSpeechVoice({
      name: "Professor James",
      gender: "male",
      voiceLanguageCode: "en-GB",
    }, "en-US")).toEqual({ voiceLang: "en-GB", gender: "male" });
  });

  it("não permite que o replay da lição volte a usar a rota genérica de fala", () => {
    const source = readFileSync(new URL("../client/src/pages/Lesson.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("speakNaturalVoice(");
    expect(source).toContain("voiceLang: teacherVoice.voiceLang");
    expect(source).toContain("gender: teacherVoice.gender");
  });

  it("propaga o gênero selecionado ao vocabulário explicado e ao clipe da lição", () => {
    const source = readFileSync(new URL("../client/src/pages/Lesson.tsx", import.meta.url), "utf8");
    const vocabularyTeacher = source.slice(source.indexOf("<TeacherWithObject"), source.indexOf("</Suspense>", source.indexOf("<TeacherWithObject")));
    const lessonClip = source.slice(source.indexOf("<AnimatedLessonClip"), source.indexOf("</Suspense>", source.indexOf("<AnimatedLessonClip")));

    expect(vocabularyTeacher).toContain("gender: teacherVoice.gender");
    expect(vocabularyTeacher).toContain("voiceLang: teacherVoice.voiceLang");
    expect(lessonClip).toContain("gender: teacherVoice.gender");
    expect(lessonClip).toContain("voiceLang: teacherVoice.voiceLang");
  });

  it("usa a voz do professor ativo na dicção de pronúncia", () => {
    const source = readFileSync(new URL("../client/src/pages/Lesson.tsx", import.meta.url), "utf8");

    expect(source).toContain("teacherGender={teacherVoice.gender}");
    expect(pronunciation).toContain("teacherGender: 'male' | 'female';");
    expect(pronunciation).toContain("voiceGender: teacherGender === 'male' ? \"MALE\" : \"FEMALE\"");
    expect(pronunciation).not.toContain('voiceGender: "FEMALE",');
  });
});
