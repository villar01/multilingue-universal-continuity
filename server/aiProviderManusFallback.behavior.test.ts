import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ollamaAvailable: vi.fn(),
  lmstudioAvailable: vi.fn(),
  invokeIntegrated: vi.fn(),
}));

vi.mock("./ollama", () => ({
  isOllamaAvailable: mocks.ollamaAvailable,
  generateWithOllama: vi.fn(),
}));
vi.mock("./lmstudio", () => ({
  isLMStudioAvailable: mocks.lmstudioAvailable,
  generateWithLMStudio: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: vi.fn(async () => null) }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeIntegrated }));

import { generateAI } from "./aiProvider";

describe("generateAI integrated fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ollamaAvailable.mockResolvedValue(false);
    mocks.lmstudioAvailable.mockResolvedValue(false);
    mocks.invokeIntegrated.mockResolvedValue({
      choices: [{ message: { content: "Resposta pedagógica segura." } }],
      usage: { total_tokens: 12 },
    });
  });

  it("returns the integrated response as manus when both local providers are unavailable", async () => {
    const result = await generateAI({
      messages: [{ role: "user", content: "Crie uma frase curta." }],
      useCache: false,
    });

    expect(mocks.invokeIntegrated).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      provider: "manus",
      content: "Resposta pedagógica segura.",
      tokensUsed: 12,
      cacheHit: false,
    });
  });

  it("does not call the integrated model when remote fallback is explicitly disabled", async () => {
    await expect(generateAI({
      messages: [{ role: "user", content: "Diagnostique telemetria local." }],
      useCache: false,
      allowRemoteFallback: false,
    })).rejects.toThrow("Local AI providers unavailable");

    expect(mocks.invokeIntegrated).not.toHaveBeenCalled();
  });
});
