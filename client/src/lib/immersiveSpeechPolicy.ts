export type ImmersiveSpeechPurpose = "teacher" | "hotspot";

/** Objetos didáticos exigem voz neural: síntese local é menos consistente para pronúncia. */
export function allowsBrowserSpeechFallback(purpose: ImmersiveSpeechPurpose): boolean {
  return purpose === "teacher";
}
