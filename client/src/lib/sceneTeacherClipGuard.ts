import type { TeacherMediaDecision } from "@shared/teacherMediaStrategy";

export type CompatibleSceneTeacherClip = {
  sceneId: string;
  teacherName: string;
  videoUrl?: string | null;
};

/**
 * Permanent scene-media boundary. A video can render only when its resolved
 * teacher, scene and approved media mode agree. Audio-timed motion is allowed
 * here because its activation remains gated by the audio element's onplaying
 * event; it never represents synthetic lip sync.
 */
export function shouldRenderCompatibleTeacherClip(input: {
  media: TeacherMediaDecision;
  clip: CompatibleSceneTeacherClip | null | undefined;
  sceneId: string;
  teacherName: string;
}): boolean {
  const { media, clip, sceneId, teacherName } = input;
  const permitsApprovedMotion =
    media.mode === "pre_generated_video" || media.mode === "audio_timed_motion_video";

  return Boolean(
    permitsApprovedMotion &&
      clip?.videoUrl &&
      clip.sceneId === sceneId &&
      clip.teacherName === teacherName,
  );
}
