import { describe, expect, it } from "vitest";
import {
  canUseLevelForCurriculumUnlock,
  describePedagogicalLevel,
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
});
