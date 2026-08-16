import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "./context";

describe("tRPC public error protection", () => {
  it("serializes an unauthorized request without internal message, stack or path", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.system.getAiMetrics()).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.any(String),
    });
  });
});
