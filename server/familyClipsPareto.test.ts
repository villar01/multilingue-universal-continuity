import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/FamilyVocabularyClips.tsx", import.meta.url), "utf8");

describe("clipes de vocabulário familiar com prática Pareto", () => {
  it("oferece o ciclo de recuperação, escrita e criação para o clipe ativo", () => {
    expect(source).toContain("ParetoPracticeCycle");
    expect(source).toContain("Praticar Pareto");
    expect(source).toContain("term={{ word: clip.word, translation: clip.translation, example: clip.sentence }}");
    expect(source).toContain('level="A1"');
  });

  it("usa pronúncia neural inglesa feminina alinhada à professora Ingrid", () => {
    expect(source).toContain('voiceLang: "en-US", gender: "female"');
    expect(source).not.toContain("speakNaturalVoice");
  });
});
