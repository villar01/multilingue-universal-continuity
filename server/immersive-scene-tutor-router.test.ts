import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assessConversationText: vi.fn(),
  assessConversationOutput: vi.fn(),
  generateAI: vi.fn(),
}));

vi.mock("./conversationSafetyGate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./conversationSafetyGate")>()),
  assessConversationText: mocks.assessConversationText,
  assessConversationOutput: mocks.assessConversationOutput,
}));
vi.mock("./aiProvider", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./aiProvider")>()),
  generateAI: mocks.generateAI,
}));

import { appRouter } from "./routers";
import { buildImmersiveTutorPrompt } from "./immersive-scene-tutor-router";

const allowed = { allowed: true, context: { userId: 7, ageGroup: "adulto", moderationLevel: "standard" } };
const blocked = { allowed: false, reason: "blocked_content", flaggedContent: ["blocked"] };

const input = {
  teacherName: "James",
  targetLanguage: "English",
  targetLocale: "en-US",
  nativeLanguage: "pt-BR",
  sceneTitle: "Tropical Beach",
  sceneDescription: "A tropical beach lesson.",
  locationDisclosure: "This is a generic educational illustration; it is not assigned to a real country or city.",
  vocabulary: [{ label: "Ocean", translation: "Oceano", example: "The ocean is blue." }],
  studentMessage: "Where is the beach?",
  history: [],
};

function createCaller() {
  return appRouter.createCaller({ user: { id: 7 } } as any);
}

describe("tutor conversacional da Cena Imersiva", () => {
  it("inclui a regra de não inventar localização para uma ilustração genérica", () => {
    const prompt = buildImmersiveTutorPrompt(input);
    expect(prompt).toContain("generic educational illustration");
    expect(prompt).toContain("Never invent a real country");
    expect(prompt).toContain("Do not limit the student to visible objects");
  });

  it("bloqueia entrada insegura antes de chamar o modelo", async () => {
    mocks.assessConversationText.mockResolvedValue(blocked);
    const result = await createCaller().immersiveSceneTutor.chat({ ...input, studentMessage: "unsafe" });
    expect(mocks.generateAI).not.toHaveBeenCalled();
    expect(result).toMatchObject({ blocked: true, provider: "safety" });
  });

  it("devolve resposta livre segura e mantém Ollama como provedor preferencial", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(allowed);
    mocks.generateAI.mockResolvedValue({ content: "This illustration is a generic tropical beach lesson. Let us practise the word ocean.", provider: "ollama" });
    const result = await createCaller().immersiveSceneTutor.chat(input);
    expect(mocks.generateAI).toHaveBeenCalledWith(expect.objectContaining({ preferredProvider: "ollama", allowRemoteFallback: true }));
    expect(result).toMatchObject({ blocked: false, provider: "ollama" });
    expect(result.targetReply).toContain("generic tropical beach lesson");
  });

  it("substitui saída insegura por uma continuidade segura de estudo", async () => {
    mocks.assessConversationText.mockResolvedValue(allowed);
    mocks.assessConversationOutput.mockResolvedValue(blocked);
    mocks.generateAI.mockResolvedValue({ content: "unsafe", provider: "ollama" });
    const result = await createCaller().immersiveSceneTutor.chat(input);
    expect(result).toMatchObject({ blocked: true, provider: "safety" });
    expect(result.targetReply).toContain("vocabulary");
  });
});
