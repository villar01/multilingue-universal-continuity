import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("segurança assíncrona da cena imersiva", () => {
  it("centraliza disparos de fala em um invólucro que captura rejeições", () => {
    expect(source).toContain("const requestSpeechSafely = useCallback");
    expect(source).toContain("void speak(text, language, undefined, effectiveGender, purpose, autoPlay).catch");
  });

  it("usa o invólucro em diálogos, respostas, hotspots e botões", () => {
    expect(source).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);");
    expect(source).toContain("requestSpeechSafely(interaction.speech.text, interaction.speech.language, interaction.speech.gender, interaction.speech.purpose);");
    expect(source.match(/void speak\(/g)).toHaveLength(1);
  });
});
