import { describe, expect, it } from "vitest";
import { REUSABLE_TEACHER_MOTION_CONTRACT } from "../shared/teacherReusableMotionContract";

describe("contrato de clipe reutilizável por professor", () => {
  it("preserva identidade, áudio único e fallback de retrato", () => {
    expect(REUSABLE_TEACHER_MOTION_CONTRACT).toMatchObject({
      assetKind: "neutral_teacher_motion",
      canonicalTeacherRequired: true,
      preservesTeacherWardrobe: true,
      embeddedAudio: false,
      displayPolicy: "only_while_confirmed_scene_audio",
      fallbackPolicy: "canonical_portrait",
    });
    expect(REUSABLE_TEACHER_MOTION_CONTRACT.maxDurationSeconds).toBeLessThanOrEqual(6);
  });
});
