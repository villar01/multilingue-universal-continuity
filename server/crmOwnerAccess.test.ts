import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/crm-router.ts"), "utf8");

describe("CRM owner-only access", () => {
  it("uses one owner-only procedure for every commercial route", () => {
    expect(source).toContain('protectedProcedure as baseProtectedProcedure');
    expect(source).toContain('ctx.user.role !== "admin"');
    expect(source).toContain('O painel comercial é privado do proprietário.');
  });

  it("does not leave a public procedure in the commercial router", () => {
    expect(source).not.toContain("publicProcedure");
    expect(source).toContain("contacts: router");
    expect(source).toContain("deals: router");
    expect(source).toContain("metrics: protectedProcedure");
    expect(source).toContain("targets: router");
  });
});
