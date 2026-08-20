export function permitsEnglishLessonFallback(languageCode: string) {
  return languageCode.trim().split("-")[0]?.toLowerCase() === "en";
}
