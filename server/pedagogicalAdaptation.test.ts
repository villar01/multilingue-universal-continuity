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
});
