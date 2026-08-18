import { describe, expect, it } from "vitest";
import { selectTeacherSyncMode } from "../shared/teacherSyncPolicy";

describe("teacher sync policy", () => {
  it("always permits a video only when it is an exact audio-video pair", () => {
    expect(
      selectTeacherSyncMode({
        hasExactAudioVideoPair: true,
        isOnlineResponse: false,
        localVisemeEngineValidated: false,
        supportsAudioWorklet: false,
        prefersReducedMotion: false,
      })
    ).toBe("exact_pair_video");
  });

  it("permits local real-time visemes only on a validated capable device", () => {
    expect(
      selectTeacherSyncMode({
        hasExactAudioVideoPair: false,
        isOnlineResponse: true,
        localVisemeEngineValidated: true,
        supportsAudioWorklet: true,
        hardwareConcurrency: 8,
        deviceMemoryGb: 8,
        prefersReducedMotion: false,
      })
    ).toBe("local_realtime_viseme");
  });

  it("uses a stable portrait for online speech until all requirements are met", () => {
    expect(
      selectTeacherSyncMode({
        hasExactAudioVideoPair: false,
        isOnlineResponse: true,
        localVisemeEngineValidated: false,
        supportsAudioWorklet: true,
        hardwareConcurrency: 8,
        deviceMemoryGb: 8,
        prefersReducedMotion: false,
      })
    ).toBe("stable_portrait");

    expect(
      selectTeacherSyncMode({
        hasExactAudioVideoPair: false,
        isOnlineResponse: true,
        localVisemeEngineValidated: true,
        supportsAudioWorklet: true,
        hardwareConcurrency: 2,
        deviceMemoryGb: 2,
        prefersReducedMotion: false,
      })
    ).toBe("stable_portrait");
  });

  it("does not degrade the free local mode when an optional advanced service exists", () => {
    const freeBaseCapability = {
      hasExactAudioVideoPair: false,
      isOnlineResponse: true,
      localVisemeEngineValidated: true,
      supportsAudioWorklet: true,
      hardwareConcurrency: 8,
      deviceMemoryGb: 8,
      prefersReducedMotion: false,
    };

    expect(selectTeacherSyncMode(freeBaseCapability)).toBe("local_realtime_viseme");
    expect(
      selectTeacherSyncMode({ ...freeBaseCapability, optionalAdvancedServiceAvailable: true })
    ).toBe("local_realtime_viseme");
  });
});
