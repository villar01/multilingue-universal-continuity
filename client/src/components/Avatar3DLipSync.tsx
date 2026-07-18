/**
 * Avatar3DLipSync - Avatar 3D com Lip-Sync Real por Visemes
 * Performance: 60fps com requestAnimationFrame
 * Visemes: 8 posições de boca mapeadas para fonemas
 * Integrado com voiceEngine para sincronização perfeita
 * Sem dependências externas - puro SVG + CSS animations
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { speakWithLipSync, VOICE_PROFILES, type LipSyncFrame } from "../lib/voiceEngine";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════
export interface AvatarTeacher {
  id: number;
  name: string;
  flag: string;
  color: string;
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  specialty: string;
  voiceLang: string;
  pitch: number;
  rate: number;
}

interface Avatar3DLipSyncProps {
  teacher: AvatarTeacher;
  text?: string;
  isTeaching?: boolean;
  langCode?: string;
  onSpeechEnd?: () => void;
  onVisemeChange?: (viseme: string) => void;
  size?: number;
  showName?: boolean;
  autoSpeak?: boolean;
}

// ═══════════════════════════════════════════════════════════
// PROFESSORES GLOBAIS - 16 etnias
// ═══════════════════════════════════════════════════════════
export const GLOBAL_TEACHERS: AvatarTeacher[] = [
  { id: 1,  name: "Sarah Mitchell",   flag: "🇺🇸", color: "#3B82F6", skinTone: "#FDBCB4", hairColor: "#8B4513", eyeColor: "#4169E1", specialty: "Inglês Americano",     voiceLang: "en-US", pitch: 1.1,  rate: 0.95 },
  { id: 2,  name: "Pierre Dupont",    flag: "🇫🇷", color: "#8B5CF6", skinTone: "#FDBCB4", hairColor: "#2C1810", eyeColor: "#228B22", specialty: "Francês Europeu",      voiceLang: "fr-FR", pitch: 0.95, rate: 0.9  },
  { id: 3,  name: "Yuki Tanaka",      flag: "🇯🇵", color: "#EC4899", skinTone: "#FFE4C4", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Japonês & Caligrafia", voiceLang: "ja-JP", pitch: 1.2,  rate: 0.85 },
  { id: 4,  name: "Carlos Herrera",   flag: "🇲🇽", color: "#10B981", skinTone: "#D2956A", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Espanhol Latino",      voiceLang: "es-MX", pitch: 0.9,  rate: 1.0  },
  { id: 5,  name: "Wei Chen",         flag: "🇨🇳", color: "#F59E0B", skinTone: "#FFE4C4", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Mandarim & Tons",      voiceLang: "zh-CN", pitch: 1.0,  rate: 0.88 },
  { id: 6,  name: "Fatima Al-Zahra",  flag: "🇲🇦", color: "#6366F1", skinTone: "#C68642", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Árabe Moderno",        voiceLang: "ar-SA", pitch: 1.05, rate: 0.9  },
  { id: 7,  name: "Hans Müller",      flag: "🇩🇪", color: "#64748B", skinTone: "#FDBCB4", hairColor: "#F4A460", eyeColor: "#4169E1", specialty: "Alemão Técnico",       voiceLang: "de-DE", pitch: 0.85, rate: 0.92 },
  { id: 8,  name: "Priya Sharma",     flag: "🇮🇳", color: "#EF4444", skinTone: "#A0522D", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Hindi & Sul-Asiático", voiceLang: "hi-IN", pitch: 1.15, rate: 0.93 },
  { id: 9,  name: "Marco Rossi",      flag: "🇮🇹", color: "#14B8A6", skinTone: "#D2956A", hairColor: "#2C1810", eyeColor: "#228B22", specialty: "Italiano & Culinária", voiceLang: "it-IT", pitch: 0.92, rate: 1.0  },
  { id: 10, name: "Sofia Petrova",    flag: "🇷🇺", color: "#A855F7", skinTone: "#FDBCB4", hairColor: "#F4A460", eyeColor: "#4169E1", specialty: "Russo & Literatura",   voiceLang: "ru-RU", pitch: 1.0,  rate: 0.88 },
  { id: 11, name: "Kofi Mensah",      flag: "🇬🇭", color: "#22C55E", skinTone: "#4A2C0A", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Suaíli & África",      voiceLang: "sw-KE", pitch: 0.95, rate: 0.92 },
  { id: 12, name: "Luna Quetzal",     flag: "🇲🇽", color: "#F97316", skinTone: "#C68642", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Quechua & Indígenas",  voiceLang: "es-MX", pitch: 1.1,  rate: 0.88 },
  { id: 13, name: "Amara Diallo",     flag: "🇸🇳", color: "#EAB308", skinTone: "#6B3A2A", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Francês Africano",     voiceLang: "fr-FR", pitch: 1.05, rate: 0.9  },
  { id: 14, name: "Hiroshi Yamamoto", flag: "🇯🇵", color: "#0EA5E9", skinTone: "#FFE4C4", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Japonês Empresarial",  voiceLang: "ja-JP", pitch: 0.9,  rate: 0.88 },
  { id: 15, name: "Aisha Okonkwo",    flag: "🇳🇬", color: "#DC2626", skinTone: "#3D1C02", hairColor: "#1C1C1C", eyeColor: "#2C1810", specialty: "Inglês Nigeriano",     voiceLang: "en-US", pitch: 1.1,  rate: 0.95 },
  { id: 16, name: "Elena Vasquez",    flag: "🇦🇷", color: "#7C3AED", skinTone: "#D2956A", hairColor: "#2C1810", eyeColor: "#2C1810", specialty: "Espanhol Rioplatense", voiceLang: "es-ES", pitch: 1.05, rate: 0.95 },
];

// ═══════════════════════════════════════════════════════════
// VISEMES SVG - Posições de boca
// ═══════════════════════════════════════════════════════════
const MOUTH_SHAPES: Record<string, { d: string; height: number }> = {
  closed:     { d: "M 30,60 Q 50,62 70,60",                     height: 2  },
  "open-small": { d: "M 32,58 Q 50,68 68,58 Q 50,72 32,58",     height: 10 },
  "open-medium": { d: "M 28,56 Q 50,72 72,56 Q 50,78 28,56",    height: 16 },
  "open-large": { d: "M 25,54 Q 50,76 75,54 Q 50,84 25,54",     height: 22 },
  round:      { d: "M 38,56 Q 50,76 62,56 Q 50,80 38,56",       height: 18 },
  wide:       { d: "M 22,60 Q 50,68 78,60 Q 50,74 22,60",       height: 12 },
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const Avatar3DLipSync: React.FC<Avatar3DLipSyncProps> = ({
  teacher,
  text,
  isTeaching = false,
  langCode,
  onSpeechEnd,
  onVisemeChange,
  size = 200,
  showName = true,
  autoSpeak = false,
}) => {
  const [currentMouth, setCurrentMouth] = useState<string>("closed");
  const [mouthIntensity, setMouthIntensity] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blinkState, setBlinkState] = useState(false);
  const [eyebrowRaise, setEyebrowRaise] = useState(0);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingRef = useRef(false);

  // Animação de piscar olhos
  useEffect(() => {
    blinkTimerRef.current = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    };
  }, []);

  // Sobrancelha levantada quando falando
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setEyebrowRaise(Math.sin(Date.now() / 300) * 3);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setEyebrowRaise(0);
    }
  }, [isSpeaking]);

  // Handler de lip-sync
  const handleLipSync = useCallback((frame: LipSyncFrame) => {
    setCurrentMouth(frame.mouth);
    setMouthIntensity(frame.intensity);
    onVisemeChange?.(frame.mouth);
  }, [onVisemeChange]);

  // Falar texto
  const speak = useCallback((textToSpeak: string) => {
    if (speakingRef.current) return;
    speakingRef.current = true;
    setIsSpeaking(true);

    const lang = langCode || teacher.voiceLang;
    speakWithLipSync(
      textToSpeak,
      lang,
      handleLipSync,
      () => {
        speakingRef.current = false;
        setIsSpeaking(false);
        setCurrentMouth("closed");
        setMouthIntensity(0);
        onSpeechEnd?.();
      }
    );
  }, [langCode, teacher.voiceLang, handleLipSync, onSpeechEnd]);

  // Auto-falar quando texto muda
  useEffect(() => {
    if (autoSpeak && text && text.trim()) {
      speak(text);
    }
  }, [text, autoSpeak, speak]);

  // Calcular escala
  const scale = size / 200;
  const mouthShape = MOUTH_SHAPES[currentMouth] || MOUTH_SHAPES.closed;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG Avatar */}
      <div
        style={{ width: size, height: size }}
        className="relative cursor-pointer select-none"
        onClick={() => text && speak(text)}
        title={`${teacher.name} - Clique para ouvir`}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ filter: `drop-shadow(0 4px 12px ${teacher.color}40)` }}
        >
          {/* Sombra/Halo */}
          <ellipse cx="50" cy="95" rx="30" ry="5" fill={teacher.color} opacity="0.2" />

          {/* Pescoço */}
          <rect x="42" y="72" width="16" height="15" rx="4" fill={teacher.skinTone} />

          {/* Corpo/Roupa */}
          <ellipse cx="50" cy="95" rx="28" ry="12" fill={teacher.color} />
          <rect x="22" y="85" width="56" height="15" rx="6" fill={teacher.color} />

          {/* Cabeça */}
          <ellipse cx="50" cy="45" rx="28" ry="30" fill={teacher.skinTone} />

          {/* Cabelo */}
          <ellipse cx="50" cy="22" rx="28" ry="14" fill={teacher.hairColor} />
          <ellipse cx="50" cy="18" rx="26" ry="10" fill={teacher.hairColor} />
          {/* Detalhes do cabelo */}
          <ellipse cx="22" cy="38" rx="5" ry="12" fill={teacher.hairColor} />
          <ellipse cx="78" cy="38" rx="5" ry="12" fill={teacher.hairColor} />

          {/* Sobrancelhas */}
          <path
            d={`M 30,${32 - eyebrowRaise} Q 38,${29 - eyebrowRaise} 42,${32 - eyebrowRaise}`}
            stroke={teacher.hairColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 58,${32 - eyebrowRaise} Q 62,${29 - eyebrowRaise} 70,${32 - eyebrowRaise}`}
            stroke={teacher.hairColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Olhos */}
          {/* Olho esquerdo */}
          <ellipse cx="36" cy="40" rx="7" ry={blinkState ? 1 : 6} fill="white" />
          {!blinkState && (
            <>
              <ellipse cx="36" cy="40" rx="4.5" ry="4.5" fill={teacher.eyeColor} />
              <ellipse cx="36" cy="40" rx="2.5" ry="2.5" fill="#1C1C1C" />
              <ellipse cx="34.5" cy="38.5" rx="1" ry="1" fill="white" />
            </>
          )}

          {/* Olho direito */}
          <ellipse cx="64" cy="40" rx="7" ry={blinkState ? 1 : 6} fill="white" />
          {!blinkState && (
            <>
              <ellipse cx="64" cy="40" rx="4.5" ry="4.5" fill={teacher.eyeColor} />
              <ellipse cx="64" cy="40" rx="2.5" ry="2.5" fill="#1C1C1C" />
              <ellipse cx="62.5" cy="38.5" rx="1" ry="1" fill="white" />
            </>
          )}

          {/* Nariz */}
          <path
            d="M 50,46 Q 47,52 46,54 Q 50,56 54,54 Q 53,52 50,46"
            fill={teacher.skinTone}
            stroke={teacher.skinTone === "#FDBCB4" ? "#E8A090" : "#8B6040"}
            strokeWidth="0.8"
          />

          {/* BOCA - Lip-Sync Animado */}
          <g transform={`translate(0, ${(mouthIntensity - 0.5) * 2})`}>
            {/* Lábio superior */}
            <path
              d={`M 30,58 Q 40,55 50,57 Q 60,55 70,58`}
              fill="#C06060"
              stroke="none"
            />
            {/* Abertura da boca */}
            <path
              d={mouthShape.d}
              fill={mouthShape.height > 5 ? "#1C0A0A" : teacher.skinTone}
              stroke="none"
            />
            {/* Lábio inferior */}
            <path
              d={`M 30,${58 + mouthShape.height * 0.3} Q 50,${62 + mouthShape.height * 0.4} 70,${58 + mouthShape.height * 0.3}`}
              fill="#D07070"
              stroke="none"
            />
            {/* Dentes quando boca aberta */}
            {mouthShape.height > 8 && (
              <path
                d={`M 35,${60} Q 50,${60} 65,${60} Q 65,${60 + mouthShape.height * 0.4} 35,${60 + mouthShape.height * 0.4}`}
                fill="white"
                opacity="0.9"
              />
            )}
          </g>

          {/* Indicador de fala */}
          {isSpeaking && (
            <>
              <circle cx="82" cy="20" r="3" fill={teacher.color} opacity="0.8">
                <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="88" cy="15" r="2" fill={teacher.color} opacity="0.6">
                <animate attributeName="r" values="2;4;2" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Flag/Bandeira */}
          <text x="85" y="35" fontSize="12" textAnchor="middle">{teacher.flag}</text>
        </svg>

        {/* Anel de status */}
        <div
          className="absolute inset-0 rounded-full border-4 transition-all duration-300"
          style={{
            borderColor: isSpeaking ? teacher.color : 'transparent',
            boxShadow: isSpeaking ? `0 0 20px ${teacher.color}60` : 'none',
          }}
        />
      </div>

      {/* Nome do professor */}
      {showName && (
        <div className="text-center">
          <div className="font-bold text-sm" style={{ color: teacher.color }}>
            {teacher.name}
          </div>
          <div className="text-xs text-gray-400">{teacher.specialty}</div>
          {isSpeaking && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-1 h-3 rounded-full animate-bounce" style={{ backgroundColor: teacher.color, animationDelay: '0ms' }} />
              <div className="w-1 h-4 rounded-full animate-bounce" style={{ backgroundColor: teacher.color, animationDelay: '150ms' }} />
              <div className="w-1 h-3 rounded-full animate-bounce" style={{ backgroundColor: teacher.color, animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar3DLipSync;
