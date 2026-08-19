export type SceneTeacherMotionStatus = "approved" | "planned" | "portrait_only";

export interface SceneTeacherMotionCatalogEntry {
  sceneId: string;
  teacherName: string;
  /** A mídia visual só pode ser mostrada depois de reprodução de áudio confirmada. */
  visibleOnlyDuringConfirmedAudio: true;
  /** Nunca reutilizar vídeo de outro cenário, mesmo quando o professor é o mesmo. */
  requiresSceneSpecificMedia: true;
  status: SceneTeacherMotionStatus;
}

/**
 * Catálogo de segurança visual para as 29 cenas. Ele separa o padrão global
 * (movimento somente enquanto há áudio) da mídia particular de cada cenário.
 * O retrato canônico de cada professor é sempre o fallback.
 */
export const SCENE_TEACHER_MOTION_CATALOG: readonly SceneTeacherMotionCatalogEntry[] = [
  { sceneId: "paris", teacherName: "Sophie", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "beach", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "approved" },
  { sceneId: "forest", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "planned" },
  { sceneId: "tokyo", teacherName: "Yuki", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "newyork", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "kitchen", teacherName: "Carlos", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "restaurant", teacherName: "Ana", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "airport", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "hotel", teacherName: "Giulia", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "supermarket", teacherName: "Carlos", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "school", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "hospital", teacherName: "Priya", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "park", teacherName: "Sophie", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "mountain", teacherName: "Hans", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "desert", teacherName: "Omar", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "farm", teacherName: "Maja", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "museum", teacherName: "Giulia", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "cinema", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "gym", teacherName: "Emre", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "library", teacherName: "Maja", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "office", teacherName: "Ivan", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "metro", teacherName: "Sophie", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "port", teacherName: "Giulia", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "medieval", teacherName: "Hans", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "spa", teacherName: "Priya", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "garden", teacherName: "Yuki", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "cafe", teacherName: "Sophie", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "approved" },
  { sceneId: "family_home", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
  { sceneId: "airport_family", teacherName: "James", visibleOnlyDuringConfirmedAudio: true, requiresSceneSpecificMedia: true, status: "portrait_only" },
] as const;

export function getSceneTeacherMotionCatalogEntry(sceneId: string): SceneTeacherMotionCatalogEntry | undefined {
  return SCENE_TEACHER_MOTION_CATALOG.find((entry) => entry.sceneId === sceneId);
}
