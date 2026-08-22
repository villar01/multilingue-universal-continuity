import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  database: null as any,
  results: [] as unknown[],
  execute: vi.fn(),
  notifyOwner: vi.fn(),
  generateAI: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: async () => state.database,
}));

vi.mock("./aiProvider", () => ({
  generateAI: state.generateAI,
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
    state.generateAI.mockReset();
    state.generateAI.mockResolvedValue({
      content: JSON.stringify({
        topIssue: "Falha isolada de interface",
        diagnosis: "O diagnóstico registra uma falha controlada.",
        recommendations: [{ action: "Revisar tela", priority: "low", isSecurity: false, estimatedImpact: "low" }],
        autoFixable: [],
        securityAlerts: [],
      }),
    });
  });

  it("conclui quando o conector retorna linhas e cabeçalho sem tupla", async () => {
    setupClient("direct", [
      [{ status: "completed", checksum: "checksum", completed_at: Date.now() }],
      { insertId: 70 },
      [{ event_type: "error", context: "lesson-view", count: 2 }],
      { insertId: 71 },
      { insertId: 41 },
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({ success: true, insightId: 41 });
    expect(state.execute).toHaveBeenCalledTimes(5);
    expect(state.execute.mock.calls[1]?.[0]).toContain("INSERT INTO maintenance_runs");
    expect(state.execute.mock.calls[3]?.[0]).toContain("INSERT INTO maintenance_runs");
    expect(state.notifyOwner).not.toHaveBeenCalled();
  });

  it("mantém compatibilidade com o retorno MySQL em tupla", async () => {
    setupClient("tuple", [
      [[{ status: "completed", checksum: "checksum", completed_at: Date.now() }], []],
      [{ insertId: 70 }, []],
      [[{ event_type: "error", context: "lesson-view", count: 2 }], []],
      [{ insertId: 72 }, []],
      [{ insertId: 42 }, []],
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({ success: true, insightId: 42 });
    expect(state.execute).toHaveBeenCalledTimes(5);
  });

  it("persiste a evidência bloqueada mesmo quando não há telemetria para analisar", async () => {
    setupClient("direct", [
      [{ status: "completed", checksum: "checksum", completed_at: Date.now() }],
      { insertId: 70 },
      [],
      { insertId: 73 },
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({
      success: true,
      message: expect.stringContaining("Sem telemetria para analisar nas últimas 24h."),
    });
    expect(state.execute).toHaveBeenCalledTimes(4);
    expect(state.execute.mock.calls[1]?.[0]).toContain("INSERT INTO maintenance_runs");
    expect(state.execute.mock.calls[3]?.[0]).toContain("INSERT INTO maintenance_runs");
  });

  it("bloqueia o diagnóstico e avisa o proprietário quando não existe backup verificável", async () => {
    setupClient("direct", [
      [],
      { insertId: 74 },
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({
      success: false,
      message: "Backup verificado indisponível; manutenção bloqueada.",
    });
    expect(state.execute).toHaveBeenCalledTimes(2);
    expect(state.execute.mock.calls[1]?.[0]).toContain("INSERT INTO maintenance_runs");
    expect(state.notifyOwner).toHaveBeenCalledOnce();
  });

  it("usa fallback explícito e mantém proposta bloqueada se o provedor responder texto não estruturado", async () => {
    state.generateAI.mockResolvedValueOnce({ content: "Revise as evidências do painel." });
    setupClient("direct", [
      [{ status: "completed", checksum: "checksum", completed_at: Date.now() }],
      { insertId: 75 },
      [{ event_type: "error", context: "scene", count: 1 }],
      { insertId: 76 },
      { insertId: 43 },
    ]);

    await expect(runAISelfImprove()).resolves.toMatchObject({ success: true, insightId: 43 });
    expect(state.generateAI).toHaveBeenCalledWith(expect.objectContaining({ allowRemoteFallback: true }));
    expect(state.execute.mock.calls[4]?.[1]?.[5]).toContain("blocked_for_owner_review");
  });
});
