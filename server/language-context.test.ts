import { describe, expect, it } from "vitest";
import {
  hasValidLessonLanguageContext,
  isTeacherVoiceCompatibleWithTarget,
} from "../shared/languageContext";

describe("contexto linguístico da tela de aula reutilizável", () => {
  it("mantém o conteúdo em inglês ao mudar a língua nativa do aluno", () => {
    expect(hasValidLessonLanguageContext({
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
      teacherVoiceLanguage: "en-GB",
    })).toBe(true);

    expect(hasValidLessonLanguageContext({
      nativeLanguage: "ja-JP",
      targetLanguage: "en-US",
      teacherVoiceLanguage: "en-US",
    })).toBe(true);
  });

  it("permite escolha regional explícita dentro da mesma língua", () => {
    expect(isTeacherVoiceCompatibleWithTarget("en-US", "en-GB")).toBe(true);
    expect(isTeacherVoiceCompatibleWithTarget("pt-PT", "pt-BR")).toBe(true);
  });

  it("bloqueia professor ou voz de uma língua diferente", () => {
    expect(isTeacherVoiceCompatibleWithTarget("pt-BR", "en-US")).toBe(false);
    expect(hasValidLessonLanguageContext({
      nativeLanguage: "pt-BR",
      targetLanguage: "ja-JP",
      teacherVoiceLanguage: "en-US",
    })).toBe(false);
  });
});
