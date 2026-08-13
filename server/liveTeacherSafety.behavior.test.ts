import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  sanitizeContent: vi.fn(),
  logInteraction: vi.fn(),
  ensureConversationAccess: vi.fn(),
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
}));

vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./contentFilter", () => ({
  sanitizeContent: mocks.sanitizeContent,
  logInteraction: mocks.logInteraction,
}));
vi.mock("./conversationSafetyGate", () => ({
  ensureConversationAccess: mocks.ensureConversationAccess,
  assessConversationText: mocks.assessConversationText,
  assessConversationOutput: mocks.assessConversationOutput,
}));

import { liveTeacherRouter } from "./live-teacher-router";

const allowed = { allowed: true, context: { userId: 7, ageGroup: "adulto", moderationLevel: "standard" } };
const blocked = { allowed: false, reason: "blocked_content", flaggedContent: ["blocked"] };

function createCaller() {
  return liveTeacherRouter.createCaller({ user: { id: 7 } } as any);
}

function createAnonymousCaller() {
  return liveTeacherRouter.createCaller({ user: null } as any);
}

const chatInput = {
  message: "Hello",
  teacherName: "Sarah",
  targetLang: "en-US",
  nativeLang: "pt-BR",
  level: "A1" as const,
  lessonTopic: "Saudações",
  lessonNumber: 1,
  countryCode: "BR",
  history: [],
};

describe("comportamento seguro do Professor ao Vivo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sanitizeContent.mockImplementation(async (content: string) => content);
  });

  it("recusa uma conversa sem sessão autenticada antes de acessar modelo ou portão", async () => {
    await expect(createAnonymousCaller().chat(chatInput)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.ensureConversationAccess).not.toHaveBeenCalled();
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("bloqueia entrada incompatível antes de gerar uma resposta", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(blocked);

    const result = await createCaller().chat({ ...chatInput, message: "unsafe request" });

    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(result.blocked).toBe(true);
    expect(result.content).toContain("não pode ser usada neste perfil");
  });

  it("filtra a saída do modelo antes de exibi-la ou registrá-la", async () => {
    mocks.ensureConversationAccess.mockResolvedValue(allowed.context);
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "unsafe teacher response" } }] });

    const result = await createCaller().chat(chatInput);

    expect(mocks.assessConversationOutput).toHaveBeenCalledWith(7, "Hello", "unsafe teacher response", "en-US");
    expect(mocks.logInteraction).not.toHaveBeenCalled();
    expect(result.blocked).toBe(true);
    expect(result.content).toContain("explicação segura da lição");
  });
});
