import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/routers-tts.ts"), "utf8");

describe("autorizações legadas de TTS e lip-sync", () => {
  it("exige sessão antes de toda mutação que gera áudio, phonemas ou frames", () => {
    expect(source).toContain('import { protectedProcedure, publicProcedure, router } from "./_core/trpc";');
    expect(source.match(/synthesize: protectedProcedure/g)).toHaveLength(1);
    expect(source.match(/generate: protectedProcedure/g)).toHaveLength(1);
    expect(source.match(/generatePhonemes: protectedProcedure/g)).toHaveLength(1);
    expect(source.match(/generateFrames: protectedProcedure/g)).toHaveLength(1);
    expect(source.match(/improve: protectedProcedure/g)).toHaveLength(1);
  });

  it("mantém públicas somente as consultas estáticas de idiomas e sotaques", () => {
    expect(source).toContain("getLanguages: publicProcedure.query");
    expect(source).toContain("getAccent: publicProcedure");
  });
});
