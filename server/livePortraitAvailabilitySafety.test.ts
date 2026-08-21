import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const livePortraitSource = source.slice(source.indexOf("livePortrait: router({"), source.indexOf("// Phrasal Verbs Dictionary"));

describe("disponibilidade segura do adaptador D-ID", () => {
  it("não verifica credencial nem consulta o provedor como sinal de capacidade ativa", () => {
    expect(livePortraitSource).toContain("return { isHealthy: false }");
    expect(livePortraitSource).toContain("return { configured: false }");
    expect(livePortraitSource).not.toContain("api.d-id.com");
    expect(livePortraitSource).not.toContain("didApiKey");
  });

  it("bloqueia cada rota de geração antes de qualquer chamada externa", () => {
    expect(livePortraitSource.match(/code: "PRECONDITION_FAILED"/g)).toHaveLength(3);
    expect(livePortraitSource).not.toContain("animatePortrait(");
    expect(livePortraitSource).not.toContain("animatePortraitWithText(");
  });
});
