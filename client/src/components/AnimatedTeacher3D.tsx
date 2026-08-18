import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface AnimatedTeacher3DProps {
  teacherName: string;
  text?: string;
  isTeaching?: boolean;
  avatar?: "male" | "female";
}

interface PhonemeDuration {
  phoneme: string;
  start: number;
  end: number;
}

// Mapeamento de phonemes para formas de boca
const MOUTH_SHAPES: Record<string, string> = {
  A: "M 40,55 Q 45,60 50,55 Q 55,60 60,55", // Boca aberta vertical
  E: "M 40,55 Q 45,57 50,55 Q 55,57 60,55", // Boca semi-aberta
  I: "M 40,55 L 60,55", // Boca fechada horizontal (sorriso)
  O: "M 40,55 Q 50,65 60,55", // Boca arredondada
  U: "M 42,55 Q 50,60 58,55", // Boca pequena arredondada
  B: "M 40,55 L 60,55", // Lábios fechados
  P: "M 40,55 L 60,55", // Lábios fechados
  M: "M 40,55 L 60,55", // Lábios fechados
  F: "M 40,55 Q 45,57 50,55 Q 55,57 60,55", // Dentes no lábio inferior
  V: "M 40,55 Q 45,57 50,55 Q 55,57 60,55", // Dentes no lábio inferior
  T: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Língua nos dentes
  D: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Língua nos dentes
  S: "M 40,55 L 60,55", // Dentes juntos
  Z: "M 40,55 L 60,55", // Dentes juntos
  L: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Língua no céu da boca
  R: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Língua vibrando
  N: "M 40,55 L 60,55", // Lábios fechados, nasal
  K: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Garganta
  G: "M 40,55 Q 45,58 50,55 Q 55,58 60,55", // Garganta
  NEUTRAL: "M 40,55 Q 50,57 60,55", // Boca relaxada
};

