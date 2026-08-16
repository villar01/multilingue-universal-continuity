import { describe, expect, it } from "vitest";
import { getScriptedExerciseFeedback } from "../client/src/lib/scriptedExerciseFeedback";

describe("contrato de feedback roteirizado", () => {
  it("reforça acerto sem encaminhar desnecessariamente", () => {
    const feedback = getScriptedExerciseFeedback("correct", "pt-BR");
    expect(feedback.teacherText).toContain("Parabéns");
    expect(feedback.studyHref).toBeNull();
  });

  it("mantém nova tentativa com ligação segura para reforço", () => {
    const feedback = getScriptedExerciseFeedback("retry", "en-US");
    expect(feedback.teacherText).toContain("Try again");
    expect(feedback.studyHref).toBe("/base-de-estudos?focus=pareto");
  });

  it("usa fallback linguístico seguro sem criar conversa livre", () => {
    const feedback = getScriptedExerciseFeedback("partial", "nl-NL");
    expect(feedback.teacherText).toContain("Good start");
    expect(feedback.studyPrompt).toContain("Quick Study");
  });
});
