/**
 * localTTS.ts — Web Speech API com seleção inteligente de voz neural
 * Detecta automaticamente as melhores vozes disponíveis no dispositivo do aluno.
 * No Android/iOS usa vozes Google/Apple Neural (qualidade igual ao Teacher Poli).
 */

export type VoiceQuality = 'neural' | 'enhanced' | 'standard' | 'none';

export interface VoiceInfo {
  voice: SpeechSynthesisVoice | null;
  quality: VoiceQuality;
  name: string;
  lang: string;
}

// Palavras-chave que indicam voz neural de alta qualidade
const NEURAL_KEYWORDS = [
  'neural', 'natural', 'enhanced', 'premium', 'wavenet', 'studio',
  'google', 'microsoft', 'apple', 'aria', 'jenny', 'guy', 'emma',
  'brian', 'andrew', 'ava', 'echo', 'nova', 'alloy', 'shimmer', 'fable',
];

// Vozes preferidas por idioma e gênero
const PREFERRED_VOICES: Record<string, { female: string[]; male: string[] }> = {
  'en': {
    female: ['Samantha', 'Victoria', 'Karen', 'Moira', 'Ava', 'Jenny', 'Emma', 'Aria', 'Nova'],
    male: ['Alex', 'Daniel', 'Tom', 'Fred', 'Guy', 'Brian', 'Andrew', 'Eric', 'Roger'],
  },
  'pt': {
    female: ['Luciana', 'Francisca', 'Catarina', 'Joana', 'Fernanda', 'Ana'],
    male: ['Daniel', 'Ricardo', 'Diogo', 'Marcos', 'Carlos', 'Pedro'],
  },
  'es': {
    female: ['Paulina', 'Monica', 'Esperanza', 'Marisol', 'Paloma', 'Elena', 'Carmen'],
    male: ['Diego', 'Jorge', 'Juan', 'Carlos', 'Alvaro', 'Miguel'],
  },
  'fr': {
    female: ['Amelie', 'Marie', 'Julie', 'Virginie', 'Audrey', 'Lea'],
    male: ['Thomas', 'Nicolas', 'Antoine', 'Remy', 'Pierre', 'Louis'],
  },
  'de': {
    female: ['Anna', 'Petra', 'Hedda', 'Katja', 'Ingrid'],
    male: ['Stefan', 'Markus', 'Hans', 'Klaus', 'Konrad'],
  },
  'it': {
    female: ['Alice', 'Federica', 'Paola', 'Elsa', 'Isabella'],
    male: ['Luca', 'Matteo', 'Roberto', 'Giorgio', 'Marco'],
  },
  'ja': {
    female: ['Kyoko', 'Nanami', 'Haruka', 'Ayumi'],
    male: ['Otoya', 'Ichiro', 'Kenji', 'Takumi'],
  },
  'zh': {
    female: ['Ting-Ting', 'Sin-Ji', 'Mei-Jia', 'Xiaoxiao'],
    male: ['Yue', 'Yunyang', 'Xiaochen'],
  },
  'ko': {
    female: ['Yuna', 'Sora'],
    male: ['Seoyeon', 'Hyunsu'],
  },
  'ru': {
    female: ['Milena', 'Katya', 'Irina', 'Dariya'],
    male: ['Yuri', 'Pavel', 'Dmitri', 'Maxim'],
  },
  'ar': {
    female: ['Laila', 'Zara', 'Hoda'],
    male: ['Tarik', 'Naayf', 'Hamed'],
  },
  'hi': {
    female: ['Lekha', 'Swara', 'Aditi', 'Kalpana'],
    male: ['Hemant', 'Ravi', 'Arjun'],
  },
  'nl': {
    female: ['Fenna', 'Lotte'],
    male: ['Ruben', 'Frank', 'Daan'],
  },
  'pl': {
    female: ['Zosia', 'Paulina', 'Ewa'],
    male: ['Krzysztof', 'Marek', 'Piotr'],
  },
  'sv': {
    female: ['Alva', 'Klara', 'Astrid'],
    male: ['Oskar', 'Erik', 'Lars'],
  },
  'tr': {
    female: ['Yelda', 'Emel', 'Filiz'],
    male: ['Tolga', 'Mehmet', 'Ali'],
  },
};

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

