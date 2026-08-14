/**
 * Sistema Avançado de Sincronização TTS com Visemas
 * Sincronização perfeita entre áudio e movimento labial
 */

export interface VisemeData {
  mouthWidth: number;
  mouthHeight: number;
  jawDrop: number;
  lipRound: number;
  tongueVisible: boolean;
}

export interface PhonemeTimestamp {
  phoneme: string;
  start: number; // ms
  duration: number; // ms
  viseme: VisemeData;
}

/**
 * Mapa completo de visemas (21 posições labiais)
 */
export const ADVANCED_VISEME_MAP: Record<string, VisemeData> = {
  // Vogais
  A: { mouthWidth: 60, mouthHeight: 40, jawDrop: 15, lipRound: 0, tongueVisible: false },
  E: { mouthWidth: 50, mouthHeight: 20, jawDrop: 8, lipRound: 0, tongueVisible: false },
  I: { mouthWidth: 40, mouthHeight: 8, jawDrop: 2, lipRound: 0, tongueVisible: false },
  O: { mouthWidth: 35, mouthHeight: 35, jawDrop: 10, lipRound: 70, tongueVisible: false },
  U: { mouthWidth: 25, mouthHeight: 30, jawDrop: 5, lipRound: 90, tongueVisible: false },
  
  // Consoantes bilabiais
  B: { mouthWidth: 40, mouthHeight: 5, jawDrop: 0, lipRound: 0, tongueVisible: false },
  P: { mouthWidth: 40, mouthHeight: 5, jawDrop: 0, lipRound: 0, tongueVisible: false },
  M: { mouthWidth: 40, mouthHeight: 5, jawDrop: 0, lipRound: 0, tongueVisible: false },
  
  // Consoantes labiodentais
  F: { mouthWidth: 45, mouthHeight: 10, jawDrop: 3, lipRound: 0, tongueVisible: false },
  V: { mouthWidth: 45, mouthHeight: 10, jawDrop: 3, lipRound: 0, tongueVisible: false },
  
  // Consoantes alveolares (língua visível)
  T: { mouthWidth: 45, mouthHeight: 12, jawDrop: 5, lipRound: 0, tongueVisible: true },
  D: { mouthWidth: 45, mouthHeight: 12, jawDrop: 5, lipRound: 0, tongueVisible: true },
  N: { mouthWidth: 45, mouthHeight: 10, jawDrop: 3, lipRound: 0, tongueVisible: true },
  L: { mouthWidth: 45, mouthHeight: 10, jawDrop: 3, lipRound: 0, tongueVisible: true },
  
  // Sibilantes
  S: { mouthWidth: 42, mouthHeight: 6, jawDrop: 2, lipRound: 0, tongueVisible: false },
  Z: { mouthWidth: 42, mouthHeight: 6, jawDrop: 2, lipRound: 0, tongueVisible: false },
  
  // Vibrante
  R: { mouthWidth: 48, mouthHeight: 15, jawDrop: 5, lipRound: 0, tongueVisible: true },
  
  // Velares
  K: { mouthWidth: 50, mouthHeight: 20, jawDrop: 8, lipRound: 0, tongueVisible: false },
  G: { mouthWidth: 50, mouthHeight: 20, jawDrop: 8, lipRound: 0, tongueVisible: false },
  
  // Posição neutra
  NEUTRAL: { mouthWidth: 40, mouthHeight: 5, jawDrop: 0, lipRound: 0, tongueVisible: false },
  
  // Pausa (boca fechada)
  PAUSE: { mouthWidth: 38, mouthHeight: 3, jawDrop: 0, lipRound: 0, tongueVisible: false },
};

/**
 * Mantém a forma do fonema, mas abre e fecha a boca conforme a energia real
 * da faixa de áudio. Assim, pausas e sílabas fracas não usam uma abertura
 * estimada apenas pelo texto.
 */
export function blendVisemeWithAudioActivity(viseme: VisemeData, activity: number): VisemeData {
  const normalizedActivity = Math.max(0, Math.min(1, activity));
  if (normalizedActivity < 0.035) return { ...ADVANCED_VISEME_MAP.NEUTRAL };

  const articulation = 0.28 + normalizedActivity * 0.72;
  return {
    mouthWidth: viseme.mouthWidth,
    mouthHeight: Math.max(3, viseme.mouthHeight * articulation),
    jawDrop: viseme.jawDrop * articulation,
    lipRound: viseme.lipRound,
    tongueVisible: viseme.tongueVisible && normalizedActivity >= 0.12,
  };
}

/**
 * Extrai phonemes do texto com duração estimada
 */
