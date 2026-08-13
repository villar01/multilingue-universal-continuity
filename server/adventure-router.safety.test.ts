import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  generateRoleplayFollowUps: vi.fn(),
  ensureConversationAccess: vi.fn(),
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
}));

vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./roleplayFollowUps", () => ({ generateRoleplayFollowUps: mocks.generateRoleplayFollowUps }));
vi.mock("./conversationSafetyGate", () => ({
  ensureConversationAccess: mocks.ensureConversationAccess,
  assessConversationText: mocks.assessConversationText,
  assessConversationOutput: mocks.assessConversationOutput,
}));

import { adventureRouter } from "./adventure-router";

const allowed = { allowed: true, context: { userId: 7, ageGroup: "adulto", moderationLevel: "standard" } };
const blocked = { allowed: false, reason: "blocked_content", flaggedContent: ["blocked"] };

function createCaller() {
  return adventureRouter.createCaller({ user: { id: 7 } } as any);
}

function createAnonymousCaller() {
  return adventureRouter.createCaller({ user: null } as any);
}

describe("adventure roleplay safety", () => {
  it("rejects an unauthenticated roleplay request before any safety or model work", async () => {
    await expect(createAnonymousCaller().chat({
      scenarioId: "restaurant", userMessage: "Hello", languageCode: "en-US", targetLanguage: "English", history: [],
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("blocks unsafe student input before any roleplay generation", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(blocked);

    const result = await createCaller().chat({
      scenarioId: "restaurant", userMessage: "unsafe request", languageCode: "en-US", targetLanguage: "English", history: [],
    });

    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(mocks.generateRoleplayFollowUps).not.toHaveBeenCalled();
    expect(result.translation).toContain("frase segura");
  });

  it("checks generated NPC output before translation and reply-option generation", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "unsafe NPC message" } }] });

    const result = await createCaller().chat({
      scenarioId: "restaurant", userMessage: "Hello", languageCode: "en-US", targetLanguage: "English", history: [],
    });

    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", "unsafe NPC message", "en-US");
    expect(mocks.generateRoleplayFollowUps).not.toHaveBeenCalled();
    expect(result.npcMessage).toContain("safe language-practice");
  });
});
