export interface ImmersiveDialogTeacherVoice {
  teacherLang: string;
  teacherGender?: "male" | "female";
}

/** Teacher lines and feedback stay in the studied language and require neural playback. */
export function getImmersiveDialogTeacherSpeech(
  text: string,
  scene: ImmersiveDialogTeacherVoice,
) {
  return {
    text,
    language: scene.teacherLang,
    gender: scene.teacherGender,
    purpose: "teacher" as const,
    requiresNeural: true,
  };
}
