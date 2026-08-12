import { beforeEach, describe, expect, it, vi } from "vitest";

const localProvider = vi.hoisted(() => ({
  generate: vi.fn(),
  available: vi.fn(),
}));
const fallbackLLM = vi.hoisted(() => vi.fn());
const database = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("./ollama", () => ({
  generateWithOllama: localProvider.generate,
  isOllamaAvailable: localProvider.available,
}));
vi.mock("./lmstudio", () => ({
  generateWithLMStudio: vi.fn(),
  isLMStudioAvailable: vi.fn().mockResolvedValue(false),
}));
vi.mock("./db", () => ({ getDb: database.getDb }));
vi.mock("./_core/llm", () => ({ invokeLLM: fallbackLLM }));

import { generateRoleplayFollowUps } from "./roleplayFollowUps";

describe("roleplay com lote de produção", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localProvider.available.mockResolvedValue(true);
    database.getDb.mockResolvedValue(null);
  });

  it("usa generateAIBatch real com duas gerações concorrentes e valida respostas locais", async () => {
    let active = 0;
    let peak = 0;
    localProvider.generate.mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 8));
      active -= 1;
      const prompt = messages[0]?.content || "";
      return {
        content: prompt.includes("Translate")
          ? "Olá, como posso ajudar?"
          : '["Yes, please.", "Could you repeat?", "Thank you."]',
        tokensUsed: 4,
        responseTime: 8,
      };
    });

    const result = await generateRoleplayFollowUps({
      npcMessage: "How can I help you?",
      targetLanguage: "English",
      setting: "a restaurant",
    });

    expect(peak).toBe(2);
    expect(localProvider.generate).toHaveBeenCalledTimes(2);
    expect(fallbackLLM).not.toHaveBeenCalled();
    expect(result.translation).toBe("Olá, como posso ajudar?");
    expect(JSON.parse(result.optionsContent)).toHaveLength(3);
  });

  it("preserva fallback do roleplay quando uma resposta local não passa", async () => {
    localProvider.generate.mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
      const prompt = messages[0]?.content || "";
      if (prompt.includes("Translate")) throw new Error("falha local");
      return {
        content: '["Yes, please.", "Could you repeat?", "Thank you."]',
        tokensUsed: 4,
        responseTime: 1,
      };
    });
    fallbackLLM.mockResolvedValue({
      choices: [{ message: { content: "Tradução de fallback." } }],
    });

    const result = await generateRoleplayFollowUps({
      npcMessage: "Hello",
      targetLanguage: "English",
      setting: "a restaurant",
    });

    expect(fallbackLLM).toHaveBeenCalledTimes(1);
    expect(result.translation).toBe("Tradução de fallback.");
    expect(JSON.parse(result.optionsContent)).toHaveLength(3);
  });

  it("salva as duas respostas válidas no cache no mesmo caminho paralelo", async () => {
    const cacheWrites: Array<Record<string, unknown>> = [];
    database.getDb.mockResolvedValue({
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [] }),
        }),
      }),
      insert: () => ({
        values: async (value: Record<string, unknown>) => { cacheWrites.push(value); },
      }),
    });
    localProvider.generate.mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => ({
      content: messages[0]?.content.includes("Translate")
        ? "Olá, tudo bem?"
        : '["Yes, please.", "Could you repeat?", "Thank you."]',
      tokensUsed: 4,
      responseTime: 1,
    }));

    await generateRoleplayFollowUps({
      npcMessage: "How can I help you?",
      targetLanguage: "English",
      setting: "a restaurant",
    });

    expect(cacheWrites).toHaveLength(2);
    expect(cacheWrites.every((write) => write.modelUsed === "ollama")).toBe(true);
    expect(cacheWrites.every((write) => typeof write.cacheKey === "string")).toBe(true);
  });
});
