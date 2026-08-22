import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const chatbot = readFileSync(new URL("../client/src/components/AIChatbot.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const engine = readFileSync(new URL("./_core/conversationalAI.ts", import.meta.url), "utf8");

describe("consentimento de prática local", () => {
  it("expõe opção voluntária, persistida e reversível no chat guiado", () => {
    expect(chatbot).toContain("ml_local_qwen_consent_");
    expect(chatbot).toContain("updateLocalQwenConsent");
    expect(chatbot).toContain("Esta opção é voluntária");
    expect(chatbot).toContain("allowLocalQwen");
  });

  it("encaminha somente a opção explícita até o motor de conversação protegido", () => {
    expect(router).toContain("allowLocalQwen: z.boolean().optional().default(false)");
    expect(router).toContain("allowLocalQwen: input.allowLocalQwen");
    expect(engine).toContain("allowLocalQwen: context.allowLocalQwen === true");
  });
});
