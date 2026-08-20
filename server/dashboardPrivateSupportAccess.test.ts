import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboard = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");

describe("dashboard private support access", () => {
  it("keeps a visible private support entry in the dashboard route used by students", () => {
    expect(dashboard).toContain('<Link href="/suporte">');
    expect(dashboard).toContain("Suporte privado");
  });
});
