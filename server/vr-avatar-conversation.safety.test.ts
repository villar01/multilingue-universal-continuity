import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureConversationAccess: vi.fn(),
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./conversationSafetyGate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./conversationSafetyGate")>()),
  ensureConversationAccess: mocks.ensureConversationAccess,
  assessConversationText: mocks.assessConversationText,
  assessConversationOutput: mocks.assessConversationOutput,
}));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";

const allowed = { allowed: true, context: { userId: 7, ageGroup: "adulto", moderationLevel: "standard" } };
const blocked = { allowed: false, reason: "blocked_content", flaggedContent: ["blocked"] };

function createCaller() {
  return appRouter.createCaller({ user: { id: 7 } } as any);
}

describe("vrConversation safety", () => {
  it("blocks unsafe avatar-turn input before any model request", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);
    const result = await createCaller().vrConversation.respond({
      scenario: "airport", avatarName: "James", avatarRole: "teacher", targetLanguage: "en-US", history: [], userMessage: "unsafe",
    });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result.translation).toContain("frase segura");
  });

  it("replaces unsafe avatar greetings after the safety-profile and output checks", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ text: "unsafe greeting", suggestions: ["unsafe"] }) } }] });

    const result = await createCaller().vrConversation.start({
      scenario: "airport", avatarName: "James", avatarRole: "teacher", targetLanguage: "en-US",
    });
    expect(mocks.ensureConversationAccess).toHaveBeenCalledWith(7);
    expect(result.translation).toContain("frase segura");
  });
});
