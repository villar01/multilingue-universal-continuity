import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "server/scheduled/ai-self-improve.ts"), "utf8");

describe("telemetria do diagnóstico contínuo", () => {
  it("agrega somente tipo e contexto técnico, sem enviar mensagens ou URLs brutas ao modelo", () => {
    expect(source).toContain("SELECT \n        event_type,\n        context,");
    expect(source).toContain("GROUP BY event_type, context");
    expect(source).not.toContain("message,\n        url,");
    expect(source).not.toContain('URL: ${r.url');
    expect(source).not.toContain('"${r.message');
  });
});
