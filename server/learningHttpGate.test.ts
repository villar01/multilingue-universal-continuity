import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { createLearningHttpGate, requiresLearningHttpGate } from "./learning-http-gate";

function createResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
  return response;
}

describe("portão HTTP de aprendizagem", () => {
  it("identifica apenas as rotas curriculares no HTTP", () => {
    expect(requiresLearningHttpGate("/lesson/42")).toBe(true);
    expect(requiresLearningHttpGate("/pareto-1000")).toBe(true);
    expect(requiresLearningHttpGate("/immersive-scene")).toBe(true);
    expect(requiresLearningHttpGate("/practice")).toBe(true);
    expect(requiresLearningHttpGate("/abc-book")).toBe(true);
    expect(requiresLearningHttpGate("/base-de-estudos")).toBe(true);
    expect(requiresLearningHttpGate("/ai-chat")).toBe(true);
    expect(requiresLearningHttpGate("/free-talk")).toBe(true);
    expect(requiresLearningHttpGate("/smart-review")).toBe(true);
    expect(requiresLearningHttpGate("/word-game")).toBe(true);
    expect(requiresLearningHttpGate("/")).toBe(false);
    expect(requiresLearningHttpGate("/pricing")).toBe(false);
  });

  it("devolve 401 para visitante sem sessão antes do fallback da aplicação", async () => {
    const authenticate = vi.fn().mockRejectedValue(new Error("no-session"));
    const gate = createLearningHttpGate({ authenticate, assertEntitlement: vi.fn() });
    const response = createResponse();
    const next = vi.fn();

    await gate({ method: "GET", path: "/abc-book" } as any, response as any, next);

    expect(authenticate).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ code: "learning-authentication-required" });
  });

  it("devolve 403 para conta sem aceite ou direito curricular e libera conta autorizada", async () => {
    const deniedGate = createLearningHttpGate({
      authenticate: vi.fn().mockResolvedValue({ id: 7 }),
      assertEntitlement: vi.fn().mockRejectedValue(new TRPCError({ code: "FORBIDDEN" })),
    });
    const deniedResponse = createResponse();
    await deniedGate({ method: "GET", path: "/pareto-1000" } as any, deniedResponse as any, vi.fn());
    expect(deniedResponse.statusCode).toBe(403);

    const authorizedNext = vi.fn();
    const authorizedGate = createLearningHttpGate({
      authenticate: vi.fn().mockResolvedValue({ id: 9 }),
      assertEntitlement: vi.fn().mockResolvedValue({}),
    });
    await authorizedGate({ method: "GET", path: "/immersive-scene" } as any, createResponse() as any, authorizedNext);
    expect(authorizedNext).toHaveBeenCalledOnce();
  });
});
