import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const playerSource = readFileSync(new URL("../client/src/pages/VideoPlayer.tsx", import.meta.url), "utf8");
const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");

describe("Pareto em clipes de precisão", () => {
  it("usa somente vocabularyData estruturado do clipe como origem da prática", () => {
    expect(schemaSource).toContain('vocabularyData: text("vocabulary_data")');
    expect(playerSource).toContain("function parseClipVocabulary");
    expect(playerSource).toContain("parseClipVocabulary(clip.vocabularyData)");
    expect(playerSource).toContain("const practiceTerm = vocabulary[practiceIndex]");
  });

  it("encaminha Pareto ao CEFR e à voz neural regional do próprio clipe", () => {
    expect(playerSource).toContain("resolvePracticeCEFRLevel(clip.difficulty)");
    expect(playerSource).toContain("voiceLang: clip.targetLanguage");
    expect(playerSource).toContain("<ParetoPracticeCycle");
    expect(playerSource).toContain("level={practiceLevel}");
  });
});
