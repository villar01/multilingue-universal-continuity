/**
 * VoiceSelector — Smart voice selector for Web Speech API.
 *
 * Lists ALL voices available on the user's device and lets them pick
 * the best one for each language. No external API needed — 100% local.
 *
 * Quality labels:
 *  - 🌟 Neural/Premium: Microsoft Neural, Google Natural, Apple Enhanced
 *  - ⭐ Standard: Other voices
 *  - 🔊 Basic: Generic fallback
 */

import { useState, useEffect, useCallback } from "react";
import { Volume2, ChevronDown, Settings, X, Check } from "lucide-react";

export interface VoiceInfo {
  name: string;
  lang: string;
  quality: "neural" | "premium" | "standard" | "basic";
  qualityLabel: string;
  provider: string;
}

function classifyVoice(v: SpeechSynthesisVoice): VoiceInfo {
  const n = v.name.toLowerCase();
  let quality: VoiceInfo["quality"] = "basic";
  let provider = "Sistema";

  if (n.includes("google")) { provider = "Google"; quality = "neural"; }
  else if (n.includes("microsoft") && (n.includes("neural") || n.includes("online"))) { provider = "Microsoft"; quality = "neural"; }
  else if (n.includes("microsoft")) { provider = "Microsoft"; quality = "standard"; }
  else if (n.includes("apple") || n.includes("siri")) { provider = "Apple"; quality = "premium"; }
  else if (n.includes("premium") || n.includes("enhanced")) { provider = "Sistema"; quality = "premium"; }
  else if (n.includes("compact")) { provider = "Sistema"; quality = "standard"; }

  const qualityLabel =
    quality === "neural" ? "🌟 Neural" :
    quality === "premium" ? "⭐ Premium" :
    quality === "standard" ? "✓ Padrão" : "• Básica";

  return { name: v.name, lang: v.lang, quality, qualityLabel, provider };
}

function getVoicesForLang(langCode: string): VoiceInfo[] {
  if (!("speechSynthesis" in window)) return [];
  const base = langCode.split("-")[0].toLowerCase();
  const bcp47 = langCode.includes("-") ? langCode : langCode + "-" + langCode.toUpperCase();

  return window.speechSynthesis
    .getVoices()
    .filter(v => {
      const vBase = v.lang.split("-")[0].toLowerCase();
      return v.lang === bcp47 || v.lang === langCode || vBase === base;
    })
    .map(classifyVoice)
    .sort((a, b) => {
      const order = { neural: 0, premium: 1, standard: 2, basic: 3 };
      return order[a.quality] - order[b.quality];
    });
}

