import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("aiProvider integrated fallback", () => {
  it("keeps local providers first and uses the integrated LLM only after they fail", () => {
    const source = readFileSync(resolve(process.cwd(), "server/aiProvider.ts"), "utf8");
    expect(source).toContain('import { invokeLLM } from "./_core/llm"');
    expect(source).toContain('provider: "manus"');
    expect(source.indexOf("for (const provider of providers)")).toBeLessThan(source.indexOf("const fallback = await invokeLLM"));
    expect(source).toContain('modelUsed: provider');
  });
});
