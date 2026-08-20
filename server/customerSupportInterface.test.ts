import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerSupport.tsx"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/customer-support-router.ts"), "utf8");

describe("customer support private interface", () => {
  it("keeps customer and owner workflows separated", () => {
    expect(page).toContain("trpc.customerSupport.listMine");
    expect(page).toContain("trpc.customerSupport.adminList");
    expect(page).toContain("trpc.customerSupport.adminReply");
    expect(router).toContain("adminGet: adminProcedure");
  });

  it("does not place an external publishing or payment control in support", () => {
    expect(page).not.toContain("publicar anúncio");
    expect(page).not.toContain("cobrança automática");
  });
});
