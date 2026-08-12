import { TEACHERS_57 } from "../client/src/data/teachers57";
import { getLanguageBase, isTeacherVoiceCompatibleWithTarget } from "../shared/languageContext";
import { resolveVoice } from "./edge-tts";

export type TeacherVoiceCoverage = {
  languageCode: string;
  languageBase: string;
  compatibleTeacherIds: string[];
  compatibleTeacherCount: number;
  femaleTeacherCount: number;
  maleTeacherCount: number;
  isAvailable: boolean;
};

/**
 * Coverage is deliberately conservative: a catalog teacher counts only when
 * the profile belongs to the target-language family and Edge TTS can resolve
 * that teacher's declared regional voice. This prevents a visual profile from
 * making an unavailable or foreign voice look selectable.
 */
export function getTeacherVoiceCoverage(languageCode: string): TeacherVoiceCoverage {
  const compatibleTeachers = TEACHERS_57.filter((teacher) => {
    if (!isTeacherVoiceCompatibleWithTarget(teacher.voiceLang, languageCode)) return false;
    return Boolean(resolveVoice(teacher.voiceLang, teacher.gender));
  });

  return {
    languageCode,
    languageBase: getLanguageBase(languageCode),
    compatibleTeacherIds: compatibleTeachers.map((teacher) => teacher.id),
    compatibleTeacherCount: compatibleTeachers.length,
    femaleTeacherCount: compatibleTeachers.filter((teacher) => teacher.gender === "female").length,
    maleTeacherCount: compatibleTeachers.filter((teacher) => teacher.gender === "male").length,
    isAvailable: compatibleTeachers.length > 0,
  };
}
