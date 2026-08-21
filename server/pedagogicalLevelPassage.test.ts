import { describe, expect, it } from "vitest";
import {
  canPassPedagogicalLevel,
  PEDAGOGICAL_LEVEL_PASSAGE,
} from "./curriculum/pedagogicalLevelPassage";

describe("passagem entre níveis pedagógicos", () => {
  it("exige domínio progressivo e evidências apropriadas", () => {
    expect(PEDAGOGICAL_LEVEL_PASSAGE.initial.minimumMastery).toBeLessThan(
      PEDAGOGICAL_LEVEL_PASSAGE.intermediate.minimumMastery,
    );
    expect(PEDAGOGICAL_LEVEL_PASSAGE.intermediate.minimumMastery).toBeLessThan(
      PEDAGOGICAL_LEVEL_PASSAGE.advanced.minimumMastery,
    );
    expect(canPassPedagogicalLevel("initial", {
      mastery: 0.7,
      evidence: ["concept_recognition", "guided_practice", "short_response"],
    })).toBe(true);
    expect(canPassPedagogicalLevel("advanced", {
      mastery: 0.86,
      evidence: ["contextual_correction", "independent_transfer"],
    })).toBe(false);
  });

  it("mantém o nível tecnológico protegido até existir conteúdo aprovado", () => {
    expect(PEDAGOGICAL_LEVEL_PASSAGE.technological.contentStatus).toBe("planned_protected");
    expect(canPassPedagogicalLevel("technological", {
      mastery: 1,
      evidence: ["independent_transfer", "domain_application"],
    })).toBe(false);
  });
});
