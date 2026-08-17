import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("links de reforço do professor na cena", () => {
  it("preserva o contexto imersivo ao encaminhar uma dúvida para o curso ABC", () => {
    expect(source).toContain("const sceneStudyReturnPath");
    expect(source).toContain("const openSceneReinforcement");
    expect(source).toContain("returnTo=${encodeURIComponent(sceneStudyReturnPath)}");
  });

  it("oferece reforços de entendimento, Pareto, frases e conversa após a resposta do professor", () => {
    expect(source).toContain("Aprofundar esta dúvida no curso ABC");
    expect(source).toContain("Entender no curso");
    expect(source).toContain("Memorizar no Pareto");
    expect(source).toContain("Praticar frases");
    expect(source).toContain("Conversar mais");
  });
});
