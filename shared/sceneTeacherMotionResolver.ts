import { getSceneTeacherMotionCatalogEntry } from "./sceneTeacherMotionCatalog";

export interface SceneTeacherMotionRequest {
  sceneId: string;
  teacherName: string;
  audioConfirmed: boolean;
  hasApprovedSceneClip: boolean;
  hasCanonicalReusableMotion: boolean;
}

export interface SceneTeacherMotionDecision {
  showApprovedSceneClip: boolean;
  showReusableTeacherMotion: boolean;
  fallback: "canonical_portrait";
}

/**
 * Regra única para toda cena: somente o professor canônico pode ganhar
 * movimento e exclusivamente entre o início e o fim de áudio confirmado.
 * Um clipe neutro reutilizável só é aceito quando já pertence ao professor
 * canônico — nunca troca imagem ou mídia entre cenários.
 */
export function resolveSceneTeacherMotion(
  request: SceneTeacherMotionRequest,
): SceneTeacherMotionDecision {
  const entry = getSceneTeacherMotionCatalogEntry(request.sceneId);
  const canonicalTeacherMatches = entry?.teacherName === request.teacherName;
  const audioAllowsMotion = Boolean(
    entry
      && canonicalTeacherMatches
      && entry.visibleOnlyDuringConfirmedAudio
      && request.audioConfirmed,
  );

  return {
    showApprovedSceneClip: Boolean(
      audioAllowsMotion
        && entry?.status === "approved"
        && request.hasApprovedSceneClip,
    ),
    showReusableTeacherMotion: Boolean(
      audioAllowsMotion
        && request.hasCanonicalReusableMotion,
    ),
    fallback: "canonical_portrait",
  };
}
