import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalQwenAvailability } from "./_core/llm-free";

describe("disponibilidade local de Qwen", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("não declara Ollama disponível quando a instância não lista um Qwen2.5 aprovado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: "llama3:8b" }] }),
    }));

    await expect(getLocalQwenAvailability()).resolves.toEqual({
      available: false,
      selectedModel: null,
      reason: "qwen_model_missing",
    });
  });

  it("confirma o modelo Qwen instalado antes de permitir a prioridade local", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: "qwen2.5:1.5b" }, { name: "qwen2.5:3b" }] }),
    }));

    await expect(getLocalQwenAvailability()).resolves.toEqual({
      available: true,
      selectedModel: "qwen2.5:3b",
      reason: "ready",
    });
  });
});
