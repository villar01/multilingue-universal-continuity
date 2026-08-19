import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { SCENE_TEACHER_MOTION_CATALOG } from "../shared/sceneTeacherMotionCatalog";

describe("retratos canônicos nas cenas imersivas", () => {
  it("mantém as 29 cenas vinculadas a um professor com retrato fotográfico canônico", () => {
    expect(SCENE_TEACHER_MOTION_CATALOG).toHaveLength(29);

    for (const scene of SCENE_TEACHER_MOTION_CATALOG) {
      const visualScene = IMMERSIVE_SCENES.find((candidate) => candidate.id === scene.sceneId);

      expect(visualScene, `A cena ${scene.sceneId} precisa de uma definição visual`).toBeDefined();
      expect(visualScene?.teacherName).toBe(scene.teacherName);
      expect(visualScene?.teacherImage).toMatch(/^\/manus-storage\/prof_[a-z]+_[a-f0-9]+\.(?:png|jpg)$/);
      expect(scene.visibleOnlyDuringConfirmedAudio).toBe(true);
    }
  });
});
