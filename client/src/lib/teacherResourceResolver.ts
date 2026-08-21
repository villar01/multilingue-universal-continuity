import {
  selectTeacherMedia,
  type TeacherMediaDecision,
  type TeacherMediaRequest,
} from "@shared/teacherMediaStrategy";
import {
  resolveSceneTeacherForTarget,
  type SceneTeacherResolution,
  type SceneTeacherSource,
} from "./sceneTeacherResolver";

export type CanonicalTeacherResource = {
  resolution: SceneTeacherResolution;
  portrait: string;
  voiceLang: string;
  teacherName: string;
  media: TeacherMediaDecision;
};

const STABLE_PORTRAIT_REQUEST: TeacherMediaRequest = {
  kind: "interactive",
  hasApprovedPreGeneratedVideo: false,
  hasExactAudioVideoPair: false,
  hasAudioTimedMotionVideo: false,
};

/**
 * A single resource boundary for scene teachers. It deliberately defaults to
 * neural audio with the canonical portrait: no motion can appear until the
 * caller presents an approved audio–video request to selectTeacherMedia.
 */
export function resolveCanonicalTeacherResource(
  scene: SceneTeacherSource & { id?: string },
  targetLanguage: string,
  nativeLanguage = "",
  mediaRequest: TeacherMediaRequest = STABLE_PORTRAIT_REQUEST,
): CanonicalTeacherResource {
  const resolution = resolveSceneTeacherForTarget(scene, targetLanguage, nativeLanguage);
  const teacher = resolution.teacher;

  return {
    resolution,
    portrait: teacher?.photo || scene.teacherImage,
    voiceLang: teacher?.voiceLang || scene.teacherLang,
    teacherName: teacher?.name || scene.teacherName,
    media: selectTeacherMedia(mediaRequest),
  };
}
