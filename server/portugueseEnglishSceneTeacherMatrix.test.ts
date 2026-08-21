import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { resolveSceneTeacherForTarget } from "../client/src/lib/sceneTeacherResolver";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";
import { SOPHIE_CAFE_PILOT_CLIPS } from "../shared/sophieCafePilotClips";

const JAMES_SCENE_IDS = new Set([
  "beach", "forest", "newyork", "airport", "school", "cinema", "family_home",
  "airport_family", "paris", "kitchen", "restaurant", "supermarket", "hotel", "hospital",
]);
const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const clipGuardSource = readFileSync("client/src/lib/sceneTeacherClipGuard.ts", "utf8");
const PILOT_CLIPS = [...JAMES_TROPICAL_PILOT_CLIPS, ...SOPHIE_CAFE_PILOT_CLIPS];

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

  it("keeps every approved pilot clip behind the active scene and teacher identity guard", () => {
    expect(sceneSource).toContain("const showPilotClip = shouldRenderCompatibleTeacherClip({");
    expect(clipGuardSource).toContain("clip.sceneId === sceneId");
    expect(clipGuardSource).toContain("clip.teacherName === teacherName");

    for (const scene of IMMERSIVE_SCENES) {
      const teacher = resolveSceneTeacherForTarget(scene, "en-US", "pt-BR").teacher;
      const compatibleClips = PILOT_CLIPS.filter((clip) => (
        clip.sceneId === scene.id && clip.teacherName === teacher?.name
      ));

      if (scene.id === "beach") {
        expect(compatibleClips).toHaveLength(JAMES_TROPICAL_PILOT_CLIPS.length);
      } else {
        expect(compatibleClips).toHaveLength(0);
      }
    }
  });

  it("routes authorized dialogue and phrase reading through the active teacher voice and gender", () => {
    expect(sceneSource).toContain("teacherName: activeSceneTeacher.name");
    expect(sceneSource).toContain("teacherImage: activeSceneTeacher.photo || selectedScene.teacherImage");
    expect(sceneSource).toContain("teacherLang: activeSceneTeacher.voiceLang");
    expect(sceneSource).toContain("teacherGender: activeSceneTeacher.gender || selectedScene.teacherGender");
    expect(sceneSource).toContain("const activeTeachingScene = useMemo<Scene | null>(() => {");
    expect(sceneSource).toContain("...teachingScene,");
    expect(sceneSource).toContain("dialog: activeSceneDialog,");
    expect(sceneSource).toContain("hotspots: activeSceneHotspots,");
    expect(sceneSource).toContain('requestSpeechSafely(text, (teachingScene ?? selectedScene).teacherLang, (teachingScene ?? selectedScene).teacherGender, "hotspot")');
    expect(sceneSource).toContain('const effectiveGender = teachingScene?.teacherName === "James"');

    for (const scene of IMMERSIVE_SCENES) {
      const teacher = resolveSceneTeacherForTarget(scene, "en-US", "pt-BR").teacher;
      expect(teacher?.voiceLang).toBe("en-US");
      expect(teacher?.gender).toBe(JAMES_SCENE_IDS.has(scene.id) ? "male" : "female");
    }
  });
});
