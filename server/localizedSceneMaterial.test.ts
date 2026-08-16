import { describe, expect, it } from "vitest";
import { localizeSceneDialogue, parseLocalizedSceneMaterial } from "./curriculum/localizedSceneMaterial";

describe("material localizado de cena", () => {
  it("aceita somente uma estrutura curta, bilíngue e completa de diálogo e objetos", () => {
    expect(parseLocalizedSceneMaterial(JSON.stringify({
      turns: [
        { targetText: "Hello, welcome to the beach.", nativeHelp: "Olá, bem-vindo à praia." },
        { targetText: "The ocean is blue.", nativeHelp: "O oceano é azul." },
      ],
      objects: [
        { targetText: "ocean", nativeHelp: "oceano" },
        { targetText: "sand", nativeHelp: "areia" },
        { targetText: "palm tree", nativeHelp: "palmeira" },
      ],
    }))).toEqual({
      turns: [
        { targetText: "Hello, welcome to the beach.", nativeHelp: "Olá, bem-vindo à praia." },
        { targetText: "The ocean is blue.", nativeHelp: "O oceano é azul." },
      ],
      objects: [
        { targetText: "ocean", nativeHelp: "oceano" },
        { targetText: "sand", nativeHelp: "areia" },
        { targetText: "palm tree", nativeHelp: "palmeira" },
      ],
    });
    expect(parseLocalizedSceneMaterial("[]")).toBeNull();
    expect(parseLocalizedSceneMaterial(JSON.stringify({ turns: [], objects: [] }))).toBeNull();
  });

  it("mantém blocos futuros planejados sem pedir ou devolver material antes do lançamento", async () => {
    await expect(localizeSceneDialogue({
      sceneId: "garden",
      targetLanguage: "ja-JP",
      nativeLanguage: "pt-BR",
      userId: 1,
    })).resolves.toEqual({ status: "planned_language_block", turns: [], objects: [] });
  });
});
