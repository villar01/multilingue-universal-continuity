import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("resposta imediata de vocabulário na cena", () => {
  it("mantém a explicação local de objeto visível e falada sem depender de uma resposta remota", () => {
    expect(source).toContain("if (fallback?.immediate) {");
    expect(source).toContain("setDlgTutorLoading(false);");
    expect(source).toContain("requestSpeechSafely(immediateReply.replace");
  });
});
