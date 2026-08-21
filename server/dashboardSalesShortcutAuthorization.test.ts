import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");

describe("atalho comercial no painel", () => {
  it("torna o atalho do painel de vendas visível somente ao administrador", () => {
    const roleGuardIndex = source.indexOf('user?.role === "admin"');
    const salesShortcutIndex = source.indexOf('href="/sales-dashboard"');
    const salesShortcut = source.slice(source.indexOf('user?.role === "admin"'), source.indexOf('user?.role === "admin"') + 900);
    expect(roleGuardIndex).toBeGreaterThan(-1);
    expect(roleGuardIndex).toBeLessThan(salesShortcutIndex);
    expect(salesShortcut).toContain('href="/sales-dashboard"');
    expect(salesShortcut).toContain("Painel de Vendas");
  });
});
