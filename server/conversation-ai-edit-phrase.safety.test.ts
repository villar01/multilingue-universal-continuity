import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
  invokeLLM: vi.fn(),
  sanitizeContent: vi.fn(),
}));

vi.mock("./conversationSafetyGate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./conversationSafetyGate")>()),
  assessConversationText: mocks.assessConversationText,
  assessConversationOutput: mocks.assessConversationOutput,
}));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./contentFilter", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./contentFilter")>()),
  sanitizeContent: mocks.sanitizeContent,
}));

import { appRouter } from "./routers";

const allowed = { allowed: true, context: { userId: 7, ageGroup: "adulto", moderationLevel: "standard" } };
const blocked = { allowed: false, reason: "blocked_content", flaggedContent: ["blocked"] };
const input = { originalPhrase: "I like the beach.", targetLanguage: "en-US", nativeLanguage: "pt-BR", editType: "improve" as const };

function createCaller() {
  return appRouter.createCaller({ user: { id: 7 } } as any);
}

describe("conversationAI.editPhrase safety", () => {
  it("blocks unsafe phrase-editing input before generation", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);
    const result = await createCaller().conversationAI.editPhrase({ ...input, originalPhrase: "unsafe" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result).toEqual({ suggestions: "", blocked: true });
  });

  it("replaces unsafe generated phrase suggestions", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "unsafe suggestion" } }] });
    mocks.sanitizeContent.mockResolvedValue("unsafe suggestion");
    const result = await createCaller().conversationAI.editPhrase(input);
    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, input.originalPhrase, "unsafe suggestion", "en-US");
    expect(result).toEqual({ suggestions: "", blocked: true });
  });
});
