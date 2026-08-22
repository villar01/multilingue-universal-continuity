import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./_core/llm.ts", import.meta.url), "utf8");

describe("consentimento para Qwen local", () => {
  it("mantém o uso local opt-in e preserva o fallback protegido por padrão", () => {
    expect(source).toContain("allowLocalQwen?: boolean");
    expect(source).toContain("allowLocalQwen = false");
    expect(source).toContain("if (allowLocalQwen && !tools");
  });
});