// Persist voice preferences per language
const STORAGE_KEY = "ml_voice_prefs";
function loadVoicePrefs(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveVoicePref(lang: string, voiceName: string) {
  const prefs = loadVoicePrefs();
  prefs[lang] = voiceName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
export function getPreferredVoiceName(lang: string): string | null {
  return loadVoicePrefs()[lang] || null;
}

// Enhanced speak function that respects user preferences
export function speakWithPreference(
  text: string,
  langCode: string,
  opts?: { rate?: number; pitch?: number; onEnd?: () => void; onStart?: () => void }
) {
  if (!("speechSynthesis" in window) || !text?.trim()) return;
  window.speechSynthesis.cancel();

  const base = langCode.split("-")[0].toLowerCase();
  const bcp47Map: Record<string, string> = {
    en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE", it: "it-IT",
    pt: "pt-BR", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
    ar: "ar-SA", hi: "hi-IN", nl: "nl-NL", pl: "pl-PL", tr: "tr-TR",
    sv: "sv-SE", da: "da-DK", fi: "fi-FI", nb: "nb-NO", no: "nb-NO",
    cs: "cs-CZ", hu: "hu-HU", ro: "ro-RO", el: "el-GR", he: "he-IL",
    id: "id-ID", ms: "ms-MY", th: "th-TH", vi: "vi-VN", uk: "uk-UA",
  };
  const bcp47 = langCode.includes("-") ? langCode : (bcp47Map[base] || langCode + "-" + langCode.toUpperCase());

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const prefs = loadVoicePrefs();
    const preferredName = prefs[langCode] || prefs[base] || prefs[bcp47];

    let voice: SpeechSynthesisVoice | null = null;

    // 1. User's saved preference
    if (preferredName) {
      voice = voices.find(v => v.name === preferredName) || null;
    }

    // 2. Auto-select best available (Neural > Premium > Standard > Basic)
    if (!voice) {
      voice = voices.find(v => v.lang === bcp47 && v.name.toLowerCase().includes("google"))
        || voices.find(v => v.lang === bcp47 && v.name.toLowerCase().includes("microsoft") && v.name.toLowerCase().includes("neural"))
        || voices.find(v => v.lang === bcp47 && v.name.toLowerCase().includes("microsoft"))
        || voices.find(v => v.lang === bcp47 && (v.name.toLowerCase().includes("premium") || v.name.toLowerCase().includes("enhanced")))
        || voices.find(v => v.lang === bcp47)
        || voices.find(v => v.lang.toLowerCase().startsWith(base) && v.name.toLowerCase().includes("google"))
        || voices.find(v => v.lang.toLowerCase().startsWith(base) && v.name.toLowerCase().includes("microsoft"))
        || voices.find(v => v.lang.toLowerCase().startsWith(base))
        || null;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = bcp47;
    utt.rate = opts?.rate ?? 0.85;
    utt.pitch = opts?.pitch ?? 1.0;
    if (voice) utt.voice = voice;
    if (opts?.onStart) opts.onStart();
    utt.onend = () => opts?.onEnd?.();
    utt.onerror = () => opts?.onEnd?.();
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      window.speechSynthesis.onvoiceschanged = null;
    };
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length > 0) {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      }
    }, 300);
  }
}

// ── VoiceSelector UI Component ────────────────────────────────────────────────
interface VoiceSelectorProps {
  langCode: string;
  langName: string;
  onClose?: () => void;
  compact?: boolean; // show as small inline button
}

