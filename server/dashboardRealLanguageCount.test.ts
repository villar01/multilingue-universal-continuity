import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("contagem de idiomas no painel real", () => {
  it("usa o catálogo canônico em vez do rótulo estático desatualizado", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");
    expect(source).toContain("ACTIVE_LANGUAGE_COUNT");
    expect(source).toContain("TOTAL_LANGUAGES");
    expect(source).not.toContain("+57 idiomas ativos");
  });
});
