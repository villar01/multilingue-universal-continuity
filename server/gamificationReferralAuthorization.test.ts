import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/gamification-ui-integration.ts"), "utf8");

describe("autorização de indicação", () => {
  it("exige sessão antes de aceitar um código de indicação", () => {
    expect(source).toContain("applyReferral: protectedProcedure");
    expect(source).not.toContain("applyReferral: publicProcedure");
  });
});
