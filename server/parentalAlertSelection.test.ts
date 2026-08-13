import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ParentalControlPanel.tsx"), "utf8");

describe("seleção de alertas parentais", () => {
  it("consulta somente o perfil infantil selecionado e não usa ID sentinela", () => {
    expect(source).toContain("selectedChildAlertsInput");
    expect(source).toContain("() => selectedChildId ? { childId: selectedChildId } : {}");
    expect(source).toContain("{ enabled: !!selectedChildId }");
    expect(source).not.toContain("listAlerts.useQuery({ childId: 0 })");
    expect(source).toContain("alerts={alerts || []}");
  });
});
