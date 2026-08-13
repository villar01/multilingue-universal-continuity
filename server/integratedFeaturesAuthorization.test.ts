import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { integratedFeaturesRouter } from "./integrated-features";

describe("autorização de autoaperfeiçoamento", () => {
  it("não permite que visitante ou usuário comum execute tarefas internas", async () => {
    const visitor = integratedFeaturesRouter.createCaller({ user: null } as any);
    const student = integratedFeaturesRouter.createCaller({ user: { id: 7, role: "user" } } as any);

    await expect(visitor.executeTasks()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(student.executeTasks()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("declara a rota sensível como administrativa em vez de pública", () => {
    const source = readFileSync(resolve(process.cwd(), "server/integrated-features.ts"), "utf8");

    expect(source).toContain("executeTasks: adminProcedure.mutation");
    expect(source).not.toContain("executeTasks: publicProcedure.mutation");
  });
});
