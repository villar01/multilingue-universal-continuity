import { describe, expect, it, vi } from "vitest";

vi.mock("./trial-access-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./trial-access-router")>();
  return {
    ...actual,
    getLearningContentEntitlement: vi.fn().mockResolvedValue({ hasFullCurriculum: true }),
    hasAuthorizedTrialLessonKey: vi.fn().mockResolvedValue(true),
  };
});

import { curriculumRouter } from "./curriculum-router";

describe("verificação autenticada do material canônico de cena", () => {
  it("entrega os hotspots e diálogos da Praia Tropical somente em uma sessão autorizada", async () => {
    const caller = curriculumRouter.createCaller({ user: { id: 41 } } as any);

    const material = await caller.sceneCanonicalMaterial({
      lessonKey: "pt-BR-en-US-a1-01",
      sceneId: "beach",
    });

    expect(material.dialog).toHaveLength(7);
    expect(material.hotspots).toHaveLength(4);
    expect(material.hotspots).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "palm", label: "Palm Tree" }),
    ]));
  });
});
