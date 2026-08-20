import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/control-center-router.ts"), "utf8");

describe("control center owner-only access", () => {
  it("uses owner-only procedures for operational data and actions", () => {
    expect(source).toContain('import { adminProcedure as protectedProcedure, router } from "./_core/trpc"');
    expect(source).toContain("getMaintenanceAlerts: protectedProcedure");
    expect(source).toContain("getSecurityEvents: protectedProcedure");
    expect(source).toContain("toggleEmergencyMode: protectedProcedure");
  });
});
