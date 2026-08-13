import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureConversationAccess: vi.fn(),
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
  invokeLLM: vi.fn(),
  sanitizeContent: vi.fn(),
}));

vi.mock("./conversationSafetyGate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./conversationSafetyGate")>()),
  ensureConversationAccess: mocks.ensureConversationAccess,
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
const input = { text: "Hello", fromLanguage: "en-US", toLanguage: "pt-BR" };

function createCaller(user: { id: number } | null = { id: 7 }) {
  return appRouter.createCaller({ user } as any);
}

describe("conversationAI.translateRealtime safety", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recusa visitante antes de acionar o modelo", async () => {
    await expect(createCaller(null).conversationAI.translateRealtime(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("bloqueia entrada incompatível antes de solicitar tradução", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(blocked);

    const result = await createCaller().conversationAI.translateRealtime({ ...input, text: "unsafe" });

    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result).toEqual({ translation: "", wordByWord: [], blocked: true });
  });

  it("bloqueia saída incompatível antes de devolvê-la ao editor", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: '{"translation":"unsafe","wordByWord":[]}' } }] });
    mocks.sanitizeContent.mockResolvedValue('{"translation":"unsafe","wordByWord":[]}');

    const result = await createCaller().conversationAI.translateRealtime(input);

    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", '{"translation":"unsafe","wordByWord":[]}', "pt-BR");
    expect(result).toEqual({ translation: "", wordByWord: [], blocked: true });
  });
});
