import { describe, expect, it } from "vitest";
import { resolveSceneTeacherMotion } from "../shared/sceneTeacherMotionResolver";

describe("scene teacher motion resolver", () => {
  it("reuses James's canonical neutral motion in every James scene only while audio is confirmed", () => {
    const moving = resolveSceneTeacherMotion({
      sceneId: "forest",
      teacherName: "James",
      audioConfirmed: true,
      hasApprovedSceneClip: false,
      hasCanonicalReusableMotion: true,
    });
    const silent = resolveSceneTeacherMotion({
      sceneId: "forest",
      teacherName: "James",
      audioConfirmed: false,
      hasApprovedSceneClip: false,
      hasCanonicalReusableMotion: true,
    });

    expect(moving.showReusableTeacherMotion).toBe(true);
    expect(silent.showReusableTeacherMotion).toBe(false);
    expect(silent.fallback).toBe("canonical_portrait");
  });

  it("never grants James's reusable motion to another scene teacher", () => {
    const decision = resolveSceneTeacherMotion({
      sceneId: "tokyo",
      teacherName: "James",
      audioConfirmed: true,
      hasApprovedSceneClip: false,
      hasCanonicalReusableMotion: true,
    });

    expect(decision.showReusableTeacherMotion).toBe(false);
    expect(decision.showApprovedSceneClip).toBe(false);
  });
});
