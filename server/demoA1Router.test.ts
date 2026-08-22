import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEMO_A1_FREE_LIMIT, DEMO_A1_LESSONS, getDemoA1FreeLesson } from "./demo-a1-router";

describe("percurso público A1 de demonstração", () => {
  it("mantém dez etapas progressivas, mas entrega detalhes somente das três primeiras", () => {
    expect(DEMO_A1_LESSONS).toHaveLength(10);
    expect(DEMO_A1_FREE_LIMIT).toBe(3);
    expect(getDemoA1FreeLesson(1)).toMatchObject({ title: "Cumprimentar e despedir-se" });
    expect(getDemoA1FreeLesson(3)).toMatchObject({ title: "Perguntas essenciais" });
    expect(getDemoA1FreeLesson(4)).toBeNull();
    expect(getDemoA1FreeLesson(10)).toBeNull();
  });

  it("mantém a página pública sem a matriz curricular bloqueada", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/DemoA1.tsx"), "utf8");

    expect(page).toContain("trpc.demoA1.getPath.useQuery");
    expect(page).toContain("trpc.demoA1.getFreeLesson.useQuery");
    expect(page).toContain("Esta etapa mantém a progressão A1");
    expect(page).not.toContain("Pessoas e família");
    expect(page).not.toContain("Conversa A1 completa");
  });
});
