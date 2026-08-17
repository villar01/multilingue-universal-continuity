import { beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_COMMERCIAL_LANGUAGE_CODES } from "../shared/commercialLanguageBlocks";
import { generateAI } from "./aiProvider";
import {
  localizeSceneDialogue,
  parseLocalizedSceneMaterial,
} from "./curriculum/localizedSceneMaterial";

vi.mock("./aiProvider", () => ({
  generateAI: vi.fn(),
}));

const mockedGenerateAI = vi.mocked(generateAI);

describe("material localizado protegido das cenas", () => {
  beforeEach(() => {
    mockedGenerateAI.mockReset();
    mockedGenerateAI.mockResolvedValue({
      content: JSON.stringify({
        turns: [
          { targetText: "Localized scene dialogue.", nativeHelp: "Diálogo localizado da cena." },
          { targetText: "Practice the visible object.", nativeHelp: "Pratique o objeto visível." },
        ],
        objects: [
          { targetText: "Object", nativeHelp: "Objeto" },
          { targetText: "Scene", nativeHelp: "Cena" },
          { targetText: "Practice", nativeHelp: "Prática" },
        ],
      }),
      provider: "ollama",
      model: "test-local-model",
      tokensSaved: 0,
    });
  });

  it("aceita somente pacotes completos de diálogo e objetos", () => {
    expect(parseLocalizedSceneMaterial(JSON.stringify({
      turns: [{ targetText: "Olá", nativeHelp: "Hello" }],
      objects: [{ targetText: "Casa", nativeHelp: "Home" }],
    }))).toBeNull();

    expect(parseLocalizedSceneMaterial(JSON.stringify({
      turns: [
        { targetText: "Olá", nativeHelp: "Hello" },
        { targetText: "Até logo", nativeHelp: "See you" },
      ],
      objects: [
        { targetText: "Casa", nativeHelp: "Home" },
        { targetText: "Porta", nativeHelp: "Door" },
        { targetText: "Janela", nativeHelp: "Window" },
      ],
    }))).toEqual(expect.objectContaining({
      turns: expect.any(Array),
      objects: expect.any(Array),
    }));
  });

  it.each(INITIAL_COMMERCIAL_LANGUAGE_CODES)("gera localização protegida para %s, preservando o apoio nativo solicitado", async (targetLanguage) => {
    const result = await localizeSceneDialogue({
      sceneId: "paris",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(2);
    expect(result.objects).toHaveLength(3);
    expect(mockedGenerateAI).toHaveBeenLastCalledWith(expect.objectContaining({
      preferredProvider: "ollama",
      userId: 41,
      messages: expect.arrayContaining([
        expect.objectContaining({ content: expect.stringContaining(`target language is ${targetLanguage}`) }),
        expect.objectContaining({ content: expect.stringContaining("native learner support language is pt-BR") }),
      ]),
    }));
  });

  it.each([
    ["es-ES", "palmera"],
    ["fr-FR", "palmier"],
    ["it-IT", "palma"],
    ["de-DE", "Palme"],
  ])("entrega o pacote revisado PT-BR → %s da Praia Tropical sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "beach",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "palmeira" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "sofá"],
    ["fr-FR", "canapé"],
    ["it-IT", "divano"],
    ["de-DE", "Sofa"],
  ])("entrega o pacote revisado PT-BR → %s da Casa da Família sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "family_home",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "sofá" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "pasaporte"],
    ["fr-FR", "passeport"],
    ["it-IT", "passaporto"],
    ["de-DE", "Reisepass"],
  ])("entrega o pacote revisado PT-BR → %s da Família no Aeroporto sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "airport_family",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "passaporte" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "café"],
    ["fr-FR", "café"],
    ["it-IT", "caffè"],
    ["de-DE", "Kaffee"],
  ])("entrega o pacote revisado PT-BR → %s do Café Parisiense sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "cafe",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "café" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "pasta"],
    ["fr-FR", "pâtes"],
    ["it-IT", "pasta"],
    ["de-DE", "Pasta"],
  ])("entrega o pacote revisado PT-BR → %s do Restaurante Brasileiro sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "restaurant",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "massa" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "cuchillo"],
    ["fr-FR", "couteau"],
    ["it-IT", "coltello"],
    ["de-DE", "Messer"],
  ])("entrega o pacote revisado PT-BR → %s da Cozinha Moderna sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "kitchen",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "faca" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it.each([
    ["es-ES", "carrito"],
    ["fr-FR", "chariot"],
    ["it-IT", "carrello"],
    ["de-DE", "Einkaufswagen"],
  ])("entrega o pacote revisado PT-BR → %s do Supermercado sem depender de geração", async (targetLanguage, expectedObject) => {
    const result = await localizeSceneDialogue({
      sceneId: "supermarket",
      targetLanguage,
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result.status).toBe("ready");
    expect(result.turns).toHaveLength(3);
    expect(result.objects).toEqual(expect.arrayContaining([
      expect.objectContaining({ targetText: expectedObject, nativeHelp: "carrinho" }),
    ]));
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });

  it("não substitui um idioma futuro por conteúdo de outra língua", async () => {
    const result = await localizeSceneDialogue({
      sceneId: "family_home",
      targetLanguage: "ja-JP",
      nativeLanguage: "pt-BR",
      userId: 41,
    });

    expect(result).toEqual({ status: "planned_language_block", turns: [], objects: [] });
    expect(mockedGenerateAI).not.toHaveBeenCalled();
  });
});
