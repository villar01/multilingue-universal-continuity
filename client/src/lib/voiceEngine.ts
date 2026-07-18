/**
 * Motor de Voz Avançado - MultiLingue Universal
 * Edge TTS Neural (Microsoft) para 69 idiomas com lip-sync
 * Fallback automático para Web Speech API se offline
 */
import { speakEdgeTTS, stopEdgeTTS } from "@/lib/edgeTTSClient";

export interface VoiceProfile {
  lang: string;
  name?: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface LipSyncFrame {
  time: number;
  mouth: 'closed' | 'open-small' | 'open-medium' | 'open-large' | 'round' | 'wide';
  intensity: number;
}

// Mapeamento de idiomas para configurações de voz otimizadas
export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'pt-BR': { lang: 'pt-BR', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'pt-PT': { lang: 'pt-PT', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'en-US': { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0 },
  'en-GB': { lang: 'en-GB', rate: 0.95, pitch: 0.95, volume: 1.0 },
  'es-ES': { lang: 'es-ES', rate: 1.0, pitch: 1.05, volume: 1.0 },
  'es-MX': { lang: 'es-MX', rate: 1.0, pitch: 1.0, volume: 1.0 },
  'fr-FR': { lang: 'fr-FR', rate: 0.95, pitch: 1.0, volume: 1.0 },
  'de-DE': { lang: 'de-DE', rate: 0.9, pitch: 0.95, volume: 1.0 },
  'it-IT': { lang: 'it-IT', rate: 1.0, pitch: 1.05, volume: 1.0 },
  'ja-JP': { lang: 'ja-JP', rate: 0.85, pitch: 1.1, volume: 1.0 },
  'ko-KR': { lang: 'ko-KR', rate: 0.9, pitch: 1.05, volume: 1.0 },
  'zh-CN': { lang: 'zh-CN', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'zh-TW': { lang: 'zh-TW', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'ar-SA': { lang: 'ar-SA', rate: 0.85, pitch: 0.95, volume: 1.0 },
  'hi-IN': { lang: 'hi-IN', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'ru-RU': { lang: 'ru-RU', rate: 0.9, pitch: 0.95, volume: 1.0 },
  'nl-NL': { lang: 'nl-NL', rate: 0.95, pitch: 1.0, volume: 1.0 },
  'pl-PL': { lang: 'pl-PL', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'sv-SE': { lang: 'sv-SE', rate: 0.95, pitch: 1.05, volume: 1.0 },
  'da-DK': { lang: 'da-DK', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'fi-FI': { lang: 'fi-FI', rate: 0.85, pitch: 0.95, volume: 1.0 },
  'nb-NO': { lang: 'nb-NO', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'tr-TR': { lang: 'tr-TR', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'el-GR': { lang: 'el-GR', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'cs-CZ': { lang: 'cs-CZ', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'hu-HU': { lang: 'hu-HU', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'ro-RO': { lang: 'ro-RO', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'uk-UA': { lang: 'uk-UA', rate: 0.9, pitch: 0.95, volume: 1.0 },
  'he-IL': { lang: 'he-IL', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'id-ID': { lang: 'id-ID', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'ms-MY': { lang: 'ms-MY', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'th-TH': { lang: 'th-TH', rate: 0.85, pitch: 1.05, volume: 1.0 },
  'vi-VN': { lang: 'vi-VN', rate: 0.85, pitch: 1.1, volume: 1.0 },
  'af-ZA': { lang: 'af-ZA', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'sw-KE': { lang: 'sw-KE', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'yo-NG': { lang: 'yo-NG', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'ig-NG': { lang: 'ig-NG', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'ha-NG': { lang: 'ha-NG', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'am-ET': { lang: 'am-ET', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'zu-ZA': { lang: 'zu-ZA', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'xh-ZA': { lang: 'xh-ZA', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'qu-PE': { lang: 'qu-PE', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'gn-PY': { lang: 'gn-PY', rate: 0.85, pitch: 1.0, volume: 1.0 },
  'ca-ES': { lang: 'ca-ES', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'eu-ES': { lang: 'eu-ES', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'gl-ES': { lang: 'gl-ES', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'cy-GB': { lang: 'cy-GB', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'ga-IE': { lang: 'ga-IE', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'mt-MT': { lang: 'mt-MT', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'is-IS': { lang: 'is-IS', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'lv-LV': { lang: 'lv-LV', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'lt-LT': { lang: 'lt-LT', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'et-EE': { lang: 'et-EE', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'sk-SK': { lang: 'sk-SK', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'sl-SI': { lang: 'sl-SI', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'hr-HR': { lang: 'hr-HR', rate: 0.9, pitch: 1.0, volume: 1.0 },
  'bg-BG': { lang: 'bg-BG', rate: 0.9, pitch: 0.95, volume: 1.0 },
  'sr-RS': { lang: 'sr-RS', rate: 0.9, pitch: 0.95, volume: 1.0 },
  'bs-BA': { lang: 'bs-BA', rate: 0.9, pitch: 1.0, volume: 1.0 },
};

// Mapeamento de fonemas para posição da boca (lip-sync)
const PHONEME_TO_MOUTH: Record<string, LipSyncFrame['mouth']> = {
  'a': 'open-large', 'á': 'open-large', 'â': 'open-large', 'ã': 'open-large',
  'e': 'open-medium', 'é': 'open-medium', 'ê': 'open-medium',
  'i': 'wide', 'í': 'wide', 'y': 'wide',
  'o': 'round', 'ó': 'round', 'ô': 'round', 'õ': 'round',
  'u': 'round', 'ú': 'round', 'ü': 'round',
  'b': 'closed', 'p': 'closed', 'm': 'closed',
  'f': 'open-small', 'v': 'open-small',
  's': 'open-small', 'z': 'open-small',
  'l': 'open-medium', 'r': 'open-medium', 'n': 'open-medium',
  't': 'open-small', 'd': 'open-small',
  'k': 'open-medium', 'g': 'open-medium',
  ' ': 'closed',
};

/**
 * Gera frames de lip-sync a partir de um texto
 */
export function generateLipSyncFrames(text: string, durationMs: number): LipSyncFrame[] {
  const frames: LipSyncFrame[] = [];
  const chars = text.toLowerCase().split('');
  const timePerChar = durationMs / Math.max(chars.length, 1);

  chars.forEach((char, index) => {
    const mouth = PHONEME_TO_MOUTH[char] || 'open-small';
    const intensity = ['a', 'e', 'o'].includes(char) ? 1.0 : 0.6;
    frames.push({
      time: index * timePerChar,
      mouth,
      intensity,
    });
  });

  return frames;
}

/**
 * Obtém a melhor voz disponível para um idioma
 */
export function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  
  // Prioridade: voz nativa > voz do idioma > fallback
  const exactMatch = voices.find(v => v.lang === lang);
  if (exactMatch) return exactMatch;
  
  const langPrefix = lang.split('-')[0];
  const prefixMatch = voices.find(v => v.lang.startsWith(langPrefix));
  if (prefixMatch) return prefixMatch;
  
  // Fallback para inglês
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

/**
 * Fala um texto com configurações otimizadas e retorna frames de lip-sync
 */
export function speakWithLipSync(
  text: string,
  langCode: string,
  onLipSync: (frame: LipSyncFrame) => void,
  onEnd?: () => void
): void {
  if (!text?.trim()) return;

  stopEdgeTTS();

  const profile = VOICE_PROFILES[langCode] || VOICE_PROFILES['en-US'];

  // Estimar duração baseada no texto (aprox 150 palavras/min)
  const wordCount = text.split(' ').length;
  const estimatedDurationMs = (wordCount / 150) * 60 * 1000 / profile.rate;

  // Gerar frames de lip-sync
  const frames = generateLipSyncFrames(text, estimatedDurationMs);

  // Disparar frames de lip-sync em tempo real
  let frameIndex = 0;
  const startTime = Date.now();

  const lipSyncInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    while (frameIndex < frames.length && frames[frameIndex].time <= elapsed) {
      onLipSync(frames[frameIndex]);
      frameIndex++;
    }
    if (frameIndex >= frames.length) {
      clearInterval(lipSyncInterval);
    }
  }, 16); // 60fps

  // Usa Edge TTS Neural (alta qualidade)
  speakEdgeTTS(text, profile.lang, {
    rate: profile.rate,
    onEnd: () => {
      clearInterval(lipSyncInterval);
      onLipSync({ time: 0, mouth: 'closed', intensity: 0 });
      onEnd?.();
    },
  });
}

/**
 * Pré-carrega vozes disponíveis
 */
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}

/**
 * Verifica suporte a idioma
 */
export function isLanguageSupported(lang: string): boolean {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0];
  return voices.some(v => v.lang === lang || v.lang.startsWith(langPrefix));
}