export function extractPhonemesWithTiming(text: string, language: string = "pt-BR"): PhonemeTimestamp[] {
  const phonemeMap: Record<string, string> = {
    // Vogais
    a: "A", á: "A", à: "A", â: "A", ã: "A",
    e: "E", é: "E", è: "E", ê: "E",
    i: "I", í: "I", ï: "I",
    o: "O", ó: "O", ô: "O", õ: "O", ö: "O",
    u: "U", ú: "U", ü: "U",
    
    // Consoantes
    b: "B", p: "P", m: "M",
    f: "F", v: "V",
    t: "T", d: "D", n: "N", l: "L",
    s: "S", z: "Z",
    r: "R", ř: "R",
    k: "K", c: "K", q: "K",
    g: "G",
    
    // Inglês específico
    w: "U", y: "I",
    h: "NEUTRAL",
    j: "G",
    x: "S",
  };

  const phonemes: PhonemeTimestamp[] = [];
  const normalized = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúüçñ\s]/g, "");
  
  let currentTime = 0;
  const basePhoneDuration = 80; // ms por phoneme (velocidade natural)
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    
    // Pausa em espaços
    if (char === " ") {
      phonemes.push({
        phoneme: "PAUSE",
        start: currentTime,
        duration: 100,
        viseme: ADVANCED_VISEME_MAP.PAUSE,
      });
      currentTime += 100;
      continue;
    }
    
    const phoneme = phonemeMap[char] || "NEUTRAL";
    const isVowel = "AEIOU".includes(phoneme);
    
    // Vogais duram mais que consoantes
    const duration = isVowel ? basePhoneDuration * 1.5 : basePhoneDuration;
    
    phonemes.push({
      phoneme,
      start: currentTime,
      duration,
      viseme: ADVANCED_VISEME_MAP[phoneme] || ADVANCED_VISEME_MAP.NEUTRAL,
    });
    
    currentTime += duration;
    
    // Transição suave entre consoantes
    if (!isVowel && phoneme !== "NEUTRAL") {
      phonemes.push({
        phoneme: "NEUTRAL",
        start: currentTime,
        duration: 30,
        viseme: ADVANCED_VISEME_MAP.NEUTRAL,
      });
      currentTime += 30;
    }
  }
  
  return phonemes;
}

/**
 * Sincroniza visemas com áudio TTS em tempo real
 */
export class TTSVisemeSync {
  private phonemes: PhonemeTimestamp[] = [];
  private startTime: number = 0;
  private animationFrame: number | null = null;
  private onVisemeChange: (viseme: VisemeData) => void;
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioTimelineScale: number = 1;
  private audioContext: AudioContext | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private audioAnalyser: AnalyserNode | null = null;
  private amplitudeBuffer: Uint8Array<ArrayBuffer> | null = null;
  
  constructor(onVisemeChange: (viseme: VisemeData) => void) {
    this.onVisemeChange = onVisemeChange;
  }
  
  /**
   * Inicia sincronização com texto
   */
  start(text: string, language: string = "pt-BR") {
    this.stop();
    
    this.phonemes = extractPhonemesWithTiming(text, language);
    this.audioElement = null;
    this.audioTimelineScale = 1;
    this.startTime = Date.now();
    this.isPlaying = true;
    
    this.animate();
  }
  
  /**
   * Para sincronização
   */
  stop() {
    this.isPlaying = false;
    this.audioElement = null;
    this.disconnectAudioAnalysis();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.onVisemeChange(ADVANCED_VISEME_MAP.NEUTRAL);
  }

  private disconnectAudioAnalysis() {
    this.audioSource?.disconnect();
    this.audioAnalyser?.disconnect();
    this.audioSource = null;
    this.audioAnalyser = null;
    this.amplitudeBuffer = null;
  }

  primeAudioContext() {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") return;
    this.audioContext ??= new AudioContext();
    if (this.audioContext.state !== "running") {
      void this.audioContext.resume().catch(() => undefined);
    }
  }

  private connectAudioAnalysis(audioElement: HTMLAudioElement) {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") return;
    try {
      this.disconnectAudioAnalysis();
      this.primeAudioContext();
      if (!this.audioContext || this.audioContext.state !== "running") return;
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(this.audioContext.destination);
      this.audioSource = source;
      this.audioAnalyser = analyser;
      this.amplitudeBuffer = new Uint8Array(analyser.fftSize);
    } catch {
      // CORS ou WebAudio indisponível: a linha temporal de fonemas continua ativa.
      this.disconnectAudioAnalysis();
    }
  }

