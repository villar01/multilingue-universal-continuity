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

describe("polyLesson.sceneChat safety", () => {
  const input = {
    targetLanguage: "en-US", nativeLanguage: "pt-BR", sceneId: "beach", sceneDescription: "A safe beach scene.", studentMessage: "Hello", history: [],
  };

  it("blocks unsafe scene-chat input before generating an answer", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);
    const result = await createCaller().polyLesson.sceneChat({ ...input, studentMessage: "unsafe" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result).toMatchObject({ reply: "", blocked: true });
  });

  it("replaces unsafe generated scene-chat output", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "unsafe scene reply" } }] });
    const result = await createCaller().polyLesson.sceneChat(input);
    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", "unsafe scene reply", "en-US");
    expect(result).toMatchObject({ reply: "", blocked: true });
  });
});
