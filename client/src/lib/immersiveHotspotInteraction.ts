import { getImmersiveHotspotSpeech } from "./immersiveHotspotSpeech";

export interface ImmersiveClickableHotspot {
  label: string;
  translation: string;
}

export interface ImmersiveHotspotSceneVoice {
  teacherLang: string;
  teacherGender?: "male" | "female";
}

/** Builds the immediate visual and neural-speech response for one object click. */
export function createImmersiveHotspotInteraction(
  hotspot: ImmersiveClickableHotspot,
  scene: ImmersiveHotspotSceneVoice,
) {
  return {
    greeting: `${hotspot.label} — ${hotspot.translation}`,
    speech: getImmersiveHotspotSpeech(hotspot, scene),
  };
}
