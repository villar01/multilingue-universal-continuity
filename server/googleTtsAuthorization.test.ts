import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const googleTts = source.slice(source.indexOf("ttsGoogle: router({"), source.indexOf("// LivePortrait"));

describe("Google TTS authorization", () => {
  it("requires an authenticated session before generating external audio", () => {
    expect(googleTts).toContain("generate: protectedProcedure");
    expect(googleTts).not.toContain("generate: publicProcedure");
  });
});
