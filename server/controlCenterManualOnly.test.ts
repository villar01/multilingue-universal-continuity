import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminControlCenter.tsx"), "utf8");

describe("control center manual-only improvements", () => {
  it("does not schedule recurring automatic changes", () => {
    expect(source).not.toContain("setInterval(");
    expect(source).not.toContain("autoMode: true");
    expect(source).toContain("Aplicação manual protegida");
    expect(source).toContain("decisão explícita do proprietário");
  });
});
