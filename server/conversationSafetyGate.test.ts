import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserSafetyContext: vi.fn(),
  moderateAIResponse: vi.fn(),
  checkContent: vi.fn(),
  recordConversationSafetyAlert: vi.fn(),
}));

vi.mock("./content-moderation", () => ({
  getUserSafetyContext: mocks.getUserSafetyContext,
  moderateAIResponse: mocks.moderateAIResponse,
}));
vi.mock("./contentFilter", () => ({ checkContent: mocks.checkContent }));
vi.mock("./parentalConversationAlert", () => ({
  recordConversationSafetyAlert: mocks.recordConversationSafetyAlert,
}));

import { assessConversationText, ensureConversationAccess } from "./conversationSafetyGate";

describe("conversation safety gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserSafetyContext.mockResolvedValue({
      context: { userId: 7, ageGroup: "infantil", moderationLevel: "strict" },
      hasSafetyProfile: true,
      hasParentalConsent: true,
    });
    mocks.checkContent.mockResolvedValue({ isBlocked: false, matchedPatterns: [], category: null, severity: null });
    mocks.moderateAIResponse.mockResolvedValue({ isAllowed: true, flaggedContent: [] });
  });

  it("recusa conversa infantil sem consentimento verificável", async () => {
    mocks.getUserSafetyContext.mockResolvedValueOnce({
      context: { userId: 7, ageGroup: "infantil" },
      hasSafetyProfile: true,
      hasParentalConsent: false,
    });
    await expect(ensureConversationAccess(7)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia padrão determinístico antes da moderação semântica", async () => {
    mocks.checkContent.mockResolvedValueOnce({ isBlocked: true, matchedPatterns: ["padrão proibido"], category: "safety", severity: "block" });
    await expect(assessConversationText(7, "texto", "en-US")).resolves.toEqual({
      allowed: false,
      reason: "blocked_content",
      flaggedContent: ["padrão proibido"],
    });
    expect(mocks.moderateAIResponse).not.toHaveBeenCalled();
    expect(mocks.recordConversationSafetyAlert).toHaveBeenCalledWith(7, "blocked_input");
  });

  it("permite texto seguro para perfil com consentimento", async () => {
    await expect(assessConversationText(7, "Hello teacher", "en-US")).resolves.toMatchObject({ allowed: true });
    expect(mocks.moderateAIResponse).toHaveBeenCalledTimes(1);
  });
});
