import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboard = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");
const realDashboard = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");

describe("bloqueio comercial do painel", () => {
  it("não exibe checkout, preço ou chamada de upgrade sem aprovação explícita", () => {
    for (const source of [dashboard, realDashboard]) {
      expect(source).not.toContain('href="/checkout"');
      expect(source).not.toContain("R$ 59,00");
      expect(source).toContain("aprovação explícita do proprietário");
    }
  });
});
