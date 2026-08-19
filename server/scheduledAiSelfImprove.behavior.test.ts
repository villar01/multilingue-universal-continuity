import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  database: null as any,
  results: [] as unknown[],
  execute: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: async () => state.database,
}));

vi.mock("./aiProvider", () => ({
  generateAI: async () => ({
    content: JSON.stringify({
      topIssue: "Falha isolada de interface",
      diagnosis: "O diagnóstico registra uma falha controlada.",
      recommendations: [{ action: "Revisar tela", priority: "low", isSecurity: false, estimatedImpact: "low" }],
      autoFixable: [],
      securityAlerts: [],
    }),
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: state.notifyOwner,
}));

import { runAISelfImprove } from "./scheduled/ai-self-improve";

function setupClient(kind: "direct" | "tuple", results: unknown[]) {
  state.results = [...results];
  state.execute = vi.fn(async () => state.results.shift());
  const promiseClient = { execute: state.execute };
  state.database = {
    $client: kind === "direct" ? promiseClient : { promise: () => promiseClient },
  };
}

describe("execução diagnóstica agendada", () => {
  beforeEach(() => {
    state.database = null;
    state.results = [];
    state.execute = vi.fn();
    state.notifyOwner.mockReset();
  });

  it("conclui quando o conector retorna linhas e cabeçalho sem tupla", async () => {
    setupClient("direct", [
      [{ event_type: "error", context: "lesson-view", count: 2 }],
      { insertId: 71 },
      { insertId: 41 },
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({ success: true, insightId: 41 });
    expect(state.execute).toHaveBeenCalledTimes(3);
    expect(state.execute.mock.calls[1]?.[0]).toContain("INSERT INTO maintenance_runs");
    expect(state.notifyOwner).not.toHaveBeenCalled();
  });

  it("mantém compatibilidade com o retorno MySQL em tupla", async () => {
    setupClient("tuple", [
      [[{ event_type: "error", context: "lesson-view", count: 2 }], []],
      [{ insertId: 72 }, []],
      [{ insertId: 42 }, []],
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({ success: true, insightId: 42 });
    expect(state.execute).toHaveBeenCalledTimes(3);
  });
});
