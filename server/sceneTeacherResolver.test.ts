import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getTargetLanguageTeachers, resolveSceneTeacherForTarget } from "../client/src/lib/sceneTeacherResolver";

const beachScene = {
  teacherLang: "en-US",
  teacherName: "James",
  teacherImage: "/manus-storage/prof_james_b9f2fff7.png",
  teacherGender: "male" as const,
};

describe("resolvedor de professor por idioma da cena", () => {
  it("seleciona um professor com retrato e voz compatíveis dentro da mesma família de idioma", () => {
    const result = resolveSceneTeacherForTarget(beachScene, "en-GB");
    expect(result.materialIsInTargetLanguage).toBe(true);
    expect(result.teacher?.voiceLang).toBe("en-GB");
    expect(result.teacher?.photo).toBeTruthy();
  });

  it("preserva o retrato original quando a cena ainda não recebeu material localizado para outro idioma", () => {
    const result = resolveSceneTeacherForTarget(beachScene, "es-ES");
    expect(result.teacher).toBeNull();
    expect(result.materialIsInTargetLanguage).toBe(false);
    expect(result.preserveScenePortrait).toBe(true);
  });

  it("oferece professores com retrato para cada um dos seis idiomas comerciais", () => {
    for (const targetLanguage of ["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"]) {
      const teachers = getTargetLanguageTeachers(targetLanguage);
      expect(teachers.length, targetLanguage).toBeGreaterThan(0);
      expect(teachers.every((teacher) => Boolean(teacher.photo))).toBe(true);
    }
  });

  it("liga o professor compatível ao avatar e aos fluxos de fala da cena", () => {
    const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
    expect(source).toContain("const teachingScene = useMemo<Scene | null>");
    expect(source).toContain("scene={teachingScene ?? selectedScene!}");
    expect(source).toContain("const dialogueScene = teachingScene ?? scene");
    expect(source).toContain("const scene = teachingScene ?? selectedScene");
  });
});
