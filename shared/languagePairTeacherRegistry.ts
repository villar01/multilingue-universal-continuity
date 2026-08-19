import { normalizeLanguageCode } from "./languageContext";

export type TeacherMotionProfile = "reusable_motion" | "scene_clip_only" | "portrait_only";

export interface CanonicalLanguagePairTeacher {
  nativeLanguage: string;
  targetLanguage: string;
  teacherName: string;
  teacherVoiceLanguage: string;
  teacherGender: "male" | "female";
  motionProfile: TeacherMotionProfile;
}

/**
 * Registro único para os pares comerciais iniciais. A voz e a política de
 * movimento não são escolhidas dentro de cada cena; novas duplas entram aqui
 * junto de cobertura de regressão antes de poderem ser ativadas no produto.
 */
export const CANONICAL_LANGUAGE_PAIR_TEACHERS: readonly CanonicalLanguagePairTeacher[] = [
  { nativeLanguage: "pt-BR", targetLanguage: "en-US", teacherName: "James", teacherVoiceLanguage: "en-US", teacherGender: "male", motionProfile: "reusable_motion" },
  { nativeLanguage: "pt-BR", targetLanguage: "es-ES", teacherName: "Carlos", teacherVoiceLanguage: "es-ES", teacherGender: "male", motionProfile: "portrait_only" },
  { nativeLanguage: "pt-BR", targetLanguage: "fr-FR", teacherName: "Sophie", teacherVoiceLanguage: "fr-FR", teacherGender: "female", motionProfile: "scene_clip_only" },
  { nativeLanguage: "pt-BR", targetLanguage: "it-IT", teacherName: "Giulia", teacherVoiceLanguage: "it-IT", teacherGender: "female", motionProfile: "portrait_only" },
  { nativeLanguage: "pt-BR", targetLanguage: "de-DE", teacherName: "Hans", teacherVoiceLanguage: "de-DE", teacherGender: "male", motionProfile: "portrait_only" },
  { nativeLanguage: "pt-BR", targetLanguage: "pt-BR", teacherName: "Ricardo", teacherVoiceLanguage: "pt-BR", teacherGender: "male", motionProfile: "portrait_only" },
] as const;

export function getCanonicalTeacherForLanguagePair(
  nativeLanguage: string,
  targetLanguage: string,
): CanonicalLanguagePairTeacher | undefined {
  const native = normalizeLanguageCode(nativeLanguage);
  const target = normalizeLanguageCode(targetLanguage);
  return CANONICAL_LANGUAGE_PAIR_TEACHERS.find(
    (entry) => normalizeLanguageCode(entry.nativeLanguage) === native
      && normalizeLanguageCode(entry.targetLanguage) === target,
  );
}
