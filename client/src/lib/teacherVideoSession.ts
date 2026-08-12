export function canAttachTeacherVideo(
  requestedSpeechSession: number,
  activeSpeechSession: number,
  isAudioStillPlaying: boolean,
): boolean {
  return requestedSpeechSession === activeSpeechSession && isAudioStillPlaying;
}
