import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const playerSource = readFileSync(new URL("../client/src/pages/VideoPlayer.tsx", import.meta.url), "utf8");
const generatorSource = readFileSync(new URL("./precision-clip-generator.ts", import.meta.url), "utf8");

describe("legendas reais de clipes de precisão", () => {
  it("usa o contrato bilíngue armazenado com os tempos do clipe", () => {
    expect(generatorSource).toContain("export interface BilingualSubtitle");
    expect(generatorSource).toContain("targetText: string");
    expect(generatorSource).toContain("nativeText: string");
    expect(playerSource).toContain("function parseClipSubtitles");
    expect(playerSource).toContain("parseClipSubtitles(clip.subtitlesData)");
    expect(playerSource).toContain("currentTime * 1000");
  });

  it("mostra os idiomas reais do registro e não mantém a frase PT/EN fixa", () => {
    expect(playerSource).toContain("clip.nativeLanguage.toUpperCase()");
    expect(playerSource).toContain("clip.targetLanguage.toUpperCase()");
    expect(playerSource).toContain("activeSubtitle.nativeText");
    expect(playerSource).toContain("activeSubtitle.targetText");
    expect(playerSource).not.toContain("Olá! Como você está?");
    expect(playerSource).not.toContain("Hello! How are you?");
  });
});
