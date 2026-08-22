import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"), "utf8");

describe("diagnóstico contínuo com fallback explícito", () => {
  it("prioriza Ollama e declara fallback agregado quando o provedor local não está disponível", () => {
    expect(source).toContain('import { generateAI } from "../aiProvider"');
    expect(source).toContain('preferredProvider: "ollama"');
    expect(source).toContain("allowRemoteFallback: true");
    expect(source).toContain("a cadeia integrada recebe somente telemetria agregada");
    expect(source).not.toContain("invokeLLM");
  });
});
