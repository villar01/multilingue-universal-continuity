import { describe, expect, it } from "vitest";
import { buildSafeConversationAlert } from "./parentalConversationAlert";

describe("parental conversation alert", () => {
  it("never places a blocked input in the parent-visible alert copy", () => {
    const alert = buildSafeConversationAlert("blocked_input");
    expect(alert.alertType).toBe("content_blocked");
    expect(alert.detail).toContain("não foi armazenado");
    expect(alert.detail).not.toContain("mensagem original");
  });

  it("distinguishes blocked output without exposing generated text", () => {
    const alert = buildSafeConversationAlert("blocked_output");
    expect(alert.title).toContain("Resposta bloqueada");
    expect(alert.detail).toContain("não foi armazenado");
  });

  it("registra a desativação parental de IA sem expor texto da conversa", () => {
    const alert = buildSafeConversationAlert("ai_conversations_disabled");
    expect(alert.alertType).toBe("ai_conversations_disabled");
    expect(alert.detail).toContain("não foi armazenado");
    expect(alert.detail).not.toContain("mensagem original");
  });
});
