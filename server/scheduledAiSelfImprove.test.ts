import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(
  path.resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"),
  "utf8",
);

describe("rotina automática de diagnóstico", () => {
  it("usa o cliente assíncrono do pool antes de desestruturar resultados SQL", () => {
    expect(source).toContain("const pool = (db.$client as any).promise();");
    expect(source).toContain("const [telemetryRows] = await pool.execute(");
    expect(source).toContain(") as [TelemetryRow[], unknown];");
  });

  it("mantém a rotina em modo de diagnóstico sem aplicar alterações autônomas", () => {
    expect(source).toContain("allowRemoteFallback: false");
    expect(source).not.toContain("UPDATE users");
    expect(source).not.toContain("DELETE FROM");
  });
});
