import { describe, expect, it } from "vitest";
import { resolveSceneTeacherForTarget } from "../client/src/lib/sceneTeacherResolver";

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
});
