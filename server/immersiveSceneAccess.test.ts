import { describe, expect, it, vi } from "vitest";
import { requireImmersiveSceneAccess } from "./immersiveSceneAccess";

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
});
