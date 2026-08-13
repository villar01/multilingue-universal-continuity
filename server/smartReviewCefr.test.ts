import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../client/src/pages/SmartReview.tsx", import.meta.url), "utf8");

describe("revisão inteligente por CEFR", () => {
  it("aceita A1–C2 e limita a sessão de revisão pela etapa selecionada", () => {
    const segment = routerSource.slice(routerSource.indexOf("smartReview: router({"), routerSource.indexOf("submitAnswer: protectedProcedure", routerSource.indexOf("smartReview: router({")));
    expect(segment).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1')");
    expect(segment).toContain("const cefrCap");
    expect(segment).toContain("cefrLevel: input.cefrLevel");
  });

  it("permite escolher o CEFR e ajusta a dificuldade de pronúncia sem manter easy fixo", () => {
    expect(pageSource).toContain("resolvePracticeCEFRLevel");
    expect(pageSource).toContain("generateMutation.mutate({ targetLanguage, exerciseType, cefrLevel })");
    expect(pageSource).toContain("const pronunciationDifficulty");
    expect(pageSource).toContain("difficulty={pronunciationDifficulty}");
  });
});
