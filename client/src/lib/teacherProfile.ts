import { TEACHERS_57 } from "@/data/teachers57";
import { matchTeacherCatalog } from "@/lib/teacherCatalogMatch";

type PersistedTeacher = Record<string, unknown> & {
  voiceLanguageCode?: string;
  voice_language_code?: string;
  photoUrl?: string | null;
  photo_url?: string | null;
  gender?: string;
  specialty?: string;
};

/** Builds the canonical visual and voice profile used throughout a lesson. */
export function enrichTeacherProfile<T extends PersistedTeacher>(teacher: T) {
  const catalogTeacher = matchTeacherCatalog(TEACHERS_57, teacher);
  const voiceLanguageCode = teacher.voiceLanguageCode
    || teacher.voice_language_code
    || catalogTeacher?.voiceLang
    || "en-US";

  return {
    ...teacher,
    photoUrl: teacher.photoUrl || teacher.photo_url || catalogTeacher?.photo || null,
    gender: teacher.gender || catalogTeacher?.gender || "female",
    specialty: teacher.specialty || catalogTeacher?.specialty || "Conversação e Gramática",
    origin: catalogTeacher?.origin || "",
    flag: catalogTeacher?.flag || "",
    voiceLanguageCode,
  };
}
