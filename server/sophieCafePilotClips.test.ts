import { describe, expect, it } from "vitest";
import { SOPHIE_CAFE_PILOT_CLIPS } from "../shared/sophieCafePilotClips";

describe("piloto de clipes de Sophie no Café Parisiense", () => {
  it("registra os quatro gatilhos pedagógicos em francês com mídia publicada", () => {
    expect(SOPHIE_CAFE_PILOT_CLIPS).toHaveLength(4);
    expect(SOPHIE_CAFE_PILOT_CLIPS.map((clip) => clip.trigger)).toEqual([
      "scene_open",
      "object_focus",
      "correct_answer",
      "retry_answer",
    ]);

    for (const clip of SOPHIE_CAFE_PILOT_CLIPS) {
      expect(clip.teacherName).toBe("Sophie");
      expect(clip.sceneId).toBe("cafe");
      expect(clip.language).toBe("fr-FR");
      expect(clip.videoUrl).toMatch(/^\/manus-storage\/sophie-cafe-[a-z-]+_[a-f0-9]+\.mp4$/);
      expect(clip.referenceImageUrl).toBe("/manus-storage/sophie-cafe-primary-reference_2f9b247b.png");
    }
  });

  it("preserva o retrato original de Sophie como fallback obrigatório", () => {
    for (const clip of SOPHIE_CAFE_PILOT_CLIPS) {
      expect(clip.preserveOriginalPortrait).toBe(true);
      expect(clip.fallback).toBe("original_portrait");
    }
  });
});
