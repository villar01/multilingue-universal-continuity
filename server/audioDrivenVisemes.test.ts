import { describe, expect, it } from "vitest";
import { createAudioDrivenVisemeController, deriveAudioViseme, type AudioViseme } from "../client/src/lib/audioDrivenVisemes";

type Listener = () => void | Promise<void>;

function createAudioElementStub() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    audio: {
      addEventListener: (event: string, listener: Listener) => {
        const eventListeners = listeners.get(event) ?? new Set<Listener>();
        eventListeners.add(listener);
        listeners.set(event, eventListeners);
      },
      removeEventListener: (event: string, listener: Listener) => {
        listeners.get(event)?.delete(listener);
      },
    } as unknown as HTMLAudioElement,
    async emit(event: string) {
      for (const listener of listeners.get(event) ?? []) await listener();
    },
    listenerCount(event: string) {
      return listeners.get(event)?.size ?? 0;
    },
  };
}

describe("audio driven visemes", () => {
  it("keeps the mouth closed when the same audio clock is silent", () => {
    expect(deriveAudioViseme(0.02, 0.9)).toEqual({ open: 0, round: 0, active: false });
  });

  it("derives a limited mouth shape from audio intensity rather than text timing", () => {
    expect(deriveAudioViseme(0.5, 0.6)).toEqual({ open: 0.5, round: 0.3, active: true });
  });

  it("clears the isolated viseme on pause, error and end from the same audio player", async () => {
    const { audio, emit, listenerCount } = createAudioElementStub();
    const frames: AudioViseme[] = [];
    const controller = createAudioDrivenVisemeController(audio, (viseme) => frames.push(viseme));

    expect(listenerCount("playing")).toBe(1);
    expect(listenerCount("pause")).toBe(1);
    expect(listenerCount("ended")).toBe(1);
    expect(listenerCount("error")).toBe(1);

    await emit("pause");
    await emit("error");
    await emit("ended");
    expect(frames).toEqual([
      { open: 0, round: 0, active: false },
      { open: 0, round: 0, active: false },
      { open: 0, round: 0, active: false },
    ]);

    controller.destroy();
    expect(listenerCount("playing")).toBe(0);
    expect(listenerCount("pause")).toBe(0);
    expect(listenerCount("ended")).toBe(0);
    expect(listenerCount("error")).toBe(0);
  });
});
