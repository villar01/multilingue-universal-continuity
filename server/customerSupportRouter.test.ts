import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/customer-support-router.ts"), "utf8");

describe("customer support private channel", () => {
  it("requires authenticated customer procedures and owner-only review", () => {
    expect(routerSource).toContain("create: protectedProcedure");
    expect(routerSource).toContain("listMine: protectedProcedure");
    expect(routerSource).toContain("getMine: protectedProcedure");
    expect(routerSource).toContain("adminList: adminProcedure");
    expect(routerSource).toContain("adminReply: adminProcedure");
  });

  it("keeps a bounded message size and anti-abuse limit", () => {
    expect(routerSource).toContain("max(1500");
    expect(routerSource).toContain("recent.length >= 10");
    expect(routerSource).toContain("TOO_MANY_REQUESTS");
  });

  it("verifies ownership before a customer can read or write a thread", () => {
    expect(routerSource).toContain("eq(customerSupportThreads.userId, ctx.user.id)");
    expect(routerSource).toContain("Conversa privada não encontrada");
  });
});
