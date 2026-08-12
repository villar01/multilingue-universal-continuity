/**
 * edgeTTSClient.ts
 * Cliente Edge TTS Neural — chama o servidor e toca áudio de alta qualidade.
 * Substitui window.speechSynthesis (voz robótica do browser).
 */

import { trpc } from "@/lib/trpc";

// Cache de áudio para evitar chamadas repetidas
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let lipSyncCallback: ((amplitude: number) => void) | null = null;
let lipSyncRafId: number | null = null;

/** Registra callback para lip-sync em tempo real (amplitude 0-1) */
export function onLipSyncAmplitude(cb: ((amplitude: number) => void) | null) {
  lipSyncCallback = cb;
}

function startLipSyncAnalysis(audio: HTMLAudioElement) {
  try {
    if (!audioContext) audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    const tick = () => {
      if (!analyserNode || !lipSyncCallback) return;
      analyserNode.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      lipSyncCallback(Math.min(avg / 128, 1));
      lipSyncRafId = requestAnimationFrame(tick);
    };
    lipSyncRafId = requestAnimationFrame(tick);
  } catch { /* AudioContext not available */ }
}

function stopLipSyncAnalysis() {
  if (lipSyncRafId) { cancelAnimationFrame(lipSyncRafId); lipSyncRafId = null; }
  if (lipSyncCallback) lipSyncCallback(0);
  analyserNode = null;
}

function cacheKey(text: string, voiceLang: string) {
  return `${voiceLang}::${text.slice(0, 120)}`;
}

/**
 * Fala um texto usando Edge TTS Neural do servidor.
 * Fallback automático para Web Speech API se o servidor falhar.
 */
export async function speakEdgeTTS(
  text: string,
  voiceLang: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    rate?: number;
    gender?: 'male' | 'female';
  }
): Promise<void> {
  if (!text?.trim()) return;

  // Para qualquer áudio em andamento
  stopEdgeTTS();

  const key = cacheKey(text, voiceLang);

  try {
    let audioBase64: string;

    if (audioCache.has(key)) {
      audioBase64 = audioCache.get(key)!;
    } else {
      // Chama o endpoint Edge TTS do servidor
      const result = await fetch("/api/trpc/tts.speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { text, voiceLang, gender: options?.gender ?? 'female' } }),
      });

      if (!result.ok) throw new Error("TTS server error");

      const data = await result.json();
      audioBase64 = data?.result?.data?.json?.audioBase64;
      if (!audioBase64) throw new Error("No audio data");

      // Cache (máx 50 entradas)
      if (audioCache.size > 50) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(key, audioBase64);
    }

    // Toca o áudio
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.crossOrigin = "anonymous";
    currentAudio = audio;

    options?.onStart?.();

    await new Promise<void>((resolve) => {
      audio.onended = () => {
        stopLipSyncAnalysis();
        currentAudio = null;
        options?.onEnd?.();
        resolve();
      };
      audio.onerror = () => {
        stopLipSyncAnalysis();
        currentAudio = null;
        options?.onEnd?.();
        resolve();
      };
      audio.play().then(() => {
        startLipSyncAnalysis(audio);
      }).catch(() => {
        // Autoplay bloqueado — fallback para Web Speech API
        fallbackWebSpeech(text, voiceLang, options);
        resolve();
      });
    });
  } catch {
    // Fallback para Web Speech API se Edge TTS falhar
    fallbackWebSpeech(text, voiceLang, options);
  }
}

/**
 * Para o áudio em andamento.
 */
export function stopEdgeTTS(): void {
  stopLipSyncAnalysis();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  // Também para Web Speech API se estiver ativa
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Fallback: Web Speech API (caso Edge TTS falhe ou autoplay seja bloqueado)
 */
function fallbackWebSpeech(
  text: string,
  voiceLang: string,
  options?: { onStart?: () => void; onEnd?: () => void }
): void {
  if (!("speechSynthesis" in window)) {
    options?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = voiceLang;
  utt.rate = 0.9;
  options?.onStart?.();
  utt.onend = () => options?.onEnd?.();
  utt.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utt);
}

/**
 * Verifica se Edge TTS está disponível (servidor acessível)
 */
export async function isEdgeTTSAvailable(): Promise<boolean> {
  try {
    const r = await fetch("/api/trpc/tts.speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: { text: "test", voiceLang: "en-US" } }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
