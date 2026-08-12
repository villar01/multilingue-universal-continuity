import { describe, expect, it } from "vitest";
import { FAMILY_CLIPS } from "./FamilyVocabularyClips";

describe("FamilyVocabularyClips", () => {
  it("exposes the five required A1 family words without duplicate assets", () => {
    expect(FAMILY_CLIPS.map((clip) => clip.word)).toEqual(["mother", "father", "brother", "sister", "family"]);
    expect(new Set(FAMILY_CLIPS.map((clip) => clip.url)).size).toBe(5);
  });

  it("keeps a Portuguese caption and a durable video URL for every clip", () => {
    for (const clip of FAMILY_CLIPS) {
      expect(clip.caption.trim().length).toBeGreaterThan(8);
      expect(clip.url).toMatch(/^\/manus-storage\/family-[a-z]+_[a-f0-9]+\.mp4$/);
    }
  });
});
