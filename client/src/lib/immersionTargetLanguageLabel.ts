import { AVAILABLE_LANGUAGES } from "./languages";

const IMMERSION_TARGET_LANGUAGE_LABELS: Record<string, string> = {
  de: "Lernsprache ändern",
  en: "Change target language",
  es: "Cambiar idioma de estudio",
  fr: "Changer la langue d’étude",
  it: "Cambia lingua di studio",
  pt: "Mudar idioma de estudo",
};

function getNativeLanguageName(targetLanguage: string | undefined) {
  if (!targetLanguage) return undefined;
  try {
    return new Intl.DisplayNames([targetLanguage], {
      type: "language",
      languageDisplay: "dialect",
    }).of(targetLanguage);
  } catch {
    return undefined;
  }
}

export function getImmersionTargetLanguageLabel(targetLanguage: string | undefined, targetLanguageName?: string) {
  const baseLanguage = targetLanguage?.split("-")[0]?.toLowerCase();
  if (baseLanguage && IMMERSION_TARGET_LANGUAGE_LABELS[baseLanguage]) {
    return IMMERSION_TARGET_LANGUAGE_LABELS[baseLanguage];
  }

  const catalogName = AVAILABLE_LANGUAGES.find((language) => language.code === targetLanguage)?.name;
  const suppliedName = targetLanguageName?.trim();
  const safeSuppliedName = suppliedName && suppliedName !== targetLanguage ? suppliedName : undefined;
  return catalogName || safeSuppliedName || getNativeLanguageName(targetLanguage) || "Select language";
}
