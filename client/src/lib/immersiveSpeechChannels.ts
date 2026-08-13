export interface NativeHelpSpeechRequest {
  text: string;
  language: string;
  purpose: "native_help";
  requiresNeural: true;
}

/** Native explanations must use their own locale and must never replace target-language pronunciation. */
export function getNativeHelpSpeechRequest(text: string, nativeLanguage?: string): NativeHelpSpeechRequest {
  return {
    text,
    language: nativeLanguage || "pt-BR",
    purpose: "native_help",
    requiresNeural: true,
  };
}
