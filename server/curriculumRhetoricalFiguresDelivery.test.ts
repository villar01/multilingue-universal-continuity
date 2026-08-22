import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("entrega protegida de figuras de linguagem comerciais", () => {
  it("exige autorização curricular antes de consultar o catálogo", () => {
    const router = readFileSync(resolve(process.cwd(), "server/curriculum-router.ts"), "utf8");
    expect(router).toContain("rhetoricalFigures: protectedProcedure");
    expect(router).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey);");
    expect(router).toContain("return getCommercialRhetoricalFigures(input);");
  });

  it("faz o Pareto consultar e renderizar o bloco somente como resposta protegida", () => {
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/ParetoPanel.tsx"), "utf8");
    expect(panel).toContain("trpc.curriculum.rhetoricalFigures.useQuery");
    expect(panel).toContain("Figuras de linguagem e registro");
    expect(panel).not.toContain("rhetoric-figures-pt-es");
    expect(panel).not.toContain("Eres un rayo de sol");
  });
});
