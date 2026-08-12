/**
 * Canonical language-context rules for reusable lesson screens.
 *
 * The lesson itself belongs to its target language. A learner may choose any
 * native language for explanations, and may choose a teacher only when that
 * teacher has a voice in the same target-language family. Regional variants
 * remain visible and intentional; no missing voice may fall back to another
 * language.
 */

export function normalizeLanguageCode(code?: string | null): string {
  return (code || "").trim().toLowerCase();
}

export function getLanguageBase(code?: string | null): string {
  return normalizeLanguageCode(code).split("-")[0] || "";
}

export function areSameLanguageFamily(left?: string | null, right?: string | null): boolean {
  const leftBase = getLanguageBase(left);
  const rightBase = getLanguageBase(right);
  return Boolean(leftBase && rightBase && leftBase === rightBase);
}

/** A teacher can guide a lesson only when their declared voice family matches its target language. */
export function isTeacherVoiceCompatibleWithTarget(
  teacherVoiceLanguage?: string | null,
  targetLanguage?: string | null,
): boolean {
  return areSameLanguageFamily(teacherVoiceLanguage, targetLanguage);
}

export type LessonLanguageContext = {
  nativeLanguage: string;
  targetLanguage: string;
  teacherVoiceLanguage: string;
};

/**
 * Validates the invariant for one reusable lesson screen: two learner-facing
 * languages (native support + target lesson) and one teacher voice tied to the
 * target lesson. The native language is intentionally not compared to the
 * teacher voice, because it is used for translation and explanation only.
 */
export function hasValidLessonLanguageContext(context: LessonLanguageContext): boolean {
  return Boolean(
    normalizeLanguageCode(context.nativeLanguage)
    && normalizeLanguageCode(context.targetLanguage)
    && isTeacherVoiceCompatibleWithTarget(context.teacherVoiceLanguage, context.targetLanguage),
  );
}
