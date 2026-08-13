import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const engineSource = readFileSync(new URL("./_core/conversationalAI.ts", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../client/src/pages/RoleplayPage.tsx", import.meta.url), "utf8");

describe("roleplay CEFR e segurança", () => {
  it("usa os seis níveis CEFR no motor e em todos os procedimentos de conversa", () => {
    expect(engineSource).toContain('export type ConversationCEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"');
    expect(engineSource).toContain("CONVERSATION_LEVEL_GUIDANCE");
    expect(routerSource.match(/userLevel: z\.enum\(\["A1", "A2", "B1", "B2", "C1", "C2"\]\)/g)).toHaveLength(4);
  });

  it("exige autenticação e modera entrada e saída em cada fluxo do roleplay", () => {
    const segment = routerSource.slice(routerSource.indexOf("conversationAI: router({"), routerSource.indexOf("// Tradução em tempo real"));
    expect(segment.match(/protectedProcedure/g)).toHaveLength(4);
    expect(segment.match(/ensureConversationAccess\(ctx\.user\.id\)/g)).toHaveLength(4);
    expect(segment.match(/assessConversationText\(ctx\.user\.id/g)).toHaveLength(4);
    expect(segment.match(/assessConversationOutput\(ctx\.user\.id/g)).toHaveLength(4);
  });

  it("envia para o roleplay a língua e o nível escolhidos, sem fixar beginner/en/pt", () => {
    expect(pageSource).toContain("resolvePracticeCEFRLevel");
    expect(pageSource).toContain('localStorage.getItem("ml_target_lang")');
    expect(pageSource).toContain('localStorage.getItem("ml_native_lang")');
    expect(pageSource).not.toContain('userLevel: "beginner"');
  });

  it("consome a pergunta e a resposta da rota protegida sem depender de sessão ou nós incompatíveis", () => {
    expect(pageSource).toContain("result?.question");
    expect(pageSource).toContain("result?.response");
    expect(pageSource).not.toContain("result?.firstNode");
    expect(pageSource).not.toContain("result.nextNode");
    expect(pageSource).not.toContain("sessionId");
  });
});
