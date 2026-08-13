import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const voiceConversation = readFileSync(resolve(process.cwd(), "client/src/components/VoiceConversation.tsx"), "utf8");
const lesson = readFileSync(resolve(process.cwd(), "client/src/pages/Lesson.tsx"), "utf8");

describe("Pareto na conversa por voz", () => {
  it("reutiliza termos completos da lição e exige tradução para abrir a prática", () => {
    expect(voiceConversation).toContain("const paretoTerms = vocabularyContext.flatMap");
    expect(voiceConversation).toContain("if (!word || !translation) return []");
    expect(voiceConversation).toContain("Prática Pareto da conversa");
  });

  it("encaminha CEFR e pronúncia para o ciclo sem fallback de fala do navegador", () => {
    expect(voiceConversation).toContain("<ParetoPracticeCycle term={activeParetoTerm} level={level}");
    expect(voiceConversation).toContain("const speakParetoTerm = async");
    expect(voiceConversation).toContain("languageCode: activeTeacher.fallbackLanguage");
    expect(lesson).toContain("vocabularyContext={lesson.vocabularyDetailed}");
    expect(lesson).toContain("level={resolvePracticeCEFRLevel((lesson as any).courseLevel)}");
  });
});
