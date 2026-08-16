import { describe, expect, it } from "vitest";
import { localizeSceneDialogue, parseLocalizedSceneTurns } from "./curriculum/localizedSceneMaterial";

describe("material localizado de cena", () => {
  it("aceita somente uma estrutura curta, bilíngue e completa de diálogo", () => {
    expect(parseLocalizedSceneTurns(JSON.stringify([
      { targetText: "Hello, welcome to the beach.", nativeHelp: "Olá, bem-vindo à praia." },
      { targetText: "The ocean is blue.", nativeHelp: "O oceano é azul." },
    ]))).toEqual([
      { targetText: "Hello, welcome to the beach.", nativeHelp: "Olá, bem-vindo à praia." },
      { targetText: "The ocean is blue.", nativeHelp: "O oceano é azul." },
    ]);
    expect(parseLocalizedSceneTurns("[]")).toBeNull();
    expect(parseLocalizedSceneTurns(JSON.stringify([{ targetText: "Only one field" }, { targetText: "x", nativeHelp: "y" }]))).toBeNull();
  });

  it("mantém blocos futuros planejados sem pedir ou devolver material antes do lançamento", async () => {
    await expect(localizeSceneDialogue({
      sceneId: "garden",
      targetLanguage: "ja-JP",
      nativeLanguage: "pt-BR",
      userId: 1,
    })).resolves.toEqual({ status: "planned_language_block", turns: [] });
  });
});
