import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/VoiceConversation.tsx"), "utf8");

describe("fala regional da conversa por voz", () => {
  it("não envia ajuda nativa a uma voz configurada para o idioma-alvo", () => {
    expect(source).toContain("const teacherSpeechText = targetText.trim()");
    expect(source).toContain("if (!teacherSpeechText)");
    expect(source).toContain("A resposta segura foi exibida sem áudio no idioma-alvo.");
    expect(source).not.toContain("const teacherSpeechText = targetText || nativeText");
  });
});
