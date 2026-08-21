import { describe, expect, it } from "vitest";
import { resolveSceneTeacherMotion } from "../shared/sceneTeacherMotionResolver";

describe("scene teacher motion resolver", () => {
  it("mantém o retrato canônico quando a cena exige mídia específica, mesmo com áudio confirmado", () => {
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

    expect(moving.showReusableTeacherMotion).toBe(false);
    expect(moving.showApprovedSceneClip).toBe(false);
    expect(moving.fallback).toBe("canonical_portrait");
    expect(silent.showReusableTeacherMotion).toBe(false);
    expect(silent.fallback).toBe("canonical_portrait");
  });

  it("never grants movement to another scene teacher", () => {
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

  it("só mostra o clipe aprovado quando áudio e professor canônico coincidem", () => {
    expect(resolveSceneTeacherMotion({
      sceneId: "beach",
      teacherName: "James",
      audioConfirmed: true,
      hasApprovedSceneClip: true,
      hasCanonicalReusableMotion: true,
    }).showApprovedSceneClip).toBe(true);

    expect(resolveSceneTeacherMotion({
      sceneId: "beach",
      teacherName: "James",
      audioConfirmed: false,
      hasApprovedSceneClip: true,
      hasCanonicalReusableMotion: true,
    }).showApprovedSceneClip).toBe(false);
  });
});
