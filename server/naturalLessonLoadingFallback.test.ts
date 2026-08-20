import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createLessonGenerationGuard, NATURAL_LESSON_GENERATION_TIMEOUT_MS } from "../client/src/lib/lessonGenerationGuard";

const source = readFileSync(
  path.resolve(import.meta.dirname, "../client/src/pages/NaturalLesson.tsx"),
  "utf8",
);

describe("saída segura de carregamento da Aula Natural", () => {
  it("limita a espera de geração e ignora respostas que chegam depois do limite", () => {
    let timerCallback: (() => void) | undefined;
    const timeoutEvents: string[] = [];
    const guard = createLessonGenerationGuard({
      onTimeout: () => timeoutEvents.push("timeout"),
      schedule: (callback, timeoutMs) => {
        expect(timeoutMs).toBe(NATURAL_LESSON_GENERATION_TIMEOUT_MS);
        timerCallback = callback;
        return 1 as ReturnType<typeof setTimeout>;
      },
      clear: () => undefined,
    });

    timerCallback?.();
    expect(timeoutEvents).toEqual(["timeout"]);
    expect(guard.finish(() => timeoutEvents.push("late-result"))).toBe(false);
    expect(timeoutEvents).toEqual(["timeout"]);
  });

  it("oferece nova tentativa e saída para outras aulas quando não há conteúdo", () => {
    expect(source).toContain("setRetryKey((current) => current + 1)");
    expect(source).toContain("createLessonGenerationGuard");
    expect(source).toContain("Tentar novamente");
    expect(source).toContain("Outras aulas");
    expect(source).toContain('navigate("/natural-learning")');
  });
});
