import { describe, expect, it } from "vitest";
import { evaluateOllamaHealth } from "./ollama";

describe("Ollama diagnostic health", () => {
  it("considers the local provider active only when the required Qwen model exists", () => {
    expect(evaluateOllamaHealth(["qwen2.5:1.5b"])).toMatchObject({
      serviceAvailable: true,
      diagnosticModelAvailable: false,
    });

    expect(evaluateOllamaHealth(["qwen2.5:1.5b", "qwen2.5:3b"])).toMatchObject({
      serviceAvailable: true,
      diagnosticModelAvailable: true,
      models: ["qwen2.5:1.5b", "qwen2.5:3b"],
    });
  });
});
