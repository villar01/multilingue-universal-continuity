import { describe, expect, it } from "vitest";
import { complianceRouter } from "./compliance-router";
import type { TrpcContext } from "./_core/context";

function createContext(role: "user" | "admin"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: role === "admin" ? 1 : 2,
      openId: `${role}-compliance-audit`,
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

describe("compliance security-event access", () => {
  it("rejects event listing for a non-administrator", async () => {
    const caller = complianceRouter.createCaller(createContext("user"));
    await expect(caller.getSecurityEvents({ severity: "all" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects event resolution for a non-administrator", async () => {
    const caller = complianceRouter.createCaller(createContext("user"));
    await expect(caller.resolveSecurityEvent({ eventId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
