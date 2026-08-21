import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { resolveSceneTeacherForTarget } from "../client/src/lib/sceneTeacherResolver";

const JAMES_SCENE_IDS = new Set([
  "beach", "forest", "newyork", "airport", "school", "cinema", "family_home",
  "airport_family", "paris", "kitchen", "restaurant", "supermarket", "hotel", "hospital",
]);

describe("Portuguese-English immersive scene teacher matrix", () => {
  it("assigns exactly 14 James scenes and 15 Ingrid scenes across the 29 visual previews", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);

    const resolutions = IMMERSIVE_SCENES.map((scene) => ({
      scene,
      resolution: resolveSceneTeacherForTarget(scene, "en-US", "pt-BR"),
    }));

    const james = resolutions.filter(({ resolution }) => resolution.teacher?.name === "James");
    const ingrid = resolutions.filter(({ resolution }) => resolution.teacher?.name === "Ingrid");

    expect(james).toHaveLength(14);
    expect(ingrid).toHaveLength(15);
    expect(james.map(({ scene }) => scene.id).sort()).toEqual([...JAMES_SCENE_IDS].sort());
  });

  it("locks every Portuguese-English scene to an en-US teacher, portrait and voice", () => {
    for (const scene of IMMERSIVE_SCENES) {
      const resolution = resolveSceneTeacherForTarget(scene, "en-US", "pt-BR");
      expect(resolution.lockedToLanguagePair).toBe(true);
      expect(resolution.materialIsInTargetLanguage).toBe(true);
      expect(resolution.teacher?.name).toMatch(/^(James|Ingrid)$/);
      expect(resolution.teacher?.voiceLang).toBe("en-US");
      expect(resolution.teacher?.photo).toMatch(/prof_james|teacher-ingrid-english/);
    }
  });

  it("preserves the exact canonical identity bundle for every scene without cross-teacher substitution", () => {
    for (const scene of IMMERSIVE_SCENES) {
      const teacher = resolveSceneTeacherForTarget(scene, "en-US", "pt-BR").teacher;
      const usesJames = JAMES_SCENE_IDS.has(scene.id);

      expect(teacher).toMatchObject({
        id: usesJames ? "scene-james-en-us" : "scene-ingrid-en-us",
        name: usesJames ? "James" : "Ingrid",
        nativeName: usesJames ? "James" : "Ingrid",
        language: "English (US)",
        langCode: "en",
        voiceLang: "en-US",
        photo: usesJames
          ? "/manus-storage/prof_james_b9f2fff7.png"
          : "/manus-storage/teacher-ingrid-english_b938d99a.png",
        gender: usesJames ? "male" : "female",
      });
    }
  });
});
