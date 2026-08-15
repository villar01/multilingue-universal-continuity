import { getSceneTutorReply, type SceneTutorHotspot, type SceneTutorReply } from "./immersiveSceneTutor";

export function shouldStartSceneTeacherAudio(line: { speaker: string } | null | undefined): boolean {
  return line?.speaker === "teacher";
}

export function getFreeDialogQuestionReply(question: string, hotspots: SceneTutorHotspot[]): SceneTutorReply | null {
  const value = question.trim();
  if (!value) return null;
  return getSceneTutorReply(value, hotspots);
}

export function formatSceneTutorFeedback(reply: SceneTutorReply): string {
  return reply.nativeText ? `${reply.text}\n${reply.nativeText}` : reply.text;
}
