import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const finance = source.slice(source.indexOf("finance: router({"), source.indexOf("// Professores Virtuais"));

describe("finance router authorization", () => {
  it("requires the local administrative procedure for every financial operation", () => {
    expect(source).toContain("const financeAdminProcedure = protectedProcedure.use");
    expect(source).toContain("ctx.user.role !== 'admin'");
    expect(finance).not.toContain("publicProcedure");
    expect(finance.match(/financeAdminProcedure/g)?.length).toBe(15);
  });
});
