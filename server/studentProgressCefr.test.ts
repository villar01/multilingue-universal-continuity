import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/StudentProgress.tsx"), "utf8");

describe("Painel de progresso CEFR com dados persistidos", () => {
  it("consulta somente as estatísticas da conta autenticada", () => {
    expect(source).toContain("trpc.progress.getStats.useQuery(undefined");
    expect(source).toContain("enabled: isAuthenticated");
    expect(source).not.toContain("mockProgress");
    expect(source).not.toContain("Math.random()");
  });

  it("calcula e apresenta a etapa A1–C2 e sua meta sem níveis genéricos", () => {
    expect(source).toContain("getLevelProgress(stats.totalXp)");
    expect(source).toContain('const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]');
    expect(source).toContain("CEFR_COLORS[cefrProgress.level]");
    expect(source).toContain("Avançar de ${cefrProgress.level} para ${nextLevel}");
    expect(source).not.toContain('estimatedLevel: "intermediate"');
  });
});
