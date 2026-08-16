import { TEACHERS_57, type Teacher57 } from "@/data/teachers57";
import { areSameLanguageFamily, getLanguageBase } from "@shared/languageContext";

export const INITIAL_SCENE_TARGET_LANGUAGES = ["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"] as const;

export type SceneTeacherSource = {
  teacherLang: string;
  teacherName: string;
  teacherImage: string;
  teacherGender?: "male" | "female";
};

export type SceneTeacherResolution = {
  /** A compatible catalog teacher only when the displayed material is in the same target language family. */
  teacher: Teacher57 | null;
  materialIsInTargetLanguage: boolean;
  preserveScenePortrait: boolean;
};

function teacherWithPortrait(teacher: Teacher57): boolean {
  return Boolean(teacher.photo?.trim());
}

/**
 * Selects a regional teacher for target material that is already available.
 * For a cross-language scene whose localized material has not yet arrived, it
 * deliberately preserves the original scene portrait rather than pairing a
 * teacher with text in a different language.
 */
export function resolveSceneTeacherForTarget(scene: SceneTeacherSource, targetLanguage: string): SceneTeacherResolution {
  if (!areSameLanguageFamily(scene.teacherLang, targetLanguage)) {
    return { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true };
  }

  const exactRegional = TEACHERS_57.find((teacher) => teacherWithPortrait(teacher) && teacher.voiceLang.toLowerCase() === targetLanguage.toLowerCase());
  const compatible = exactRegional || TEACHERS_57.find((teacher) => teacherWithPortrait(teacher) && areSameLanguageFamily(teacher.voiceLang, targetLanguage));
  return {
    teacher: compatible || null,
    materialIsInTargetLanguage: getLanguageBase(scene.teacherLang) === getLanguageBase(targetLanguage),
    preserveScenePortrait: !compatible,
  };
}
