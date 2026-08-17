import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("jogo de adivinhação por estrelas na cena", () => {
  it("apresenta estrela e pista falada do professor antes da recuperação", () => {
    expect(source).toContain("Estrela da cena");
    expect(source).toContain("Toque na estrela para ouvir a pista do professor");
    expect(source).toContain("requestSpeechSafely(quizQuestion.example");
    expect(source).toContain("Pista:");
  });

  it("leva o acerto para fala, Pareto e próxima recuperação", () => {
    expect(source).toContain("Ouvir professor");
    expect(source).toContain("Fixar no Pareto");
    expect(source).toContain("Próxima estrela");
    expect(source).toContain("setPracticeHotspot(quizQuestion)");
  });
});
