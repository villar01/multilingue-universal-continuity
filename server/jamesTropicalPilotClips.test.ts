import { describe, expect, it } from "vitest";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";

describe("piloto de clipes de James na Praia Tropical", () => {
  it("preserva o retrato original e registra os quatro clipes prontos", () => {
    expect(JAMES_TROPICAL_PILOT_CLIPS).toHaveLength(4);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => clip.teacherName === "James")).toBe(true);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => clip.sceneId === "beach")).toBe(true);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => clip.preserveOriginalPortrait)).toBe(true);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => clip.fallback === "original_portrait")).toBe(true);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => typeof clip.videoUrl === "string" && clip.videoUrl.startsWith("/manus-storage/james-tropical-"))).toBe(true);
  });
});
