import { useState, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";

interface RealTeacherAvatarProps {
  teacherId?: number;
  teacherName: string;
  isTeaching?: boolean;
  currentPhoneme?: string;
  expression?: "neutral" | "happy" | "thinking" | "surprised" | "encouraging";
}

// Banco de avatares 3D fotorrealistas profissionais
const TEACHER_AVATARS = [
  {
    id: 1,
    name: "Prof. Ricardo",
    gender: "male",
    ethnicity: "brazilian",
    region: "paulista",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/ZmgWwRdtURIwQTqH.png",
    specialty: "Português Brasileiro (Paulista)",
    voiceId: "Vxjl8FZXY0HXoWbCjmJ5",
  },
  {
    id: 2,
    name: "Prof. Camila",
    gender: "female",
    ethnicity: "brazilian",
    region: "carioca",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/oxgmSFfaibtBXjkp.png",
    specialty: "Português Brasileiro (Carioca)",
    voiceId: "jsCqWAovK2LkecY7zXl4",
  },
  {
    id: 3,
    name: "Prof. João",
    gender: "male",
    ethnicity: "brazilian",
    region: "nordestino",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/klRzEtbfOwHcvRhd.png",
    specialty: "Português Brasileiro (Nordestino)",
    voiceId: "GBv7mTt0atIp3Br8iCZE",
  },
  {
    id: 4,
    name: "Prof. Maria",
    gender: "female",
    ethnicity: "brazilian",
    region: "nordestino",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/sbdYtbNyErfksAKT.png",
    specialty: "Português Brasileiro (Nordestino)",
    voiceId: "ThT5KcBeYPX3keUQqHPh",
  },
  {
    id: 5,
    name: "Prof. Miguel",
    gender: "male",
    ethnicity: "portuguese",
    region: "lisboa",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/zOkeiNVOpeBxahuE.png",
    specialty: "Português Europeu (Lisboa)",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
  },
];

export default function RealTeacherAvatar({
  teacherId = 1,
  teacherName,
  isTeaching = false,
  currentPhoneme,
  expression = "neutral",
}: RealTeacherAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const teacher = TEACHER_AVATARS.find(t => t.id === teacherId) || TEACHER_AVATARS[0];

  // Piscar automático natural (a cada 3-5 segundos)
  useEffect(() => {
    const startBlinking = () => {
      blinkIntervalRef.current = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, 3000 + Math.random() * 2000);
    };

    startBlinking();

    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    };
  }, []);

  // Movimento sutil da cabeça durante ensino
  useEffect(() => {
    if (isTeaching) {
      const interval = setInterval(() => {
        setHeadTilt(Math.sin(Date.now() / 1000) * 2); // ±2 graus
      }, 50);

      return () => clearInterval(interval);
    } else {
      setHeadTilt(0);
    }
  }, [isTeaching]);

  // Sincronização labial baseada em phonemes
  useEffect(() => {
    if (!currentPhoneme || !isTeaching) {
      setMouthOpenness(0);
      return;
    }

    // Mapeamento de phonemes para abertura da boca (0-100%)
    const phonemeOpenness: Record<string, number> = {
      A: 80,
      E: 60,
      I: 40,
      O: 70,
      U: 50,
      B: 20,
      P: 20,
      M: 15,
      F: 30,
      V: 30,
      T: 25,
      D: 25,
      S: 35,
      Z: 35,
      L: 40,
      R: 45,
      N: 30,
      K: 50,
      G: 50,
      NEUTRAL: 0,
    };

    const openness = phonemeOpenness[currentPhoneme] || 0;
    setMouthOpenness(openness);
  }, [currentPhoneme, isTeaching]);

  // Expressões faciais
  const getExpressionStyles = () => {
    switch (expression) {
      case "happy":
        return "brightness-110 contrast-105";
      case "thinking":
        return "brightness-95 saturate-90";
      case "surprised":
        return "brightness-115 contrast-110";
      case "encouraging":
        return "brightness-105 saturate-110";
      default:
        return "brightness-100";
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Avatar Container */}
      <div className="relative">
        {/* Avatar Principal */}
        <div
          className="relative w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white transition-all duration-200"
          style={{
            transform: `rotate(${headTilt}deg) scale(${isTeaching ? 1.02 : 1})`,
          }}
        >
          <img
            src={teacher.imageUrl}
            alt={teacher.name}
            className={`w-full h-full object-cover transition-all duration-300 ${getExpressionStyles()}`}
          />

          {/* Overlay de Piscar */}
          {isBlinking && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent animate-blink" />
          )}

          {/* Overlay de Boca (Lip-Sync) */}
          {isTeaching && mouthOpenness > 0 && (
            <div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/20 rounded-full transition-all duration-75"
              style={{
                width: `${20 + mouthOpenness * 0.3}px`,
                height: `${10 + mouthOpenness * 0.2}px`,
              }}
            />
          )}

          {/* Indicador de Fala */}
          {isTeaching && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2 animate-pulse">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Anel de Atividade */}
        {isTeaching && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
        )}
      </div>

      {/* Informações do Professor */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
        <p className="text-sm text-gray-600">{teacher.specialty}</p>
        {isTeaching && (
          <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-semibold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Ensinando agora
          </div>
        )}
      </div>

      {/* Badge de Expressão */}
      {expression !== "neutral" && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {expression === "happy" && "😊"}
          {expression === "thinking" && "🤔"}
          {expression === "surprised" && "😮"}
          {expression === "encouraging" && "👏"}
        </div>
      )}
    </div>
  );
}