export default function VoiceSelector({ langCode, langName, onClose, compact }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isOpen, setIsOpen] = useState(!compact);
  const [testing, setTesting] = useState(false);
  const [rate, setRate] = useState(0.85);

  const loadVoices = useCallback(() => {
    const available = getVoicesForLang(langCode);
    setVoices(available);
    const pref = getPreferredVoiceName(langCode);
    if (pref && available.find(v => v.name === pref)) {
      setSelectedVoice(pref);
    } else if (available.length > 0) {
      setSelectedVoice(available[0].name);
    }
  }, [langCode]);

  useEffect(() => {
    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, [loadVoices]);

  const handleSelect = (voiceName: string) => {
    setSelectedVoice(voiceName);
    saveVoicePref(langCode, voiceName);
  };

  const handleTest = () => {
    if (testing) { window.speechSynthesis.cancel(); setTesting(false); return; }
    setTesting(true);
    const testPhrases: Record<string, string> = {
      en: "Hello! My name is your language teacher. How are you today?",
      "en-US": "Hello! My name is your language teacher. How are you today?",
      "en-GB": "Hello! I'm your language teacher. How do you do?",
      fr: "Bonjour! Je suis votre professeur de langue. Comment allez-vous?",
      "fr-FR": "Bonjour! Je suis votre professeur de langue. Comment allez-vous?",
      es: "¡Hola! Soy tu profesor de idiomas. ¿Cómo estás hoy?",
      de: "Hallo! Ich bin dein Sprachlehrer. Wie geht es dir heute?",
      it: "Ciao! Sono il tuo insegnante di lingue. Come stai oggi?",
      pt: "Olá! Sou seu professor de idiomas. Como você está hoje?",
      "pt-BR": "Olá! Sou seu professor de idiomas. Como você está hoje?",
      ja: "こんにちは！私はあなたの語学の先生です。今日はお元気ですか？",
      zh: "你好！我是你的语言老师。你今天怎么样？",
      ko: "안녕하세요! 저는 여러분의 언어 선생님입니다. 오늘 어떠세요?",
      ru: "Привет! Я ваш учитель языка. Как вы сегодня?",
      ar: "مرحبا! أنا معلمك اللغوي. كيف حالك اليوم؟",
    };
    const base = langCode.split("-")[0];
    const phrase = testPhrases[langCode] || testPhrases[base] || `Hello in ${langName}!`;

    speakWithPreference(phrase, langCode, {
      rate,
      onEnd: () => setTesting(false),
    });
  };

  if (voices.length === 0) {
    // Still show the button but indicate no specific voice — browser will use default
    if (compact) {
      return (
        <button
          onClick={() => {
            const testPhrases: Record<string, string> = {
              en: "Hello!", fr: "Bonjour!", es: "Hola!", de: "Hallo!",
              it: "Ciao!", pt: "Olá!", ja: "こんにちは！", zh: "你好！",
              ko: "안녕하세요!", ru: "Привет!", ar: "مرحبا!",
            };
            const base = langCode.split("-")[0];
            const phrase = testPhrases[langCode] || testPhrases[base] || `Hello ${langName}!`;
            speakWithPreference(phrase, langCode, { rate });
          }}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
          title={`Voz padrão do sistema para ${langName}`}
        >
          <Volume2 className="w-3 h-3" />
          <span>Voz</span>
        </button>
      );
    }
    return (
      <div className="text-xs text-gray-400 flex items-center gap-1 p-2">
        <Volume2 className="w-3 h-3" />
        Voz padrão do sistema (instale vozes para {langName} no seu dispositivo)
      </div>
    );
  }

  if (compact) {
    const current = voices.find(v => v.name === selectedVoice);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white transition-colors"
          title="Selecionar voz"
        >
          <Settings className="w-3 h-3" />
          {current ? `${current.qualityLabel} ${current.name.split(" ")[0]}` : "Voz"}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-72 max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Vozes para {langName}</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
            {voices.map(v => (
              <button
                key={v.name}
                onClick={() => { handleSelect(v.name); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-800 transition-colors ${
                  selectedVoice === v.name ? "bg-indigo-900/40" : ""
                }`}
              >
                <div>
                  <div className="text-xs text-white font-medium">{v.name}</div>
                  <div className="text-xs text-gray-400">{v.lang} · {v.provider}</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{v.qualityLabel}</span>
                  {selectedVoice === v.name && <Check className="w-3 h-3 text-green-400" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            Vozes disponíveis — {langName}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{voices.length} voz(es) encontrada(s) neste dispositivo</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Voice list */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {voices.map(v => (
          <button
            key={v.name}
            onClick={() => handleSelect(v.name)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
              selectedVoice === v.name
                ? "bg-indigo-900/50 border-indigo-500/60 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
            }`}
          >
            <div>
              <div className="text-sm font-medium">{v.name}</div>
              <div className="text-xs text-gray-400">{v.lang} · {v.provider}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                v.quality === "neural" ? "bg-yellow-500/20 text-yellow-300" :
                v.quality === "premium" ? "bg-blue-500/20 text-blue-300" :
                v.quality === "standard" ? "bg-green-500/20 text-green-300" :
                "bg-gray-600/30 text-gray-400"
              }`}>
                {v.qualityLabel}
              </span>
              {selectedVoice === v.name && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      {/* Speed control */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Velocidade</span>
          <span className="text-xs text-white font-mono">{rate.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={rate}
          onChange={e => setRate(parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
          <span>Lento</span>
          <span>Normal (0.85x)</span>
          <span>Rápido</span>
        </div>
      </div>

      {/* Test button */}
      <button
        onClick={handleTest}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          testing
            ? "bg-red-600/30 border border-red-500/50 text-red-300"
            : "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/50"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        {testing ? "⏹ Parar" : "▶ Testar esta voz"}
      </button>

      {voices[0]?.quality === "basic" && (
        <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg p-2">
          💡 Para melhor qualidade: no Windows, instale vozes Microsoft Neural em Configurações → Hora e idioma → Fala. No Android, ative Google TTS nas configurações de acessibilidade.
        </p>
      )}
    </div>
  );
}
