import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveTeacherSpeechVoice } from "../client/src/lib/voiceConversationTeacher";

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
});
