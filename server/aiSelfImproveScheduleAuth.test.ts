import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "server/_core/index.ts"), "utf8");

describe("rota agendada de autoaperfeiçoamento", () => {
  it("não deixa o diagnóstico ser acionado por chamada pública", () => {
    const routeStart = source.indexOf('app.post("/api/scheduled/ai-self-improve"');
    const routeEnd = source.indexOf("// Insights da IA", routeStart);
    const route = source.slice(routeStart, routeEnd);

    expect(routeStart).toBeGreaterThan(-1);
    expect(route).toContain("sdk.authenticateRequest(req)");
    expect(route).toContain("!user.isCron || !user.taskUid");
    expect(route).toContain('res.status(403).json({ error: "cron-only" })');
    expect(route.indexOf("sdk.authenticateRequest(req)")).toBeLessThan(route.indexOf("runAISelfImprove"));
  });
});