  private getAudioActivity(): number | null {
    if (!this.audioAnalyser || !this.amplitudeBuffer) return null;
    this.audioAnalyser.getByteTimeDomainData(this.amplitudeBuffer);
    let sumSquares = 0;
    for (const sample of this.amplitudeBuffer) {
      const normalized = (sample - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.amplitudeBuffer.length);
    return Math.min(1, rms * 8);
  }
  
  /**
   * Pausa sincronização
   */
  pause() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Retoma sincronização
   */
  resume() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.animate();
    }
  }
  
  /**
   * Loop de animação
   */
  private animate = () => {
    if (!this.isPlaying) return;
    
    const currentTime = this.audioElement
      ? this.audioElement.currentTime * 1000 * this.audioTimelineScale
      : Date.now() - this.startTime;
    
    // Encontrar phoneme atual
    const currentPhoneme = this.phonemes.find(
      (p) => currentTime >= p.start && currentTime < p.start + p.duration
    );
    
    if (currentPhoneme) {
      const applyAudioActivity = (viseme: VisemeData) => {
        const activity = this.getAudioActivity();
        this.onVisemeChange(activity === null ? viseme : blendVisemeWithAudioActivity(viseme, activity));
      };
      // Interpolar visema para transição suave
      const nextPhoneme = this.phonemes.find(
        (p) => p.start === currentPhoneme.start + currentPhoneme.duration
      );
      
      if (nextPhoneme) {
        const progress = (currentTime - currentPhoneme.start) / currentPhoneme.duration;
        
        // Transição suave apenas nos últimos 20% da duração
        if (progress > 0.8) {
          const transitionProgress = (progress - 0.8) / 0.2;
          const interpolatedViseme = this.interpolateVisemes(
            currentPhoneme.viseme,
            nextPhoneme.viseme,
            transitionProgress
          );
          applyAudioActivity(interpolatedViseme);
        } else {
          applyAudioActivity(currentPhoneme.viseme);
        }
      } else {
        applyAudioActivity(currentPhoneme.viseme);
      }
    } else {
      // Fim da animação
      this.onVisemeChange(ADVANCED_VISEME_MAP.NEUTRAL);
      this.stop();
      return;
    }
    
    this.animationFrame = requestAnimationFrame(this.animate);
  };
  
  /**
   * Interpola entre dois visemas para transição suave
   */
  private interpolateVisemes(from: VisemeData, to: VisemeData, progress: number): VisemeData {
    return {
      mouthWidth: from.mouthWidth + (to.mouthWidth - from.mouthWidth) * progress,
      mouthHeight: from.mouthHeight + (to.mouthHeight - from.mouthHeight) * progress,
      jawDrop: from.jawDrop + (to.jawDrop - from.jawDrop) * progress,
      lipRound: from.lipRound + (to.lipRound - from.lipRound) * progress,
      tongueVisible: progress < 0.5 ? from.tongueVisible : to.tongueVisible,
    };
  }
  
  /**
   * Sincroniza com áudio element
   */
  syncWithAudio(audioElement: HTMLAudioElement, text: string, language: string = "pt-BR") {
    this.phonemes = extractPhonemesWithTiming(text, language);
    this.audioElement = audioElement;
    const estimatedTimeline = this.phonemes.reduce(
      (end, phoneme) => Math.max(end, phoneme.start + phoneme.duration),
      1,
    );
    const updateAudioTimelineScale = () => {
      const mediaDuration = audioElement.duration * 1000;
      this.audioTimelineScale = Number.isFinite(mediaDuration) && mediaDuration > 0
        ? estimatedTimeline / mediaDuration
        : 1;
    };
    audioElement.addEventListener("loadedmetadata", updateAudioTimelineScale, { once: true });
    updateAudioTimelineScale();
    
    audioElement.addEventListener("play", () => {
      this.connectAudioAnalysis(audioElement);
      this.startTime = Date.now() - (audioElement.currentTime * 1000);
      this.isPlaying = true;
      this.animate();
    });
    
    audioElement.addEventListener("pause", () => {
      this.pause();
    });
    
    audioElement.addEventListener("ended", () => {
      this.stop();
    });
    
    audioElement.addEventListener("seeked", () => {
      this.startTime = Date.now() - (audioElement.currentTime * 1000);
    });
  }
}

/**
 * Hook React para sincronização TTS
 */
export function useTTSVisemeSync(onVisemeChange: (viseme: VisemeData) => void) {
  const syncRef = React.useRef<TTSVisemeSync | null>(null);
  
  React.useEffect(() => {
    syncRef.current = new TTSVisemeSync(onVisemeChange);
    
    return () => {
      syncRef.current?.stop();
    };
  }, [onVisemeChange]);

  const start = React.useCallback((text: string, language?: string) => syncRef.current?.start(text, language), []);
  const stop = React.useCallback(() => syncRef.current?.stop(), []);
  const pause = React.useCallback(() => syncRef.current?.pause(), []);
  const resume = React.useCallback(() => syncRef.current?.resume(), []);
  const syncWithAudio = React.useCallback((audio: HTMLAudioElement, text: string, language?: string) =>
    syncRef.current?.syncWithAudio(audio, text, language), []);
  const primeAudioContext = React.useCallback(() => syncRef.current?.primeAudioContext(), []);

  return { start, stop, pause, resume, syncWithAudio, primeAudioContext };
}

// Importar React para hook
import * as React from "react";
