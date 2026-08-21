import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/VoiceConversation.tsx", import.meta.url), "utf8");

describe("fallback offline da conversa por voz", () => {
  it("não contorna a autorização curricular quando o servidor responde 401 ou 403", () => {
    expect(source).toContain('candidate.data?.code === "UNAUTHORIZED" || candidate.data?.code === "FORBIDDEN"');
    const deniedGuard = source.indexOf("if (isCurricularAccessDenied(err))");
    const offlineFallback = source.indexOf('console.log("[VoiceConversation] Falling back to offlineAI")');
    expect(deniedGuard).toBeGreaterThan(-1);
    expect(offlineFallback).toBeGreaterThan(deniedGuard);
    expect(source.slice(deniedGuard, offlineFallback)).toContain("return;");
    expect(source).toContain("You are ${activeTeacher.name}, a supportive language teacher.");
  });
});
