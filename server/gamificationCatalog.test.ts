import { describe, expect, it } from "vitest";
import { GAMIFICATION_CATALOG } from "./gamification-catalog";

describe("Catálogo pedagógico de conquistas", () => {
  it("define somente requisitos que o sistema mede no perfil de gamificação", () => {
    const measurableRequirements = new Set(["lessons", "exercises", "streak", "words", "pronunciation", "points"]);
    expect(GAMIFICATION_CATALOG).toHaveLength(11);
    for (const achievement of GAMIFICATION_CATALOG) {
      expect(measurableRequirements.has(achievement.requirementType)).toBe(true);
      expect(achievement.requirementValue).toBeGreaterThan(0);
      expect(achievement.pointsReward).toBeGreaterThan(0);
    }
  });

  it("mantém uma definição identificável e sem estado de progresso de aluno", () => {
    const names = GAMIFICATION_CATALOG.map((achievement) => achievement.name);
    expect(new Set(names).size).toBe(names.length);
    expect(JSON.stringify(GAMIFICATION_CATALOG)).not.toContain('"unlocked"');
    expect(JSON.stringify(GAMIFICATION_CATALOG)).not.toContain('"progress"');
  });
});
