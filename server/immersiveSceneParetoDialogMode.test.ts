import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("modo opcional de palavras Pareto no diálogo imersivo", () => {
  it("permite iniciar a prática por uma palavra da cena antes de avançar para frases", () => {
    expect(sceneSource).toContain("Começar só pelas palavras Pareto");
    expect(sceneSource).toContain("setPracticeHotspot(hotspot);");
    expect(sceneSource).toContain("Ouça, escreva e crie uma frase quando estiver pronto.");
  });

  it("entrega palavra, tradução, exemplo, áudio e ciclo de escrita sem transferir o catálogo", () => {
    expect(sceneSource).toContain("<ParetoPracticeCycle");
    expect(sceneSource).toContain("word: practiceHotspot.label, translation: practiceHotspot.translation, example: practiceHotspot.example");
    expect(sceneSource).toContain('onSpeak={(text) => requestSpeechSafely(text, selectedScene.teacherLang, selectedScene.teacherGender, "hotspot")}');
  });
});
