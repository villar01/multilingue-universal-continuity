import { describe, expect, it } from "vitest";
import {
  generateAIBatch,
  runBoundedParallel,
  type AIGenerateOptions,
} from "./aiProvider";

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe("processamento paralelo de IA", () => {
  it("mantém a ordem dos resultados e respeita o limite de concorrência", async () => {
    let active = 0;
    let peak = 0;

    const results = await runBoundedParallel([1, 2, 3, 4], async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await delay(5);
      active -= 1;
      return value * 10;
    }, 2);

    expect(results).toEqual([10, 20, 30, 40]);
    expect(peak).toBe(2);
  });

  it("isola a falha de uma requisição sem cancelar as demais", async () => {
    const requests: AIGenerateOptions[] = [
      { messages: [{ role: "user", content: "primeira" }] },
      { messages: [{ role: "user", content: "falhar" }] },
      { messages: [{ role: "user", content: "terceira" }] },
    ];

    const results = await generateAIBatch(requests, 2, async (request) => {
      const text = request.messages[0].content;
      if (text === "falhar") throw new Error("falha isolada");
      return {
        content: text,
        tokensUsed: 1,
        tokensSaved: 0,
        responseTime: 1,
        provider: "ollama",
        cacheHit: false,
      };
    });

    expect(results[0]).toMatchObject({ ok: true, result: { content: "primeira" } });
    expect(results[1]).toEqual({ ok: false, error: "falha isolada" });
    expect(results[2]).toMatchObject({ ok: true, result: { content: "terceira" } });
  });
});
