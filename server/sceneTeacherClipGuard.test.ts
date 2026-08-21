import { describe, expect, it } from "vitest";
import { shouldRenderCompatibleTeacherClip } from "../client/src/lib/sceneTeacherClipGuard";

const jamesBeachClip = {
  sceneId: "beach",
  teacherName: "James",
  videoUrl: "/manus-storage/james-beach-motion.mp4",
};

describe("guarda central de clipe docente", () => {
  it("permite movimento lateral aprovado sem confundi-lo com sincronização labial", () => {
    expect(
      shouldRenderCompatibleTeacherClip({
        media: { mode: "audio_timed_motion_video", reason: "approved motion while audio is playing" },
        clip: jamesBeachClip,
        sceneId: "beach",
        teacherName: "James",
      }),
    ).toBe(true);
  });

  it("bloqueia clipe quando cena, professor ou política não coincidem", () => {
    expect(
      shouldRenderCompatibleTeacherClip({
        media: { mode: "static_portrait", reason: "no approved motion" },
        clip: jamesBeachClip,
        sceneId: "beach",
        teacherName: "James",
      }),
    ).toBe(false);
    expect(
      shouldRenderCompatibleTeacherClip({
        media: { mode: "pre_generated_video", reason: "exact pair" },
        clip: jamesBeachClip,
        sceneId: "park",
        teacherName: "James",
      }),
    ).toBe(false);
    expect(
      shouldRenderCompatibleTeacherClip({
        media: { mode: "pre_generated_video", reason: "exact pair" },
        clip: jamesBeachClip,
        sceneId: "beach",
        teacherName: "Ingrid",
      }),
    ).toBe(false);
  });
});
