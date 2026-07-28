import { describe, expect, it } from "vitest";
import { MASTER_LESSONS } from "../client/src/pages/MasterLesson";

describe("MasterLesson — teacherGender dinâmico", () => {
  it("cada lição tem teacherGender definido (male ou female)", () => {
    for (const lesson of MASTER_LESSONS) {
      expect(lesson.teacherGender).toBeDefined();
      expect(["male", "female"]).toContain(lesson.teacherGender);
    }
  });

  it("lição de espanhol (es-level1) usa professor masculino", () => {
    const esLesson = MASTER_LESSONS.find(l => l.id === "es-level1");
    expect(esLesson).toBeDefined();
    expect(esLesson!.teacherGender).toBe("male");
  });

  it("lição de inglês (en-level1) usa professora feminina", () => {
    const enLesson = MASTER_LESSONS.find(l => l.id === "en-level1");
    expect(enLesson).toBeDefined();
    expect(enLesson!.teacherGender).toBe("female");
  });

  it("lição de francês (fr-level1) usa professora feminina", () => {
    const frLesson = MASTER_LESSONS.find(l => l.id === "fr-level1");
    expect(frLesson).toBeDefined();
    expect(frLesson!.teacherGender).toBe("female");
  });
});
