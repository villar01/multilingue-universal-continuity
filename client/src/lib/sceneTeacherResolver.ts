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
  lockedToLanguagePair?: boolean;
};

const PORTUGUESE_ENGLISH_JAMES_SCENE_IDS = new Set([
  "beach", "forest", "newyork", "airport", "school", "cinema", "family_home",
  "airport_family", "paris", "kitchen", "restaurant", "supermarket", "hotel", "hospital",
]);

function getPortugueseEnglishSceneTeacher(sceneId: string): Teacher57 | null {
  const source = PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId)
    ? TEACHERS_57.find((teacher) => teacher.id === "prof-en-gb")
    : TEACHERS_57.find((teacher) => teacher.id === "profa-en-us");
  if (!source) return null;
  return {
    ...source,
    id: PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId) ? "scene-james-en-us" : "scene-ingrid-en-us",
    name: PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId) ? "James" : "Ingrid",
    nativeName: PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId) ? "James" : "Ingrid",
    language: "English (US)",
    langCode: "en",
    voiceLang: "en-US",
    photo: PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId)
      ? "/manus-storage/prof_james_b9f2fff7.png"
      : "/manus-storage/teacher-ingrid-english_b938d99a.png",
    gender: PORTUGUESE_ENGLISH_JAMES_SCENE_IDS.has(sceneId) ? "male" : "female",
  } as Teacher57;
}

function teacherWithPortrait(teacher: Teacher57): boolean {
  return Boolean(teacher.photo?.trim());
}

export function getTargetLanguageTeachers(targetLanguage: string): Teacher57[] {
  return TEACHERS_57.filter((teacher) => teacherWithPortrait(teacher) && areSameLanguageFamily(teacher.voiceLang, targetLanguage));
}

/**
 * Selects a regional teacher for target material that is already available.
 * For a cross-language scene whose localized material has not yet arrived, it
 * deliberately preserves the original scene portrait rather than pairing a
 * teacher with text in a different language.
 */
export function resolveSceneTeacherForTarget(scene: SceneTeacherSource & { id?: string }, targetLanguage: string, nativeLanguage = ""): SceneTeacherResolution {
  if (nativeLanguage.toLowerCase().startsWith("pt") && targetLanguage.toLowerCase().startsWith("en") && scene.id) {
    return {
      teacher: getPortugueseEnglishSceneTeacher(scene.id),
      materialIsInTargetLanguage: true,
      preserveScenePortrait: false,
      lockedToLanguagePair: true,
    };
  }
  // James is the canonical beach teacher. Do not substitute the en-US catalog
  // teacher (Sarah) for this authored scene, regardless of the active target.
  if (scene.teacherName.trim().toLowerCase() === "james") {
    return { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true };
  }

  if (!areSameLanguageFamily(scene.teacherLang, targetLanguage)) {
    return { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true };
  }

  const compatibleTeachers = getTargetLanguageTeachers(targetLanguage);
  const exactRegional = compatibleTeachers.find((teacher) => teacher.voiceLang.toLowerCase() === targetLanguage.toLowerCase());
  const compatible = exactRegional || compatibleTeachers[0];
  return {
    teacher: compatible || null,
    materialIsInTargetLanguage: getLanguageBase(scene.teacherLang) === getLanguageBase(targetLanguage),
    preserveScenePortrait: !compatible,
  };
}
