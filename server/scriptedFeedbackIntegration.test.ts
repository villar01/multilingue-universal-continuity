import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readClientFile = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("integração do feedback roteirizado", () => {
  it("usa o contrato na cena sem envolver o chat livre", () => {
    const source = readClientFile("client/src/components/SceneLesson.tsx");
    expect(source).toContain("getScriptedExerciseFeedback");
    expect(source).toContain("if (!isCorrect) return;");
    expect(source).toContain("studyPrompt");
    expect(source).toContain("sceneChat");
  });

  it("preserva a nova tentativa corretiva da lição pedagógica", () => {
    const source = readClientFile("client/src/components/PedagogicalLesson.tsx");
    expect(source).toContain("getScriptedExerciseFeedback");
    expect(source).toContain("setAwaitingCorrectiveRetry(!correct)");
    expect(source).toContain("Tentar novamente com a dica");
  });

  it("orienta pronúncia a reforço sem mudar gravação ou transcrição", () => {
    const source = readClientFile("client/src/components/PronunciationExercise.tsx");
    expect(source).toContain("getScriptedExerciseFeedback");
    expect(source).toContain("voiceTranscription.transcribe");
    expect(source).toContain("Gravar Pronúncia");
  });

  it("leva a língua nativa da cena ao Ciclo Pareto e preserva a prática de memória", () => {
    const cycle = readClientFile("client/src/components/ParetoPracticeCycle.tsx");
    const panel = readClientFile("client/src/components/ParetoPanel.tsx");
    const scene = readClientFile("client/src/pages/ImmersiveScene.tsx");
    const pareto = readClientFile("client/src/pages/Pareto1000.tsx");

    expect(cycle).toContain('import { getScriptedExerciseFeedback } from "@/lib/scriptedExerciseFeedback";');
    expect(cycle).toContain('feedbackLanguage?: string;');
    expect(cycle).toContain('getScriptedExerciseFeedback(correct ? "correct" : "retry", feedbackLanguage)');
    expect(cycle).toContain("checkParetoRecall");
    expect(cycle).toContain("checkParetoSentence");
    expect(panel).toContain("nativeLang?: string;");
    expect(panel).toContain("feedbackLanguage={nativeLang}");
    expect(scene).toContain("nativeLang={nativeLang}");
    expect(pareto).toContain("feedbackLanguage={nativeLanguage}");
    expect(pareto).toContain("recordSuccessfulParetoReview");
  });
});
