export type JamesTropicalPilotClipId =
  | "james-tropical-greeting"
  | "james-tropical-point-palm"
  | "james-tropical-praise"
  | "james-tropical-retry";

export interface JamesTropicalPilotClip {
  id: JamesTropicalPilotClipId;
  trigger: "scene_open" | "object_focus" | "correct_answer" | "retry_answer";
  teacherName: "James";
  sceneId: "beach";
  language: "en-US";
  durationSeconds: 4 | 8;
  dialogue: string;
  referenceImageUrl: string;
  videoUrl: string | null;
  preserveOriginalPortrait: true;
  fallback: "original_portrait";
}

export const JAMES_TROPICAL_PILOT_CLIPS: readonly JamesTropicalPilotClip[] = [
  {
    id: "james-tropical-greeting",
    trigger: "scene_open",
    teacherName: "James",
    sceneId: "beach",
    language: "en-US",
    durationSeconds: 8,
    dialogue: "Hello! My name is James. Welcome to this beautiful tropical beach!",
    referenceImageUrl: "/manus-storage/james-tropical-greeting-reference_dcda1d54.png",
    videoUrl: "/manus-storage/james-tropical-greeting_5f8622cb.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "james-tropical-point-palm",
    trigger: "object_focus",
    teacherName: "James",
    sceneId: "beach",
    language: "en-US",
    durationSeconds: 4,
    dialogue: "Look at the palm tree. Palm tree.",
    referenceImageUrl: "/manus-storage/james-tropical-point-palm-reference_d860de91.png",
    videoUrl: "/manus-storage/james-tropical-point-palm_d1aa1130.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "james-tropical-praise",
    trigger: "correct_answer",
    teacherName: "James",
    sceneId: "beach",
    language: "en-US",
    durationSeconds: 4,
    dialogue: "Excellent! You got it right. Let's continue.",
    referenceImageUrl: "/manus-storage/james-tropical-praise-reference_7baa6478.png",
    videoUrl: "/manus-storage/james-tropical-praise_0a90d956.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
  {
    id: "james-tropical-retry",
    trigger: "retry_answer",
    teacherName: "James",
    sceneId: "beach",
    language: "en-US",
    durationSeconds: 4,
    dialogue: "Try again. Listen once more: pool.",
    referenceImageUrl: "/manus-storage/james-tropical-retry-reference_e8977ab5.png",
    videoUrl: "/manus-storage/james-tropical-retry_621e4cda.mp4",
    preserveOriginalPortrait: true,
    fallback: "original_portrait",
  },
] as const;
