export type AudioViseme = {
  open: number;
  round: number;
  active: boolean;
};

export function deriveAudioViseme(rms: number, highBandRatio: number): AudioViseme {
  const intensity = Math.max(0, Math.min(1, rms));
  if (intensity < 0.04) {
    return { open: 0, round: 0, active: false };
  }

  return {
    open: intensity,
    round: Math.max(0, Math.min(1, highBandRatio * intensity)),
    active: true,
  };
}

export type AudioDrivenVisemeController = {
  destroy: () => void;
};

export function createAudioDrivenVisemeController(
  audio: HTMLAudioElement,
  onFrame: (viseme: AudioViseme) => void,
): AudioDrivenVisemeController {
  let context: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let animationFrame: number | null = null;
  let active = false;

  const stop = () => {
    active = false;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    onFrame({ open: 0, round: 0, active: false });
  };

  const tick = () => {
    if (!active || !analyser) return;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    const low = bins.slice(2, 18);
    const high = bins.slice(18, 40);
    const average = (values: Uint8Array) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    const lowAverage = average(low) / 255;
    const highAverage = average(high) / 255;
    onFrame(deriveAudioViseme(lowAverage, highAverage));
    animationFrame = requestAnimationFrame(tick);
  };

  const start = async () => {
    if (active) return;
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    context ??= new AudioContextConstructor();
    if (context.state === "suspended") await context.resume();
    analyser ??= context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.55;
    source ??= context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    active = true;
    tick();
  };

  audio.addEventListener("playing", start);
  audio.addEventListener("pause", stop);
  audio.addEventListener("ended", stop);
  audio.addEventListener("error", stop);

  return {
    destroy: () => {
      audio.removeEventListener("playing", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("ended", stop);
      audio.removeEventListener("error", stop);
      stop();
      source?.disconnect();
      analyser?.disconnect();
      void context?.close();
    },
  };
}
