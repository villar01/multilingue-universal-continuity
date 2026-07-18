/**
 * Avatar 3D Animado com Movimento Labial Natural
 * SVG overlay integrado ao rosto — sem barras ou círculos externos
 */

import { useEffect, useRef, useState } from "react";
import { useTTSVisemeSync } from "../lib/tts-viseme-sync";

// Mapeamento de letras para abertura de boca
function charToOpenness(char: string): number {
  const c = char.toLowerCase();
  if ("aáàãâä".includes(c)) return 0.85;
  if ("eéèê".includes(c)) return 0.55;
  if ("oóòõô".includes(c)) return 0.75;
  if ("iíì".includes(c)) return 0.40;
  if ("uúù".includes(c)) return 0.50;
  if (" ,.".includes(c)) return 0.0;
  return 0.25;
}

interface Animated3DAvatarProps {
  teacherId: number;
  isTeaching: boolean;
  currentText: string;
  emotion?: "neutral" | "happy" | "encouraging" | "thinking";
  audioUrl?: string;
}

// Mapeamento de professores para avatares 8K CDN
const TEACHER_AVATARS = {
  1: "https://manus-user-assets.s3.us-west-1.amazonaws.com/1738726382639-teacher-ricardo-8k.png",
  2: "https://manus-user-assets.s3.us-west-1.amazonaws.com/1738726382639-teacher-camila-8k.png",
  3: "https://manus-user-assets.s3.us-west-1.amazonaws.com/1738726382639-teacher-joao-8k.png",
  4: "https://manus-user-assets.s3.us-west-1.amazonaws.com/1738726382639-teacher-maria-8k.png",
  5: "https://manus-user-assets.s3.us-west-1.amazonaws.com/1738726382639-teacher-miguel-8k.png",
};

export function Animated3DAvatar({
  teacherId,
  isTeaching,
  currentText,
  emotion = "neutral",
  audioUrl,
}: Animated3DAvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charIndexRef = useRef(0);

  // Hook de sincronização TTS com visemas (mantido para compatibilidade)
  const ttsSync = useTTSVisemeSync((_viseme: any) => {});

  const avatarUrl = TEACHER_AVATARS[teacherId as keyof typeof TEACHER_AVATARS] || TEACHER_AVATARS[1];

  // Animação labial baseada no texto
  useEffect(() => {
    if (!isTeaching || !currentText) {
      setMouthOpen(0);
      if (animRef.current) clearInterval(animRef.current);
      return;
    }
    charIndexRef.current = 0;
    const chars = currentText.split("");
    animRef.current = setInterval(() => {
      if (charIndexRef.current >= chars.length) charIndexRef.current = 0;
      const openness = charToOpenness(chars[charIndexRef.current]);
      setMouthOpen(openness + Math.random() * 0.1);
      charIndexRef.current++;
    }, 75);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isTeaching, currentText]);

  // Dimensões do avatar (quadrado)
  const sz = 200;
  // Posição da boca: 69% da altura, centralizada
  const mx = sz * 0.50;
  const my = sz * 0.69;
  const mw = sz * 0.11; // meia-largura da boca
  const mh = sz * 0.045 * mouthOpen; // altura varia com abertura

  return (
    <div className="relative mx-auto" style={{ width: sz, height: sz }}>
      {/* Foto base do professor */}
      <img
        src={avatarUrl}
        alt="Professor"
        className="w-full h-full rounded-full object-cover shadow-2xl"
        style={{ filter: isTeaching ? "brightness(1.04)" : "brightness(1)", transition: "filter 0.3s" }}
      />

      {/* SVG overlay de boca natural — apenas quando falando */}
      {isTeaching && mouthOpen > 0.05 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${sz} ${sz}`}
          style={{ borderRadius: "50%" }}
        >
          <defs>
            <filter id="lip-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>
          {/* Interior escuro da boca (abertura) */}
          <ellipse
            cx={mx}
            cy={my + mh * 0.3}
            rx={mw * 0.85}
            ry={Math.max(mh * 0.7, 0.5)}
            fill="rgba(15,5,5,0.60)"
            filter="url(#lip-blur)"
          />
          {/* Lábio inferior — curva suave */}
          <path
            d={`M ${mx - mw} ${my} Q ${mx} ${my + mh * 1.8} ${mx + mw} ${my}`}
            fill="rgba(185,90,80,0.75)"
            filter="url(#lip-blur)"
          />
          {/* Lábio superior — arco de Cupído */}
          <path
            d={`M ${mx - mw} ${my}
               Q ${mx - mw*0.45} ${my - mh*1.2} ${mx} ${my - mh*0.3}
               Q ${mx + mw*0.45} ${my - mh*1.2} ${mx + mw} ${my}`}
            fill="rgba(165,65,58,0.70)"
            filter="url(#lip-blur)"
          />
        </svg>
      )}

      {/* Indicador de fala — 3 barrinhas discretas no canto inferior */}
      {isTeaching && (
        <div className="absolute bottom-2 right-3 flex gap-0.5 items-end">
          {[0.6, 1.0, 0.7].map((h, i) => (
            <div
              key={i}
              className="rounded-full bg-indigo-400/80"
              style={{
                width: 3,
                height: 4 + mouthOpen * 10 * h,
                transition: "height 0.07s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
