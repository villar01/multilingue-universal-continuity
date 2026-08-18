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

  it("mantém acerto, nova tentativa, dica e reforço nos seis idiomas comerciais", () => {
    for (const language of ["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"]) {
      const correct = getScriptedExerciseFeedback("correct", language);
      const retry = getScriptedExerciseFeedback("retry", language);
      const partial = getScriptedExerciseFeedback("partial", language);

      expect(correct.teacherText).not.toBe("");
      expect(correct.learnerText).not.toBe("");
      expect(correct.studyHref).toBeNull();
      expect(retry.teacherText).not.toBe("");
      expect(retry.studyPrompt).not.toBe("");
      expect(retry.studyHref).toBe("/base-de-estudos?focus=pareto");
      expect(partial.teacherText).not.toBe("");
      expect(partial.studyPrompt).not.toBe("");
      expect(partial.studyHref).toBe("/base-de-estudos?focus=pareto");
    }
  });
});
