import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Finance.tsx"), "utf8");

describe("finance page authorization", () => {
  it("does not run financial queries for non-admin profiles", () => {
    expect(source).toContain('const isAdmin = user?.role === "admin"');
    expect(source).toContain('{ enabled: isAdmin }');
    expect(source).toContain('if (!isAdmin)');
    expect(source).toContain('Acesso administrativo necessário');
  });
});
