import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  invokeLLM: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { handleVocabExpand } from "./scheduled/vocab-expand";

function responseProbe() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("expansão programada de vocabulário", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["visitante", { isCron: false }],
    ["cron sem taskUid", { isCron: true, taskUid: undefined }],
  ])("bloqueia %s antes de chamar IA ou banco", async (_label, user) => {
    mocks.authenticateRequest.mockResolvedValue(user);
    const res = responseProbe();

    await handleVocabExpand({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "cron-only" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(mocks.getDb).not.toHaveBeenCalled();
  });
});
