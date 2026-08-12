import { describe, expect, it, vi } from "vitest";
import { generateRoleplayFollowUps } from "./roleplayFollowUps";

describe("follow-ups paralelos do roleplay", () => {
  it("envia tradução e opções pelo lote de concorrência limitada no fluxo real", async () => {
    const generateBatch = vi.fn().mockResolvedValue([
      { ok: true, result: { content: "Olá", tokensUsed: 1, tokensSaved: 0, responseTime: 1, provider: "ollama", cacheHit: false } },
      { ok: true, result: { content: '["Sim", "Pode repetir?", "Obrigado"]', tokensUsed: 1, tokensSaved: 0, responseTime: 1, provider: "ollama", cacheHit: false } },
    ]);
    const invokeFallback = vi.fn();

    const result = await generateRoleplayFollowUps({
      npcMessage: "How can I help you?",
      targetLanguage: "English",
      setting: "a restaurant",
    }, { generateBatch, invokeFallback });

    expect(generateBatch).toHaveBeenCalledWith(expect.any(Array), 2);
    expect(generateBatch.mock.calls[0][0]).toHaveLength(2);
    expect(invokeFallback).not.toHaveBeenCalled();
    expect(result).toEqual({
      translation: "Olá",
      optionsContent: '["Sim", "Pode repetir?", "Obrigado"]',
    });
  });

  it("mantém fallback por item se uma geração local falhar", async () => {
    const fallback = vi.fn().mockResolvedValue({
      choices: [{ message: { content: "Tradução de reserva" } }],
    });

    const result = await generateRoleplayFollowUps({
      npcMessage: "Hello",
      targetLanguage: "English",
      setting: "a restaurant",
    }, {
      generateBatch: async () => [
        { ok: false, error: "modelo local indisponível" },
        { ok: true, result: { content: '["Hi"]', tokensUsed: 1, tokensSaved: 0, responseTime: 1, provider: "ollama", cacheHit: false } },
      ],
      invokeFallback: fallback,
    });

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(result.translation).toBe("Tradução de reserva");
    expect(result.optionsContent).toBe('["Hi"]');
  });
});
