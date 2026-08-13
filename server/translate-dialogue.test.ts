import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generateAI: vi.fn() }));
vi.mock("./aiProvider", () => ({ generateAI: mocks.generateAI }));

import { translateRouter } from "./translate-router";

function createCaller() {
  return translateRouter.createCaller({ user: { id: 7 } } as any);
}

describe("tradução de ajuda do diálogo imersivo", () => {
  beforeEach(() => {
    mocks.generateAI.mockReset();
  });

  it("traduz a fala para o idioma nativo não-PT selecionado", async () => {
    mocks.generateAI.mockResolvedValue({ content: "¡Bienvenido a la playa!" });

    const result = await createCaller().dialogueText({
      text: "Welcome to the beach!",
      sourceLanguage: "en-US",
      targetLanguage: "es-MX",
    });

    expect(result).toEqual({ translation: "¡Bienvenido a la playa!", translated: true });
    expect(mocks.generateAI).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("es-MX") })]),
      userId: 7,
      useCache: true,
    }));
  });

  it("preserva o texto sem chamar o modelo quando origem e idioma nativo são iguais", async () => {
    const result = await createCaller().dialogueText({
      text: "Welcome to the beach!",
      sourceLanguage: "en-US",
      targetLanguage: "en-US",
    });

    expect(result).toEqual({ translation: "Welcome to the beach!", translated: false });
    expect(mocks.generateAI).not.toHaveBeenCalled();
  });
});
