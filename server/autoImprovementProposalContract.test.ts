import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/auto-improvement-router.ts"), "utf8");

describe("contrato de propostas de autoaperfeiçoamento", () => {
  it("identifica geração e diagnóstico como propostas que exigem aprovação humana", () => {
    expect(source.match(/executionMode: "proposal_only" as const/g)).toHaveLength(2);
    expect(source.match(/requiresHumanApproval: true/g)).toHaveLength(2);
  });

  it("não contém operações de escrita ou publicação", () => {
    expect(source).not.toMatch(/\b(writeFile|exec|spawn|publish|deploy|git\s+push)\b/);
  });
});
