import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  responses: [] as unknown[][],
  database: null as any,
}));

vi.mock("./db", () => ({
  getDb: async () => state.database,
}));

import { getLearningContentEntitlement } from "./trial-access-router";

function makeDatabase() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => state.responses.shift() ?? [],
        }),
      }),
    }),
  };
}

describe("direito curricular após revogação parental", () => {
  beforeEach(() => {
    state.database = makeDatabase();
    state.responses = [];
  });

  it("bloqueia o conteúdo curricular de perfil infantil quando só resta consentimento revogado", async () => {
    state.responses = [
      [{ id: 1 }],
      [{ ageGroup: "infantil" }],
      [],
    ];

    await expect(getLearningContentEntitlement(71)).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Autorização parental válida é obrigatória antes de iniciar as lições.",
    });
  });

  it("reabre o direito curricular somente quando existe novo consentimento ativo", async () => {
    state.responses = [
      [{ id: 1 }],
      [{ ageGroup: "infantil" }],
      [{ id: 9 }],
      [{ subscriptionType: "premium", role: "user" }],
      [],
    ];

    await expect(getLearningContentEntitlement(71)).resolves.toMatchObject({
      hasFullCurriculum: true,
      isPaid: true,
    });
  });
});
