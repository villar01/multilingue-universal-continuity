import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(
  path.resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"),
  "utf8",
);

describe("rotina automática de diagnóstico", () => {
  it("normaliza o cliente e resultados SQL sem desestruturar respostas incompatíveis", () => {
    expect(source).toContain('const pool = typeof client.promise === "function" ? client.promise() : client;');
    expect(source).toContain("function extractTelemetryRows(result: unknown): TelemetryRow[]");
    expect(source).toContain("function extractInsertId(result: unknown): number");
    expect(source).not.toContain("const [telemetryRows] = await pool.execute(");
    expect(source).not.toContain("const [result] = await pool.execute(");
  });

  it("mantém a rotina em modo de diagnóstico sem aplicar alterações autônomas", () => {
    expect(source).toContain("allowRemoteFallback: false");
    expect(source).toContain("createScheduledMaintenanceAssessment");
    expect(source).toContain("INSERT INTO maintenance_runs");
    expect(source).toContain("maintenanceAssessment.decision.state");
    expect(source).not.toContain("UPDATE users");
    expect(source).not.toContain("DELETE FROM");
  });
});
