export type TeacherSyncMode = "exact_pair_video" | "local_realtime_viseme" | "stable_portrait";

export type TeacherSyncCapability = {
  hasExactAudioVideoPair: boolean;
  isOnlineResponse: boolean;
  localVisemeEngineValidated: boolean;
  optionalAdvancedServiceAvailable?: boolean;
  supportsAudioWorklet: boolean;
  hardwareConcurrency?: number;
  deviceMemoryGb?: number;
  prefersReducedMotion: boolean;
};

export function selectTeacherSyncMode(capability: TeacherSyncCapability): TeacherSyncMode {
  if (capability.hasExactAudioVideoPair) {
    return "exact_pair_video";
  }

  const hasSufficientLocalCapacity =
    (capability.hardwareConcurrency ?? 0) >= 4 &&
    (capability.deviceMemoryGb ?? 0) >= 4;

  if (
    capability.isOnlineResponse &&
    capability.localVisemeEngineValidated &&
    capability.supportsAudioWorklet &&
    hasSufficientLocalCapacity &&
    !capability.prefersReducedMotion
  ) {
    return "local_realtime_viseme";
  }

  return "stable_portrait";
}
