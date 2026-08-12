import { describe, expect, it } from "vitest";
import { buildLessonProgression } from "../client/src/lib/lessonProgression";

const lessons = [
  { id: 3, orderIndex: 3 },
  { id: 1, orderIndex: 1 },
  { id: 2, orderIndex: 2 },
];

describe("buildLessonProgression", () => {
  it("ordena as lições e abre apenas a primeira não concluída", () => {
    const progression = buildLessonProgression(lessons, [1], true, 5);

    expect(progression.map((lesson) => lesson.id)).toEqual([1, 2, 3]);
    expect(progression[0].completed).toBe(true);
    expect(progression[1].progressLocked).toBe(false);
    expect(progression[2].progressLocked).toBe(true);
  });

  it("mantém o bloqueio de plano separado do bloqueio por progresso", () => {
    const progression = buildLessonProgression(lessons, [1, 2], false, 2);

    expect(progression[2].progressLocked).toBe(false);
    expect(progression[2].locked).toBe(true);
  });
});
