import { describe, expect, it } from "vitest";
import {
  canUseLevelForCurriculumUnlock,
  describePedagogicalLevel,
  derivePedagogicalReadiness,
} from "./curriculum/learningLevelRoles";

describe("papéis dos níveis de aprendizagem", () => {
  it("não permite que XP ou contagem de lições liberem currículo por si só", () => {
    expect(canUseLevelForCurriculumUnlock("gamification_xp")).toBe(false);
    expect(canUseLevelForCurriculumUnlock("lesson_band")).toBe(false);
    expect(canUseLevelForCurriculumUnlock("pedagogical_passage")).toBe(true);
  });

  it("mantém a passagem pedagógica como métrica distinta", () => {
    expect(describePedagogicalLevel("technological").purpose).toContain("technological");
  });

  it("deriva domínio real do SRS sem liberar currículo por pontos ou lições", () => {
    const withoutSRS = derivePedagogicalReadiness({ completedLessons: 50, totalPoints: 9999 });
    expect(withoutSRS.averageMastery).toBeNull();
    expect(withoutSRS.masteryStatus).toBe("awaiting_assessed_responses");
    expect(withoutSRS.canUnlockCurriculum).toBe(false);
    expect(withoutSRS.meetsMasteryThreshold).toBe(false);

    const withSRS = derivePedagogicalReadiness({ completedLessons: 10, srsCorrect: 8, srsTotal: 10 });
    expect(withSRS.averageMastery).toBe(0.8);
    expect(withSRS.masteryStatus).toBe("derived_from_srs");
    expect(withSRS.canUnlockCurriculum).toBe(false); // domínio SRS não libera currículo sozinho
    expect(withSRS.meetsMasteryThreshold).toBe(false);

    const insufficientSRS = derivePedagogicalReadiness({ completedLessons: 5, srsCorrect: 3, srsTotal: 4 });
    expect(insufficientSRS.averageMastery).toBeNull(); // menos de 5 respostas SRS não gera domínio
    expect(insufficientSRS.masteryStatus).toBe("awaiting_assessed_responses");
  });
});
