export interface ImmersiveHotspotSpeechInput {
  label: string;
}

export interface ImmersiveSceneSpeechInput {
  teacherLang: string;
  teacherGender?: "male" | "female";
}

export function getImmersiveHotspotSpeech(
  hotspot: ImmersiveHotspotSpeechInput,
  scene: ImmersiveSceneSpeechInput,
) {
  return {
    text: hotspot.label,
    language: scene.teacherLang,
    gender: scene.teacherGender,
  };
}
