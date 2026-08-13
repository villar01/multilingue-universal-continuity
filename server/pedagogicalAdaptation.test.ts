import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const lessonSource = readFileSync(new URL("../client/src/pages/Lesson.tsx", import.meta.url), "utf8");
const pedagogicalSource = readFileSync(new URL("../client/src/components/PedagogicalLesson.tsx", import.meta.url), "utf8");

describe("adaptação de exercício pedagógico", () => {
  it("persiste somente o tipo de erro do aluno por uma rota autenticada", () => {
    expect(routerSource).toContain("adaptiveLearning: router");
    expect(routerSource).toContain("recordPedagogicalAttempt: protectedProcedure");
    expect(routerSource).toContain("db.recordErrorPattern");
    expect(routerSource).toContain("pedagogical:${input.lessonId}:${input.exerciseType}");
    expect(routerSource).not.toContain("answer: z.string");
  });

  it("registra a tentativa no fluxo da lição e oferece uma única revisão corretiva", () => {
    expect(lessonSource).toContain("trpc.adaptiveLearning.recordPedagogicalAttempt.useMutation()");
    expect(lessonSource).toContain("onExerciseAnswered={({ exerciseType, cefrLevel, correct }) =>");
    expect(pedagogicalSource).toContain("setAwaitingCorrectiveRetry(!correct)");
    expect(pedagogicalSource).toContain("if (!isCorrect && awaitingCorrectiveRetry)");
    expect(pedagogicalSource).toContain("Tentar novamente com a dica");
  });

  it("usa os formatos de erro persistidos para reforçar a próxima lição autenticada sem enviar respostas", () => {
    expect(routerSource).toContain("generateLessonContent: protectedProcedure");
    expect(routerSource).toContain("const errorPatterns = await db.getUserErrorPatterns(ctx.user.id)");
    expect(routerSource).toContain("const weakExerciseTypes = errorPatterns");
    expect(routerSource).toContain("Include one additional gentle, vocabulary-only reinforcement exercise");
    expect(routerSource).not.toContain("input.wrongAnswers");
  });

  it("não libera perguntas sem vocabulário e exige a memorização antes dos exercícios", () => {
    expect(pedagogicalSource).toContain("Material da lição indisponível");
    expect(pedagogicalSource).toContain("não libera perguntas até que vocabulário e exemplos de estudo estejam disponíveis");
    expect(pedagogicalSource).toContain("const allMatched = memorizedWords.size === vocab.length");
    expect(pedagogicalSource).toContain("onClick={() => setStage('exercises')}");
    expect(pedagogicalSource).not.toContain("Pular memorização");
  });
});
