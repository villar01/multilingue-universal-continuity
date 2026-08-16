import { describe, expect, it, vi } from "vitest";
import { isProtectedLearningPath, requireImmersiveSceneAccess, requireLearningRouteAccess } from "./immersiveSceneAccess";

describe("bloqueio HTTP da Cena Imersiva", () => {
  it("permite a rota somente quando a sessão é autenticada", async () => {
    const next = vi.fn();
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const middleware = requireImmersiveSceneAccess({ authenticateRequest: vi.fn().mockResolvedValue({ id: 1 }) });

    await middleware({} as any, response as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it("falha fechada antes de entregar o shell quando a sessão não existe", async () => {
    const next = vi.fn();
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const middleware = requireImmersiveSceneAccess({ authenticateRequest: vi.fn().mockRejectedValue(new Error("missing-session")) });

    await middleware({} as any, response as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: "authentication-required" });
  });

  it("classifica rotas curriculares como protegidas e preserva páginas públicas", () => {
    expect(isProtectedLearningPath("/lesson/1")).toBe(true);
    expect(isProtectedLearningPath("/pareto-1000")).toBe(true);
    expect(isProtectedLearningPath("/immersive-scene")).toBe(true);
    expect(isProtectedLearningPath("/pricing")).toBe(false);
    expect(isProtectedLearningPath("/terms")).toBe(false);
  });

  it("não autentica páginas públicas, mas bloqueia rotas curriculares sem sessão", async () => {
    const authenticator = { authenticateRequest: vi.fn().mockRejectedValue(new Error("missing-session")) };
    const middleware = requireLearningRouteAccess(authenticator);
    const publicNext = vi.fn();
    const publicResponse = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await middleware({ path: "/pricing" } as any, publicResponse as any, publicNext);
    expect(publicNext).toHaveBeenCalledOnce();
    expect(authenticator.authenticateRequest).not.toHaveBeenCalled();

    const protectedNext = vi.fn();
    const protectedResponse = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await middleware({ path: "/lesson/1" } as any, protectedResponse as any, protectedNext);
    expect(protectedNext).not.toHaveBeenCalled();
    expect(protectedResponse.status).toHaveBeenCalledWith(401);
  });
});
