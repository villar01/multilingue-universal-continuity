import type { Teacher57 } from "@/data/teachers57";

type PersistedTeacherIdentity = {
  voiceLanguageCode?: string | null;
  voice_language_code?: string | null;
  gender?: string | null;
};

/**
 * Resolves the curated visual profile for a persisted teacher. Regional locale
 * is the identity anchor: en-GB must resolve to James before generic `en`
 * matching is considered.
 */
export function matchTeacherCatalog(
  teachers: Teacher57[],
  teacher: PersistedTeacherIdentity,
): Teacher57 | undefined {
  const voiceCode = (teacher.voiceLanguageCode || teacher.voice_language_code || "").toLowerCase();
  const languageCode = voiceCode.split("-")[0];

  return teachers.find((candidate) => candidate.voiceLang.toLowerCase() === voiceCode)
    || teachers.find((candidate) => candidate.langCode.toLowerCase() === languageCode && candidate.gender === teacher.gender)
    || teachers.find((candidate) => candidate.langCode.toLowerCase() === languageCode);
}
