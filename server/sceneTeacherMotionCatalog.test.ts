import { describe, expect, it } from "vitest";
import {
  getSceneTeacherMotionCatalogEntry,
  SCENE_TEACHER_MOTION_CATALOG,
} from "../shared/sceneTeacherMotionCatalog";

describe("catálogo de movimento docente por cena", () => {
  it("cobre as 29 cenas e mantém cada mídia vinculada ao próprio cenário", () => {
    expect(SCENE_TEACHER_MOTION_CATALOG).toHaveLength(29);
    expect(new Set(SCENE_TEACHER_MOTION_CATALOG.map((entry) => entry.sceneId)).size).toBe(29);
    for (const entry of SCENE_TEACHER_MOTION_CATALOG) {
      expect(entry.visibleOnlyDuringConfirmedAudio).toBe(true);
      expect(entry.requiresSceneSpecificMedia).toBe(true);
    }
  });

  it("preserva os professores canônicos e separa a Praia aprovada da Floresta planejada", () => {
    expect(getSceneTeacherMotionCatalogEntry("beach")).toMatchObject({ teacherName: "James", status: "approved" });
    expect(getSceneTeacherMotionCatalogEntry("forest")).toMatchObject({ teacherName: "James", status: "planned" });
    expect(getSceneTeacherMotionCatalogEntry("cafe")).toMatchObject({ teacherName: "Sophie", status: "approved" });
    expect(getSceneTeacherMotionCatalogEntry("desert")).toMatchObject({ teacherName: "Omar", status: "portrait_only" });
  });
});
