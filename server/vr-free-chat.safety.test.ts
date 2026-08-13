import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./conversationSafetyGate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./conversationSafetyGate")>()),
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

describe("vrConversation.freeChat safety", () => {
  it("does not send unsafe free-talk input to the language model", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);

    const result = await createCaller().vrConversation.freeChat({
      targetLanguage: "en-US", nativeLanguage: "pt-BR", level: "beginner", history: [], userMessage: "unsafe message",
    });

    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result.translation).toContain("frase segura");
  });

  it("replaces a blocked generated free-talk response with the safe teaching fallback", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ text: "unsafe output", suggestions: ["unsafe suggestion"] }) } }] });

    const result = await createCaller().vrConversation.freeChat({
      targetLanguage: "en-US", nativeLanguage: "pt-BR", level: "beginner", history: [], userMessage: "Hello",
    });

    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", expect.stringContaining("unsafe output"), "en-US");
    expect(result.text).toContain("safe language-practice");
  });
});
