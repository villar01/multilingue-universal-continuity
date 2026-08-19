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

function createCaller() {
  return appRouter.createCaller({ user: { id: 7 } } as any);
}

describe("ai.freeChat safety", () => {
  it("recusa visitante antes de avaliar ou gerar uma conversa livre", async () => {
    vi.clearAllMocks();
    const anonymousCaller = appRouter.createCaller({ user: null } as any);

    await expect(anonymousCaller.ai.freeChat({ messages: [{ role: "user", content: "Hello" }] }))
      .rejects.toMatchObject({ code: "UNAUTHORIZED" });

    expect(mocks.assessConversationText).not.toHaveBeenCalled();
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("blocks unfit free-chat content before it reaches the model", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);
    const result = await createCaller().ai.freeChat({ messages: [{ role: "user", content: "unsafe" }] });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result.content).toContain("frase segura");
  });

  it("filters generated free-chat content through output safety", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "unsafe output" } }] });
    mocks.sanitizeContent.mockResolvedValue("unsafe output");
    const result = await createCaller().ai.freeChat({ messages: [{ role: "user", content: "Hello" }] });
    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", "unsafe output", "pt-BR");
    expect(result.content).toContain("frase segura");
  });
});
