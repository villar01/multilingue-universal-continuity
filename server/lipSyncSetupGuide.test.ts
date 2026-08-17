import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.resolve(import.meta.dirname, "../client/src/components/LipSyncSetupGuide.tsx"), "utf8");

describe("guia técnico voluntário", () => {
  it("não abre automaticamente na rota inicial e exige escolha explícita", () => {
    expect(source).toContain('get("setup") === "local-ai"');
    expect(source).toContain("!START_ROUTES.has(location) || !setupRequested");
    expect(source).toContain('if (!START_ROUTES.has(location) || !setupRequested) {');
  });
});
