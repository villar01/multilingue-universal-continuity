import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const chatbot = readFileSync(resolve(process.cwd(), "client/src/components/AIChatbot.tsx"), "utf8");
const lesson = readFileSync(resolve(process.cwd(), "client/src/pages/Lesson.tsx"), "utf8");

describe("contrato do chatbot da lição", () => {
  it("usa o perfil de idioma selecionado e CEFR recebido, sem valores fixos", () => {
    expect(chatbot).toContain("const { profile } = useLanguage()");
    expect(chatbot).toContain("const nativeLanguage = profile.nativeCode");
    expect(chatbot).toContain("userLevel: level");
    expect(chatbot).not.toContain('targetLanguage: "English"');
    expect(chatbot).not.toContain('nativeLanguage: "Portuguese"');
    expect(lesson).toContain("level={resolvePracticeCEFRLevel((lesson as any).courseLevel)}");
  });

  it("solicita e exibe o feedback gramatical estruturado da rota protegida", () => {
    expect(chatbot).toContain("trpc.conversationAI.feedback.useMutation");
    expect(chatbot).toContain("Feedback do professor");
    expect(chatbot).toContain("Forma sugerida:");
    expect(chatbot).toContain("correction.explanation");
  });

  it("vincula o chat textual ao professor ativo da lição", () => {
    expect(chatbot).toContain("teacherName?: string;");
    expect(chatbot).toContain("teacherGender?: 'male' | 'female';");
    expect(chatbot).toContain("teacherName = 'Professor'");
    expect(chatbot).toContain("ml_chat_history_${lessonId}_${teacherName}");
    expect(lesson).toContain("teacherName={teacher?.name}");
    expect(lesson).toContain("teacherGender={teacherVoice.gender}");
    expect(chatbot).toContain("speakNaturalVoice(text, targetLanguage, { rate: 0.9, gender: teacherGender })");
  });
});
