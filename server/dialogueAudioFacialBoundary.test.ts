import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("fronteira entre diálogo e prova facial", () => {
  it("mantém a boca sintética desligada e não bloqueia o áudio por motor facial", () => {
    expect(source).toContain("const showSyntheticMouth = false;");
    expect(source).toContain("audio.onplaying = () => {");
    expect(source).not.toMatch(/await\s+(?:start|generate|create).*?(?:Facial|Lip|MuseTalk|DID)/s);
  });

  it("usa o início real de áudio como condição do movimento de clipe aprovado", () => {
    const playback = source.slice(source.indexOf("audio.onplaying = () => {"), source.indexOf("audio.onended = () => {"));
    expect(playback).toContain("setActiveJamesClipId");
    expect(playback).toContain("setActiveSophieClipId");
  });
});
