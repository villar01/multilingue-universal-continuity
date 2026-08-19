export interface TeacherReusableMotionContract {
  assetKind: "neutral_teacher_motion";
  canonicalTeacherRequired: true;
  preservesTeacherWardrobe: true;
  background: "chroma_green";
  embeddedAudio: false;
  maxDurationSeconds: 6;
  displayPolicy: "only_while_confirmed_scene_audio";
  fallbackPolicy: "canonical_portrait";
}

/**
 * Formato único de produção para evitar 29 vídeos completos: um clipe de corpo
 * e gesto leve por professor pode ser recortado e sobreposto sobre qualquer
 * cenário sem levar o fundo de outra cena. O áudio continua no player único.
 */
export const REUSABLE_TEACHER_MOTION_CONTRACT: TeacherReusableMotionContract = {
  assetKind: "neutral_teacher_motion",
  canonicalTeacherRequired: true,
  preservesTeacherWardrobe: true,
  background: "chroma_green",
  embeddedAudio: false,
  maxDurationSeconds: 6,
  displayPolicy: "only_while_confirmed_scene_audio",
  fallbackPolicy: "canonical_portrait",
} as const;
