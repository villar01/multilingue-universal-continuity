import { describe, expect, it } from "vitest";
import {
  CANONICAL_LANGUAGE_PAIR_TEACHERS,
  getCanonicalTeacherForLanguagePair,
} from "../shared/languagePairTeacherRegistry";
import { isTeacherVoiceCompatibleWithTarget } from "../shared/languageContext";

describe("canonical language-pair teacher registry", () => {
  it("keeps one validated teacher, voice and motion policy per initial commercial pair", () => {
    expect(CANONICAL_LANGUAGE_PAIR_TEACHERS).toHaveLength(6);
    for (const entry of CANONICAL_LANGUAGE_PAIR_TEACHERS) {
      expect(isTeacherVoiceCompatibleWithTarget(entry.teacherVoiceLanguage, entry.targetLanguage)).toBe(true);
      expect(entry.motionProfile).toMatch(/reusable_motion|scene_clip_only|portrait_only/);
    }
  });

  it("selects James only for the validated Portuguese-to-English pair", () => {
    expect(getCanonicalTeacherForLanguagePair("pt-BR", "en-US")?.teacherName).toBe("James");
    expect(getCanonicalTeacherForLanguagePair("pt-BR", "ja-JP")).toBeUndefined();
  });
});
