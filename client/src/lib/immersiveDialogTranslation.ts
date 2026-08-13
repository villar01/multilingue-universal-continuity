export interface ImmersiveDialogTranslationLine {
  text: string;
  textPt?: string;
}

export function isPortugueseLocale(locale?: string) {
  return (locale || "pt-BR").split("-")[0].toLowerCase() === "pt";
}

/** Portuguese uses curated copy; every other native locale must supply a real translation. */
export function getNativeDialogueTranslation(
  line: ImmersiveDialogTranslationLine,
  nativeLocale: string | undefined,
  translatedText?: string,
) {
  if (isPortugueseLocale(nativeLocale)) return line.textPt || "";
  return translatedText?.trim() || "";
}
