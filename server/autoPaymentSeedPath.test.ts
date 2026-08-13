import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const seedProcedure = source.slice(source.indexOf("seedAutoPayments:"), source.indexOf("// Waitlist pré-lançamento"));

describe("automatic payment seed path", () => {
  it("runs from the current project directory instead of a legacy copied path", () => {
    expect(seedProcedure).toContain('execSync("node --loader tsx server/seed-auto-payments.ts"');
    expect(seedProcedure).toContain("cwd: process.cwd()");
    expect(seedProcedure).not.toContain("copy-of-multilingue-universal");
  });
});
