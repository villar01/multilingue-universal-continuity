export type SophieCafePilotClipId =
  | "sophie-cafe-greeting"
  | "sophie-cafe-point-croissant"
  | "sophie-cafe-praise"
  | "sophie-cafe-retry";

export interface SophieCafePilotClip {
  id: SophieCafePilotClipId;
  trigger: "scene_open" | "object_focus" | "correct_answer" | "retry_answer";
  teacherName: "Sophie";
  sceneId: "cafe";
  language: "fr-FR";
  durationSeconds: 4 | 6;
  dialogue: string;
  referenceImageUrl: string;
  videoUrl: string | null;
  preserveOriginalPortrait: true;
  fallback: "original_portrait";
}

export const SOPHIE_CAFE_PILOT_CLIPS: readonly SophieCafePilotClip[] = [
  {
    id: "sophie-cafe-greeting",
    trigger: "scene_open",
    teacherName: "Sophie",
    sceneId: "cafe",
    language: "fr-FR",
    durationSeconds: 6,
    dialogue: "Bonjour ! Je m’appelle Sophie. Bienvenue au café !",
    referenceImageUrl: "/manus-storage/sophie-cafe-primary-reference_2f9b247b.png",
    videoUrl: "/manus-storage/sophie-cafe-greeting_5a39760e.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "sophie-cafe-point-croissant",
    trigger: "object_focus",
    teacherName: "Sophie",
    sceneId: "cafe",
    language: "fr-FR",
    durationSeconds: 4,
    dialogue: "Regardez le croissant. Un croissant, s’il vous plaît.",
    referenceImageUrl: "/manus-storage/sophie-cafe-primary-reference_2f9b247b.png",
    videoUrl: "/manus-storage/sophie-cafe-point-croissant_8bf1d722.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "sophie-cafe-praise",
    trigger: "correct_answer",
    teacherName: "Sophie",
    sceneId: "cafe",
    language: "fr-FR",
    durationSeconds: 4,
    dialogue: "Excellent ! Votre français est superbe. Continuons.",
    referenceImageUrl: "/manus-storage/sophie-cafe-primary-reference_2f9b247b.png",
    videoUrl: "/manus-storage/sophie-cafe-praise_5a83e8b8.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "sophie-cafe-retry",
    trigger: "retry_answer",
    teacherName: "Sophie",
    sceneId: "cafe",
    language: "fr-FR",
    durationSeconds: 4,
    dialogue: "Essayons encore. Écoutez : un croissant, s’il vous plaît.",
    referenceImageUrl: "/manus-storage/sophie-cafe-primary-reference_2f9b247b.png",
    videoUrl: "/manus-storage/sophie-cafe-retry_5a6a2d3e.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
] as const;
