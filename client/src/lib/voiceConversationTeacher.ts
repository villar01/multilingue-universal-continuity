export interface VoiceConversationTeacherInput {
  id?: number | string;
  name: string;
  gender?: "male" | "female" | string | null;
  photoUrl?: string | null;
  voiceLanguageCode?: string | null;
}

export interface VoiceConversationTeacher {
  avatarId: string;
  name: string;
  gender: "male" | "female";
  fallbackLanguage: string;
  imageUrl?: string;
}

function baseLanguage(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0] || "";
}

export function resolveVoiceConversationTeacher(
  teacher: VoiceConversationTeacherInput | undefined,
  targetLanguage: string,
): VoiceConversationTeacher | undefined {
  const voiceLanguage = teacher?.voiceLanguageCode?.trim();
  if (!teacher || !voiceLanguage || baseLanguage(voiceLanguage) !== baseLanguage(targetLanguage)) {
    return undefined;
  }

  return {
    avatarId: `teacher-${teacher.id ?? teacher.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: teacher.name,
    gender: teacher.gender === "male" ? "male" : "female",
    fallbackLanguage: voiceLanguage,
    imageUrl: teacher.photoUrl || undefined,
  };
}

export function resolveTeacherSpeechVoice(
  teacher: VoiceConversationTeacherInput | undefined,
  targetLanguage: string,
): { voiceLang: string; gender: "male" | "female" } {
  const compatibleTeacher = resolveVoiceConversationTeacher(teacher, targetLanguage);
  return {
    voiceLang: compatibleTeacher?.fallbackLanguage ?? targetLanguage,
    gender: compatibleTeacher?.gender ?? "female",
  };
}
