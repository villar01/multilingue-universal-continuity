import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"), "utf8");

describe("diagnóstico contínuo local", () => {
  it("prioriza Ollama e nunca pede fallback remoto automático", () => {
    expect(source).toContain('import { generateAI } from "../aiProvider"');
    expect(source).toContain('preferredProvider: "ollama"');
    expect(source).toContain("allowRemoteFallback: false");
    expect(source).not.toContain("invokeLLM");
  });
});
