export type ScriptedFeedbackOutcome = "correct" | "retry" | "partial";

export interface ScriptedExerciseFeedback {
  outcome: ScriptedFeedbackOutcome;
  teacherText: string;
  learnerText: string;
  studyPrompt: string;
  studyHref: string | null;
}

type FeedbackCopy = Omit<ScriptedExerciseFeedback, "outcome" | "studyHref">;

const COPY_BY_LANGUAGE: Record<string, Record<ScriptedFeedbackOutcome, FeedbackCopy>> = {
  pt: {
    correct: { teacherText: "Parabéns! Você acertou.", learnerText: "Resposta correta. Continue para o próximo exercício.", studyPrompt: "" },
    retry: { teacherText: "Tente novamente. Ouça a palavra e use a dica.", learnerText: "Você pode repetir sem perder a atividade.", studyPrompt: "Reveja a palavra no Pareto ou na Consulta Rápida." },
    partial: { teacherText: "Bom começo. Ouça mais uma vez e repita devagar.", learnerText: "A prática está no caminho certo; ajuste a pronúncia antes de avançar.", studyPrompt: "Abra Pareto ou Consulta Rápida para reforçar." },
  },
  es: {
    correct: { teacherText: "¡Muy bien! Acertaste.", learnerText: "Respuesta correcta. Continúa al próximo ejercicio.", studyPrompt: "" },
    retry: { teacherText: "Inténtalo de nuevo. Escucha la palabra y usa la pista.", learnerText: "Puedes repetir sin perder la actividad.", studyPrompt: "Repasa la palabra en Pareto o Consulta Rápida." },
    partial: { teacherText: "Buen comienzo. Escucha una vez más y repite despacio.", learnerText: "Vas bien; ajusta la pronunciación antes de avanzar.", studyPrompt: "Abre Pareto o Consulta Rápida para reforzar." },
  },
  fr: {
    correct: { teacherText: "Très bien ! C'est correct.", learnerText: "Bonne réponse. Continuez avec l'exercice suivant.", studyPrompt: "" },
    retry: { teacherText: "Réessayez. Écoutez le mot et utilisez l'indice.", learnerText: "Vous pouvez répéter sans perdre l'activité.", studyPrompt: "Révisez le mot dans Pareto ou Consultation rapide." },
    partial: { teacherText: "Bon début. Écoutez encore une fois et répétez lentement.", learnerText: "Vous êtes sur la bonne voie ; ajustez la prononciation avant de continuer.", studyPrompt: "Ouvrez Pareto ou Consultation rapide pour renforcer." },
  },
  de: {
    correct: { teacherText: "Sehr gut! Das ist richtig.", learnerText: "Richtige Antwort. Weiter zur nächsten Übung.", studyPrompt: "" },
    retry: { teacherText: "Versuchen Sie es noch einmal. Hören Sie das Wort und nutzen Sie den Hinweis.", learnerText: "Sie können wiederholen, ohne die Aktivität zu verlieren.", studyPrompt: "Wiederholen Sie das Wort in Pareto oder in der Schnellsuche." },
    partial: { teacherText: "Guter Anfang. Hören Sie noch einmal zu und sprechen Sie langsam nach.", learnerText: "Sie sind auf dem richtigen Weg; verbessern Sie die Aussprache vor dem Weitergehen.", studyPrompt: "Öffnen Sie Pareto oder die Schnellsuche zum Üben." },
  },
  it: {
    correct: { teacherText: "Molto bene! È corretto.", learnerText: "Risposta corretta. Continua al prossimo esercizio.", studyPrompt: "" },
    retry: { teacherText: "Riprova. Ascolta la parola e usa il suggerimento.", learnerText: "Puoi ripetere senza perdere l'attività.", studyPrompt: "Ripassa la parola in Pareto o nella Consulta Rapida." },
    partial: { teacherText: "Buon inizio. Ascolta ancora una volta e ripeti lentamente.", learnerText: "Stai andando bene; regola la pronuncia prima di continuare.", studyPrompt: "Apri Pareto o Consulta Rapida per rinforzare." },
  },
  en: {
    correct: { teacherText: "Excellent. You got it right.", learnerText: "Correct answer. Continue to the next exercise.", studyPrompt: "" },
    retry: { teacherText: "Try again. Listen to the word and use the hint.", learnerText: "You can repeat without losing your activity.", studyPrompt: "Review the word in Pareto or Quick Study." },
    partial: { teacherText: "Good start. Listen once more and repeat slowly.", learnerText: "You are on the right track; adjust your pronunciation before moving on.", studyPrompt: "Open Pareto or Quick Study for reinforcement." },
  },
};

function languageBase(languageCode: string): string {
  return languageCode.trim().toLowerCase().split("-")[0] || "en";
}

export function getScriptedExerciseFeedback(
  outcome: ScriptedFeedbackOutcome,
  languageCode: string,
): ScriptedExerciseFeedback {
  const copy = (COPY_BY_LANGUAGE[languageBase(languageCode)] ?? COPY_BY_LANGUAGE.en)[outcome];
  return {
    outcome,
    ...copy,
    studyHref: outcome === "correct" ? null : "/base-de-estudos?focus=pareto",
  };
}