// Hook para usar TTS com lip-sync automático
export function useTeacherSpeech(teacherRef: React.RefObject<HTMLDivElement>) {
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentPhoneme, setCurrentPhoneme] = useState<string>("NEUTRAL");

  const speak = async (text: string, languageCode: string = "pt-BR") => {
    setIsTeaching(true);

    // Extrair phonemes do texto
    const phonemes = extractPhonemes(text);

    // Edge TTS Neural para voz natural
    stopEdgeTTS();

    // Sincronizar phonemes com fala
    const phonemeDuration = (text.length * 50) / phonemes.length; // ms por phoneme

    let phonemeIndex = 0;
    const phonemeInterval = setInterval(() => {
      if (phonemeIndex < phonemes.length) {
        setCurrentPhoneme(phonemes[phonemeIndex]);
        phonemeIndex++;
      } else {
        clearInterval(phonemeInterval);
        setCurrentPhoneme("NEUTRAL");
        setIsTeaching(false);
      }
    }, phonemeDuration);

    speakNaturalVoice(text, languageCode, {
      rate: 0.9,
      onEnd: () => {
        clearInterval(phonemeInterval);
        setCurrentPhoneme("NEUTRAL");
        setIsTeaching(false);
      },
    });
  };

  const stop = () => {
    stopEdgeTTS();
    setIsTeaching(false);
    setCurrentPhoneme("NEUTRAL");
  };

  return { isTeaching, currentPhoneme, speak, stop };
}

// Função auxiliar para extrair phonemes
function extractPhonemes(text: string): string[] {
  const phonemeMap: Record<string, string> = {
    a: "A",
    e: "E",
    i: "I",
    o: "O",
    u: "U",
    b: "B",
    p: "P",
    m: "M",
    f: "F",
    v: "V",
    t: "T",
    d: "D",
    s: "S",
    z: "Z",
    l: "L",
    r: "R",
    n: "N",
    k: "K",
    g: "G",
  };

  const phonemes: string[] = [];
  const normalizedText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ]/g, "");

  for (const char of normalizedText) {
    const phoneme = phonemeMap[char] || "NEUTRAL";
    phonemes.push(phoneme);
  }

  return phonemes;
}
