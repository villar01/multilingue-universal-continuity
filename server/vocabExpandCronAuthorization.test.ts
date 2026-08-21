import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/scheduled/vocab-expand.ts"), "utf8");

describe("autorização da expansão programada de vocabulário", () => {
  it("rejeita chamadas sem a identidade cron autenticada antes de gerar IA ou gravar no banco", () => {
    expect(source).toContain('import { sdk } from "../_core/sdk";');
    expect(source).toContain("const user = await sdk.authenticateRequest(req);");
    expect(source).toContain("if (!user.isCron || !user.taskUid)");
    expect(source.indexOf("if (!user.isCron || !user.taskUid)")).toBeLessThan(source.indexOf("const today"));
    expect(source).toContain('res.status(403).json({ error: "cron-only" });');
  });
});
