import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/musetalk-router.ts"), "utf8");

describe("disponibilidade segura de sincronização facial", () => {
  it("não declara lip-sync ativo apenas pela presença de credencial", () => {
    expect(source).toContain("available: false");
    expect(source).not.toContain("lip-sync de IA ativo");
    expect(source).not.toContain("falApiKey");
  });

  it("bloqueia geração e consulta externas até validação explícita", () => {
    expect(source).toContain('code: "PRECONDITION_FAILED"');
    expect(source).toContain('status: "VALIDATION_REQUIRED"');
    expect(source).not.toContain("queue.fal.run");
  });
});
