import { describe, expect, it } from "vitest";
import { systemRouter } from "./systemRouter";
import type { TrpcContext } from "./context";

function createContext(role: "user" | "admin"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: role === "admin" ? 1 : 2,
      openId: `${role}-audit-user`,
      name: role,
      email: null,
      loginMethod: "manus",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system operational data access", () => {
  it("rejects AI metrics for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(caller.getAiMetrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects security-event writes for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(
      caller.logSecurityEvent({
        eventType: "other",
        severity: "low",
        description: "attempted public write",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
