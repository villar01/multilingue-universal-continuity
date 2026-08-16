export const INITIAL_COMMERCIAL_LANGUAGE_CODES = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "it-IT",
  "de-DE",
] as const;

export type InitialCommercialLanguageCode = (typeof INITIAL_COMMERCIAL_LANGUAGE_CODES)[number];

function languageBase(languageCode: string): string {
  return languageCode.trim().toLowerCase().split("-")[0] || "";
}

/**
 * The initial commercial product is released by target language. Native support
 * remains universal, so an enrolled learner may use any supported native language
 * to study one of the six launched targets.
 */
export function isInitialCommercialTargetLanguage(languageCode: string): boolean {
  const base = languageBase(languageCode);
  return INITIAL_COMMERCIAL_LANGUAGE_CODES.some((released) => languageBase(released) === base);
}

export function getCommercialLanguageBlock(languageCode: string): "initial" | "future" {
  return isInitialCommercialTargetLanguage(languageCode) ? "initial" : "future";
}