export function AnimatedTeacher3D({
  teacherName,
  text = "",
  isTeaching = false,
  avatar = "female",
}: AnimatedTeacher3DProps) {
  // Este avatar legado não possui um par audiovisual validado. Ele continua
  // disponível como ilustração, porém imóvel enquanto o áudio é reproduzido.
  const allowsSyntheticFacialMotion = false;
  const [currentMouth, setCurrentMouth] = useState(MOUTH_SHAPES.NEUTRAL);
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const animationRef = useRef<number | null>(null);
  const phonemesQuery = trpc.advancedTTS.getPhonemes.useQuery(
    { text, languageCode: "pt-BR" },
    { enabled: allowsSyntheticFacialMotion && isTeaching && text.length > 0 }
  );

  // Animação de piscar automática
  useEffect(() => {
    if (!allowsSyntheticFacialMotion) {
      setIsBlinking(false);
      return;
    }
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, [allowsSyntheticFacialMotion]);

  // Animação de movimento da cabeça
  useEffect(() => {
    if (!allowsSyntheticFacialMotion) {
      setHeadTilt(0);
      return;
    }
    const headInterval = setInterval(() => {
      setHeadTilt((prev) => (prev === 0 ? 1.5 : prev === 1.5 ? -1.5 : 0));
    }, 4000);

    return () => clearInterval(headInterval);
  }, [allowsSyntheticFacialMotion]);

  // Animação labial sincronizada
  useEffect(() => {
    if (!allowsSyntheticFacialMotion || !isTeaching || !phonemesQuery.data) {
      setCurrentMouth(MOUTH_SHAPES.NEUTRAL);
      return;
    }

    const { phonemeDurations } = phonemesQuery.data;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // segundos

      // Encontrar phoneme atual baseado no tempo
      const currentPhoneme = phonemeDurations.find(
        (p: PhonemeDuration) => elapsed >= p.start && elapsed < p.end
      );

      if (currentPhoneme) {
        const mouthShape = MOUTH_SHAPES[currentPhoneme.phoneme] || MOUTH_SHAPES.NEUTRAL;
        setCurrentMouth(mouthShape);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animação terminou
        setCurrentMouth(MOUTH_SHAPES.NEUTRAL);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [allowsSyntheticFacialMotion, isTeaching, phonemesQuery.data]);

  // Cores baseadas no avatar
  const skinTone = avatar === "female" ? "#f4c2a0" : "#d4a574";
  const hairColor = avatar === "female" ? "#3d2817" : "#1a1a1a";
  const lipColor = avatar === "female" ? "#c97064" : "#a85a52";

  return (
    <div className="flex flex-col items-center">
      <svg
        width="200"
        height="280"
        viewBox="0 0 100 140"
        className="transition-transform duration-300"
        style={{ transform: `rotate(${allowsSyntheticFacialMotion ? headTilt : 0}deg)` }}
      >
        {/* Pescoço */}
        <rect x="42" y="85" width="16" height="20" fill={skinTone} rx="3" />

        {/* Corpo (blazer) */}
        <path
          d="M 30,105 L 35,140 L 65,140 L 70,105 Z"
          fill="#2c3e50"
          stroke="#1a252f"
          strokeWidth="0.5"
        />
        
        {/* Camisa branca */}
        <path
          d="M 42,105 L 45,125 L 55,125 L 58,105 Z"
          fill="white"
        />

        {/* Cabeça */}
        <ellipse cx="50" cy="50" rx="22" ry="26" fill={skinTone} />

        {/* Orelhas */}
        <ellipse cx="28" cy="50" rx="4" ry="6" fill={skinTone} />
        <ellipse cx="72" cy="50" rx="4" ry="6" fill={skinTone} />

        {/* Cabelo */}
        <path
          d="M 28,35 Q 28,22 50,20 Q 72,22 72,35 L 72,45 Q 70,30 50,28 Q 30,30 28,45 Z"
          fill={hairColor}
        />

        {/* Sobrancelhas */}
        <path
          d="M 35,40 Q 40,38 45,40"
          stroke="#3d2817"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 55,40 Q 60,38 65,40"
          stroke="#3d2817"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Olhos */}
        <g>
          {/* Olho esquerdo */}
          <ellipse
            cx="40"
            cy="47"
            rx="5"
            ry={allowsSyntheticFacialMotion && isBlinking ? 0.5 : 5}
            fill="white"
            className="transition-all duration-150"
          />
          {(!allowsSyntheticFacialMotion || !isBlinking) && (
            <>
              <circle cx="40" cy="47" r="3" fill="#4a3728" />
              <circle cx="41" cy="46" r="1.5" fill="white" opacity="0.9" />
              <circle cx="39" cy="48" r="0.8" fill="white" opacity="0.6" />
            </>
          )}

          {/* Olho direito */}
          <ellipse
            cx="60"
            cy="47"
            rx="5"
            ry={allowsSyntheticFacialMotion && isBlinking ? 0.5 : 5}
            fill="white"
            className="transition-all duration-150"
          />
          {(!allowsSyntheticFacialMotion || !isBlinking) && (
            <>
              <circle cx="60" cy="47" r="3" fill="#4a3728" />
              <circle cx="61" cy="46" r="1.5" fill="white" opacity="0.9" />
              <circle cx="59" cy="48" r="0.8" fill="white" opacity="0.6" />
            </>
          )}
        </g>

        {/* Nariz */}
        <path
          d="M 50,50 L 48,58 Q 50,60 52,58 Z"
          fill={skinTone}
          stroke="#d4a574"
          strokeWidth="0.5"
          opacity="0.8"
        />

        {/* Boca animada */}
        <path
          d={allowsSyntheticFacialMotion ? currentMouth : MOUTH_SHAPES.NEUTRAL}
          stroke={lipColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-100"
        />

        {/* Rubor nas bochechas */}
        <ellipse cx="35" cy="58" rx="5" ry="3" fill="#ff9999" opacity="0.3" />
        <ellipse cx="65" cy="58" rx="5" ry="3" fill="#ff9999" opacity="0.3" />

        {/* Sombras para profundidade */}
        <ellipse cx="50" cy="72" rx="18" ry="4" fill="black" opacity="0.1" />
      </svg>

      {/* Nome do professor */}
      <div className="mt-2 text-center">
        <p className="font-semibold text-gray-800">{teacherName}</p>
        <p className="text-xs text-gray-500">Professor(a) Virtual</p>
      </div>

      {/* Indicador de fala */}
      {isTeaching && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">Falando...</span>
        </div>
      )}
    </div>
  );
}
