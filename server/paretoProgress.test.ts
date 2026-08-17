import { describe, expect, it } from "vitest";
import { completedProgramCount } from "../client/src/lib/paretoProgress";

describe("progresso do programa Pareto", () => {
  it("conta os termos concluídos de toda a trilha, não somente da sessão visível", () => {
    const completed = new Set(["p001", "p002", "p011", "p012"]);
    expect(completedProgramCount(completed, 1000)).toBe(4);
  });

  it("não ultrapassa o total de termos autorizados", () => {
    const completed = new Set(["p001", "p002", "p003"]);
    expect(completedProgramCount(completed, 2)).toBe(2);
  });
});