export async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!('speechSynthesis' in window)) return [];
  if (voicesLoaded && cachedVoices.length > 0) return cachedVoices;
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      if (!voicesLoaded) {
        cachedVoices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
        resolve(cachedVoices);
      }
    }, 3000);
  });
}

function detectVoiceQuality(voice: SpeechSynthesisVoice): VoiceQuality {
  const nameLower = voice.name.toLowerCase();
  const uriLower = voice.voiceURI.toLowerCase();
  if (NEURAL_KEYWORDS.some(k => nameLower.includes(k) || uriLower.includes(k))) return 'neural';
  if (nameLower.includes('google') || uriLower.includes('google')) return 'neural';
  if (nameLower.includes('apple') || uriLower.includes('com.apple')) return 'neural';
  if (nameLower.includes('microsoft') && !nameLower.includes('desktop')) return 'enhanced';
  return 'standard';
}

export async function selectBestVoice(lang: string, gender: 'male' | 'female' = 'female'): Promise<VoiceInfo> {
  const voices = await loadVoices();
  const langBase = lang.split('-')[0].toLowerCase();
  const langFull = lang.toLowerCase();

  const langVoices = voices.filter(v =>
    v.lang.toLowerCase().startsWith(langBase) ||
    v.lang.toLowerCase() === langFull
  );

  if (langVoices.length === 0) {
    return { voice: null, quality: 'none', name: 'Nenhuma', lang };
  }

  const scored = langVoices.map(v => ({
    voice: v,
    quality: detectVoiceQuality(v),
    score: detectVoiceQuality(v) === 'neural' ? 3 : detectVoiceQuality(v) === 'enhanced' ? 2 : 1,
  }));
  scored.sort((a, b) => b.score - a.score);

  // Tenta voz preferida por gênero
  const preferred = PREFERRED_VOICES[langBase];
  if (preferred) {
    for (const pref of preferred[gender]) {
      const match = scored.find(s => s.voice.name.toLowerCase().includes(pref.toLowerCase()));
      if (match) return { voice: match.voice, quality: match.quality, name: match.voice.name, lang };
    }
    // Tenta gênero oposto
    const opposite = preferred[gender === 'female' ? 'male' : 'female'];
    for (const pref of opposite) {
      const match = scored.find(s => s.voice.name.toLowerCase().includes(pref.toLowerCase()));
      if (match) return { voice: match.voice, quality: match.quality, name: match.voice.name, lang };
    }
  }

  const best = scored[0];
  return { voice: best.voice, quality: best.quality, name: best.voice.name, lang };
}

/** Fala diretamente — sem MediaRecorder, sem gravação */
export async function synthesizeSpeechLocal(
  text: string,
  lang: string,
  gender: 'male' | 'female' = 'female',
  callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: (err: string) => void }
): Promise<VoiceInfo> {
  if (!('speechSynthesis' in window)) {
    callbacks?.onError?.('Web Speech API não suportada');
    return { voice: null, quality: 'none', name: 'Não suportado', lang };
  }

  const voiceInfo = await selectBestVoice(lang, gender);

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (voiceInfo.voice) utterance.voice = voiceInfo.voice;

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = (e) => callbacks?.onError?.(e.error);

  window.speechSynthesis.speak(utterance);
  return voiceInfo;
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isWebSpeechSupported(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export async function getVoicesForLang(lang: string): Promise<VoiceInfo[]> {
  const voices = await loadVoices();
  const langBase = lang.split('-')[0].toLowerCase();
  return voices
    .filter(v => v.lang.toLowerCase().startsWith(langBase))
    .map(v => ({ voice: v, quality: detectVoiceQuality(v), name: v.name, lang: v.lang }))
    .sort((a, b) => {
      const order = { neural: 3, enhanced: 2, standard: 1, none: 0 };
      return order[b.quality] - order[a.quality];
    });
}

// Compatibilidade com código legado
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis?.getVoices() ?? [];
}
export function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Erro ao reproduzir áudio'));
    audio.play().catch(reject);
  });
}
export function stopAudio(): void { stopSpeaking(); }
export async function clearAudioCache(): Promise<void> { /* no-op */ }
