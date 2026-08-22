import { describe, expect, it, vi } from "vitest";

const entitlement = vi.hoisted(() => ({
  getLearningContentEntitlement: vi.fn(),
  hasAuthorizedTrialLessonKey: vi.fn(),
}));

vi.mock("./trial-access-router", () => entitlement);

import { curriculumRouter } from "./curriculum-router";

describe("checagem funcional autenticada da Cena Imersiva", () => {
  it("entrega o material canônico da Praia Tropical a uma sessão autorizada", async () => {
    entitlement.getLearningContentEntitlement.mockResolvedValue({ hasFullCurriculum: true });
    entitlement.hasAuthorizedTrialLessonKey.mockResolvedValue(true);
    const caller = curriculumRouter.createCaller({ user: { id: 7001 } } as any);

    const material = await caller.sceneCanonicalMaterial({
      lessonKey: "release-gate-immersive-scene",
      sceneId: "beach",
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
    });

    expect(entitlement.getLearningContentEntitlement).toHaveBeenCalledWith(7001);
    expect(entitlement.hasAuthorizedTrialLessonKey).toHaveBeenCalledWith(7001, "release-gate-immersive-scene", { hasFullCurriculum: true });
    expect(material.dialog[0]).toMatchObject({ speaker: "teacher", text: expect.stringContaining("James") });
    expect(material.hotspots).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "palm", label: "Palm Tree" }),
    ]));
  });
});
