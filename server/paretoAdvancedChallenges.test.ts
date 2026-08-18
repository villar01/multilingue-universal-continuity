import { describe, expect, it } from "vitest";
import { getParetoAdvancedChallenge } from "./curriculum/paretoAdvancedChallenges";

describe("desafios estruturais do Curso Pareto avançado", () => {
  it("evolui de ordem simples para conectores e condição", () => {
    expect(getParetoAdvancedChallenge(0).level).toBe("Inicial");
    expect(getParetoAdvancedChallenge(2).focus).toContain("Conector");
    expect(getParetoAdvancedChallenge(3).answer).toContain("If I had known");
  });
});
