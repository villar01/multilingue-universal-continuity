import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const section = source.slice(source.indexOf("sceneChat: protectedProcedure"), source.indexOf("// ── SRS Progress"));

describe("scene chat language fallback", () => {
  it("uses the selected native language and emits no Portuguese fallback on blocked or failed calls", () => {
    expect(section).toContain('const safeFallback = { reply: "", blocked: true }');
    expect(section).toContain("explique somente em ' + input.nativeLanguage");
    expect(section).toContain("Não use um terceiro idioma.");
    expect(section).not.toContain("Vamos continuar com uma frase segura");
  });
});
