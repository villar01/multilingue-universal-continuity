export function getTeacherCardDetails(teacher: {
  voiceLanguageCode?: string;
  voice_language_code?: string;
  langName?: string;
  gender?: string;
}, fallbackLanguageCode: string) {
  const voiceLanguageCode = teacher.voiceLanguageCode || teacher.voice_language_code || fallbackLanguageCode;
  const regionalLabel = voiceLanguageCode === "en-US"
    ? "Inglês americano"
    : voiceLanguageCode === "en-GB"
      ? "Inglês britânico"
      : teacher.langName || voiceLanguageCode;
  const nativeVoiceLabel = teacher.gender === "male"
    ? "Voz masculina nativa"
    : teacher.gender === "female"
      ? "Voz feminina nativa"
      : "Voz neural nativa";

  return { voiceLanguageCode, regionalLabel, nativeVoiceLabel };
}
