import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { selectARWordsForCefr } from "./ar-vocabulary-router";

const routerSource = readFileSync(resolve(process.cwd(), "server/ar-vocabulary-router.ts"), "utf8");
const pageSource = readFileSync(resolve(process.cwd(), "client/src/pages/ARMode.tsx"), "utf8");

describe("vocabulário AR graduado por CEFR", () => {
  it("mantém A1 concreto e entrega vocabulário próprio em B1+", () => {
    const a1 = selectARWordsForCefr("A1");
    const b1 = selectARWordsForCefr("B1");
    const c1 = selectARWordsForCefr("C1");

    expect(a1).toHaveLength(6);
    expect(a1.every((word) => word.cefr === "A1")).toBe(true);
    expect(b1.some((word) => word.cefr === "B1")).toBe(true);
    expect(c1.some((word) => word.cefr === "C1")).toBe(true);
    expect(c1.map((word) => word.word)).toContain("hypothesis");
  });

  it("mantém a entrega protegida e não deixa o cliente reincorporar o conjunto demonstrativo fixo", () => {
    expect(routerSource).toContain("forLearner: protectedProcedure");
    expect(routerSource).toContain('requestedBase !== "en"');
    expect(routerSource).toContain("supported: false as const");
    expect(pageSource).toContain("trpc.arVocabulary.forLearner.useQuery");
    expect(pageSource).not.toContain("const DEMO_VOCAB");
  });
});
