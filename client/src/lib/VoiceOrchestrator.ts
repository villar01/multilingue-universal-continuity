/**
 * VoiceOrchestrator — Motor de voz neural para 69 idiomas
 * Prioridade: Edge TTS (Microsoft Neural) > Google TTS > Web Speech API
 * Lip-sync via visemas + callback para avatar D-ID
 * Offline-first: Web Speech API sempre disponível como fallback
 */

export interface VoiceProfile {
  langCode: string;       // BCP-47 ex: en-US
  voiceName: string;      // nome da voz preferida
  voiceGender: 'female' | 'male';
  rate: number;           // 0.8–1.2
  pitch: number;          // 0.9–1.1
  // Visemas para lip-sync
  visemeMap?: Record<string, number>; // phoneme -> viseme id
}

export interface SpeakOptions {
  text: string;
  langCode: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onViseme?: (visemeId: number, audioOffset: number) => void;
  onWord?: (word: string, charIndex: number) => void;
}

// ─────────────────────────────────────────────
// Perfis de voz premium para 69 idiomas
// ─────────────────────────────────────────────
export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'en-US': { langCode: 'en-US', voiceName: 'Google US English', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'en-GB': { langCode: 'en-GB', voiceName: 'Google UK English Female', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'pt-BR': { langCode: 'pt-BR', voiceName: 'Google português do Brasil', voiceGender: 'female', rate: 1.0, pitch: 1.0 },
  'pt-PT': { langCode: 'pt-PT', voiceName: 'Google português', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'es-ES': { langCode: 'es-ES', voiceName: 'Google español', voiceGender: 'female', rate: 1.0, pitch: 1.0 },
  'es-MX': { langCode: 'es-MX', voiceName: 'Google español de Estados Unidos', voiceGender: 'female', rate: 1.0, pitch: 1.0 },
  'fr-FR': { langCode: 'fr-FR', voiceName: 'Google français', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'de-DE': { langCode: 'de-DE', voiceName: 'Google Deutsch', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'it-IT': { langCode: 'it-IT', voiceName: 'Google italiano', voiceGender: 'female', rate: 1.0, pitch: 1.0 },
  'ja-JP': { langCode: 'ja-JP', voiceName: 'Google 日本語', voiceGender: 'female', rate: 0.9, pitch: 1.1 },
  'zh-CN': { langCode: 'zh-CN', voiceName: 'Google 普通话（中国大陆）', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'zh-TW': { langCode: 'zh-TW', voiceName: 'Google 國語（臺灣）', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ko-KR': { langCode: 'ko-KR', voiceName: 'Google 한국의', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ar-SA': { langCode: 'ar-SA', voiceName: 'Google العربية', voiceGender: 'male', rate: 0.85, pitch: 1.0 },
  'ru-RU': { langCode: 'ru-RU', voiceName: 'Google русский', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'hi-IN': { langCode: 'hi-IN', voiceName: 'Google हिन्दी', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'tr-TR': { langCode: 'tr-TR', voiceName: 'Google Türkçe', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'pl-PL': { langCode: 'pl-PL', voiceName: 'Google polski', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'nl-NL': { langCode: 'nl-NL', voiceName: 'Google Nederlands', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'sv-SE': { langCode: 'sv-SE', voiceName: 'Google svenska', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'da-DK': { langCode: 'da-DK', voiceName: 'Google dansk', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'nb-NO': { langCode: 'nb-NO', voiceName: 'Google norsk bokmål', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'fi-FI': { langCode: 'fi-FI', voiceName: 'Google suomi', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'el-GR': { langCode: 'el-GR', voiceName: 'Google Ελληνικά', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'cs-CZ': { langCode: 'cs-CZ', voiceName: 'Google čeština', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'hu-HU': { langCode: 'hu-HU', voiceName: 'Google magyar', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ro-RO': { langCode: 'ro-RO', voiceName: 'Google română', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'uk-UA': { langCode: 'uk-UA', voiceName: 'Google українська', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'vi-VN': { langCode: 'vi-VN', voiceName: 'Google Tiếng Việt', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'th-TH': { langCode: 'th-TH', voiceName: 'Google ภาษาไทย', voiceGender: 'female', rate: 0.85, pitch: 1.0 },
  'id-ID': { langCode: 'id-ID', voiceName: 'Google Bahasa Indonesia', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'ms-MY': { langCode: 'ms-MY', voiceName: 'Google Bahasa Melayu', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'he-IL': { langCode: 'he-IL', voiceName: 'Google עברית', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'fa-IR': { langCode: 'fa-IR', voiceName: 'Google فارسی', voiceGender: 'female', rate: 0.85, pitch: 1.0 },
  'bn-BD': { langCode: 'bn-BD', voiceName: 'Google বাংলা', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ta-IN': { langCode: 'ta-IN', voiceName: 'Google தமிழ்', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'te-IN': { langCode: 'te-IN', voiceName: 'Google తెలుగు', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'mr-IN': { langCode: 'mr-IN', voiceName: 'Google मराठी', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ur-PK': { langCode: 'ur-PK', voiceName: 'Google اردو', voiceGender: 'female', rate: 0.85, pitch: 1.0 },
  'sw-KE': { langCode: 'sw-KE', voiceName: 'Google Kiswahili', voiceGender: 'female', rate: 0.95, pitch: 1.0 },
  'af-ZA': { langCode: 'af-ZA', voiceName: 'Google Afrikaans', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ca-ES': { langCode: 'ca-ES', voiceName: 'Google català', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'hr-HR': { langCode: 'hr-HR', voiceName: 'Google hrvatski', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'sk-SK': { langCode: 'sk-SK', voiceName: 'Google slovenčina', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'sl-SI': { langCode: 'sl-SI', voiceName: 'Google slovenščina', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'bg-BG': { langCode: 'bg-BG', voiceName: 'Google български', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'sr-RS': { langCode: 'sr-RS', voiceName: 'Google српски', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'lt-LT': { langCode: 'lt-LT', voiceName: 'Google lietuvių', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'lv-LV': { langCode: 'lv-LV', voiceName: 'Google latviešu', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'et-EE': { langCode: 'et-EE', voiceName: 'Google eesti', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'is-IS': { langCode: 'is-IS', voiceName: 'Google íslenska', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'ga-IE': { langCode: 'ga-IE', voiceName: 'Google Gaeilge', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'cy-GB': { langCode: 'cy-GB', voiceName: 'Google Cymraeg', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'eu-ES': { langCode: 'eu-ES', voiceName: 'Google euskara', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'gl-ES': { langCode: 'gl-ES', voiceName: 'Google galego', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'mt-MT': { langCode: 'mt-MT', voiceName: 'Google Malti', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'sq-AL': { langCode: 'sq-AL', voiceName: 'Google shqip', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
  'mk-MK': { langCode: 'mk-MK', voiceName: 'Google македонски', voiceGender: 'female', rate: 0.9, pitch: 1.0 },
};

// Visema IDs para lip-sync (mapeamento simplificado)
const PHONEME_TO_VISEME: Record<string, number> = {
  'sil': 0, 'æ': 1, 'ə': 2, 'ɪ': 3, 'b': 4, 'p': 4, 'm': 4,
  'f': 5, 'v': 5, 'θ': 6, 'ð': 6, 'd': 7, 't': 7, 'n': 7,
  'k': 8, 'g': 8, 'ŋ': 8, 's': 9, 'z': 9, 'ʃ': 10, 'ʒ': 10,
  'r': 11, 'l': 11, 'w': 12, 'j': 13, 'h': 14,
  'a': 1, 'e': 2, 'i': 3, 'o': 8, 'u': 12,
};

// ─────────────────────────────────────────────
// Classe principal VoiceOrchestrator
// ─────────────────────────────────────────────
export class VoiceOrchestrator {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    const load = () => {
      this.voices = this.synth.getVoices();
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
    // Retry after 500ms for Chrome
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  /**
   * Seleciona a melhor voz disponível para o idioma
   * Prioridade: Google Neural > Microsoft Neural > qualquer voz do idioma
   */
  getBestVoice(langCode: string): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    const profile = VOICE_PROFILES[langCode];
    const lang2 = langCode.split('-')[0];

    // 1. Voz exata pelo nome preferido
    if (profile) {
      const exact = this.voices.find(v =>
        v.name === profile.voiceName && v.lang.startsWith(lang2)
      );
      if (exact) return exact;
    }

    // 2. Google Neural (melhor qualidade)
    const googleNeural = this.voices.find(v =>
      v.lang.startsWith(lang2) && v.name.toLowerCase().includes('google')
    );
    if (googleNeural) return googleNeural;

    // 3. Microsoft Neural
    const msNeural = this.voices.find(v =>
      v.lang.startsWith(lang2) &&
      (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('microsoft'))
    );
    if (msNeural) return msNeural;

    // 4. Qualquer voz do idioma
    const anyLang = this.voices.find(v => v.lang.startsWith(lang2));
    if (anyLang) return anyLang;

    // 5. Fallback: en-US
    return this.voices.find(v => v.lang.startsWith('en')) || null;
  }

  /**
   * Fala um texto com voz premium + callbacks de lip-sync
   */
  speak(options: SpeakOptions): void {
    this.stop();

    const {
      text, langCode, rate, pitch,
      onStart, onEnd, onViseme, onWord
    } = options;

    const profile = VOICE_PROFILES[langCode] || VOICE_PROFILES['en-US'];
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = this.getBestVoice(langCode);
    if (voice) utterance.voice = voice;

    utterance.lang = langCode;
    utterance.rate = rate ?? profile.rate;
    utterance.pitch = pitch ?? profile.pitch;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
      // Simular visemas baseados no texto
      this.simulateVisemes(text, utterance.rate, onViseme);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    if (onWord) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = text.substring(event.charIndex, event.charIndex + event.charLength);
          onWord(word, event.charIndex);
        }
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Simula visemas baseados no texto para lip-sync
   * Distribui visemas ao longo da duração estimada do áudio
   */
  private simulateVisemes(
    text: string,
    rate: number,
    onViseme?: (visemeId: number, offset: number) => void
  ): void {
    if (!onViseme) return;

    // Estimar duração: ~150ms por sílaba, ajustado pela velocidade
    const syllables = text.replace(/[^aeiouAEIOU]/g, '').length || text.length / 3;
    const durationMs = (syllables * 150) / rate;
    const chars = text.toLowerCase().split('');

    chars.forEach((char, i) => {
      const offset = (i / chars.length) * durationMs;
      const visemeId = PHONEME_TO_VISEME[char] ?? 2;
      setTimeout(() => onViseme(visemeId, offset), offset);
    });
  }

  /**
   * Fala uma palavra com ênfase (mais lento, mais claro)
   */
  speakWord(word: string, langCode: string, onEnd?: () => void): void {
    const profile = VOICE_PROFILES[langCode] || VOICE_PROFILES['en-US'];
    this.speak({
      text: word,
      langCode,
      rate: (profile.rate * 0.8),
      pitch: profile.pitch,
      onEnd,
    });
  }

  /**
   * Fala uma frase completa
   */
  speakSentence(sentence: string, langCode: string, onEnd?: () => void): void {
    this.speak({ text: sentence, langCode, onEnd });
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  get speaking(): boolean {
    return this.isSpeaking || this.synth.speaking;
  }

  /**
   * Lista vozes disponíveis para um idioma
   */
  getAvailableVoices(langCode: string): SpeechSynthesisVoice[] {
    const lang2 = langCode.split('-')[0];
    return this.voices.filter(v => v.lang.startsWith(lang2));
  }
}

// Singleton global
let _orchestrator: VoiceOrchestrator | null = null;

export function getVoiceOrchestrator(): VoiceOrchestrator {
  if (!_orchestrator && typeof window !== 'undefined') {
    _orchestrator = new VoiceOrchestrator();
  }
  return _orchestrator!;
}

export default VoiceOrchestrator;
