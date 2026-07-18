import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface VirtualTeacherProps {
  text: string;
  audioUrl?: string;
  expression?: "neutral" | "happy" | "thinking" | "excited" | "encouraging";
  onComplete?: () => void;
  avatarType?: "teacher1" | "teacher2" | "teacher3" | "teacher4";
  voiceLanguageCode?: string;
  voiceGender?: "MALE" | "FEMALE" | "NEUTRAL";
}

// Definições dos 4 avatares
const AVATAR_CONFIGS = {
  teacher1: {
    name: "Prof. Ana",
    skin: "#FFD4A3",
    hair: "#4A3728",
    eyes: "#2C5F7C",
    mouth: "#FF6B9D",
    clothes: "#4A90E2",
    gender: "female"
  },
  teacher2: {
    name: "Prof. Carlos",
    skin: "#D4A574",
    hair: "#1A1A1A",
    eyes: "#3D2817",
    mouth: "#E85D75",
    clothes: "#2ECC71",
    gender: "male"
  },
  teacher3: {
    name: "Prof. Yuki",
    skin: "#FFECD1",
    hair: "#2C1810",
    eyes: "#1C1C1C",
    mouth: "#FF8BA7",
    clothes: "#9B59B6",
    gender: "female"
  },
  teacher4: {
    name: "Prof. Ahmed",
    skin: "#8D5524",
    hair: "#0F0F0F",
    eyes: "#2C1810",
    mouth: "#C44569",
    clothes: "#E67E22",
    gender: "male"
  }
};

export default function VirtualTeacher({
  text,
  audioUrl,
  expression = "neutral",
  onComplete,
  avatarType = "teacher1"
}: VirtualTeacherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0);

  const colors = AVATAR_CONFIGS[avatarType];

  // Desenhar avatar no canvas
  const drawAvatar = (ctx: CanvasRenderingContext2D, mouthOpenness: number) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Corpo (ombros)
    ctx.fillStyle = colors.clothes;
    ctx.beginPath();
    ctx.ellipse(centerX, height - 40, 120, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pescoço
    ctx.fillStyle = colors.skin;
    ctx.fillRect(centerX - 20, centerY + 60, 40, 40);

    // Cabeça
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo (diferente para cada avatar)
    ctx.fillStyle = colors.hair;
    ctx.beginPath();
    if (colors.gender === "female") {
      // Cabelo longo para feminino
      ctx.arc(centerX, centerY - 20, 85, Math.PI, Math.PI * 2);
      ctx.fill();
      // Mechas laterais
      ctx.ellipse(centerX - 70, centerY + 20, 25, 50, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 70, centerY + 20, 25, 50, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cabelo curto para masculino
      ctx.arc(centerX, centerY - 20, 85, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // Olhos
    const eyeY = centerY - 10;
    const eyeSpacing = 30;

    // Olho esquerdo
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing, eyeY, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupila esquerda
    ctx.fillStyle = colors.eyes;
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Olho direito
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(centerX + eyeSpacing, eyeY, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupila direita
    ctx.fillStyle = colors.eyes;
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Expressões
    if (expression === "happy" || expression === "excited") {
      // Sobrancelhas levantadas
      ctx.strokeStyle = colors.hair;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX - eyeSpacing, eyeY - 25, 15, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + eyeSpacing, eyeY - 25, 15, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.stroke();
    } else if (expression === "thinking") {
      // Sobrancelhas franzidas
      ctx.strokeStyle = colors.hair;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing - 15, eyeY - 20);
      ctx.lineTo(centerX - eyeSpacing + 15, eyeY - 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + eyeSpacing + 15, eyeY - 20);
      ctx.lineTo(centerX + eyeSpacing - 15, eyeY - 25);
      ctx.stroke();
    }

    // Nariz
    ctx.strokeStyle = colors.skin;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, eyeY + 15);
    ctx.lineTo(centerX - 5, eyeY + 30);
    ctx.stroke();

    // Boca com sincronização labial
    const mouthY = centerY + 40;
    const mouthWidth = 40;
    const mouthHeight = 5 + mouthOpenness * 20;

    ctx.fillStyle = colors.mouth;
    ctx.beginPath();

    if (expression === "happy" || expression === "excited") {
      // Sorriso
      ctx.arc(centerX, mouthY - 5, mouthWidth / 2, 0, Math.PI);
    } else if (expression === "thinking") {
      // Boca reta pensativa
      ctx.ellipse(centerX, mouthY, mouthWidth / 2, 3, 0, 0, Math.PI * 2);
    } else {
      // Boca neutra/falando
      ctx.ellipse(centerX, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
    }

    ctx.fill();

    // Língua quando boca aberta
    if (mouthOpenness > 0.3) {
      ctx.fillStyle = "#FF9999";
      ctx.beginPath();
      ctx.ellipse(centerX, mouthY + 5, mouthWidth / 3, mouthHeight / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Animação de sincronização labial
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (isPlaying) {
        // Simular movimento labial baseado no áudio
        const newMouthOpen = Math.random() * 0.8 + 0.2;
        setMouthOpen(newMouthOpen);
      } else {
        setMouthOpen(0);
      }

      drawAvatar(ctx, mouthOpen);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, mouthOpen, expression, avatarType]);

  // Controle de áudio
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-col items-center gap-4">
        {/* Canvas do Avatar */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={350}
            className="rounded-lg shadow-lg bg-white"
          />
          
          {/* Nome do professor */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md">
            <span className="text-sm font-semibold text-gray-700">{colors.name}</span>
          </div>
        </div>

        {/* Balão de fala */}
        {text && (
          <div className="relative bg-white p-4 rounded-2xl shadow-lg max-w-md">
            {/* Triângulo do balão */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
            
            <p className="text-gray-800 text-center leading-relaxed">{text}</p>
          </div>
        )}

        {/* Controles de áudio */}
        {audioUrl && (
          <div className="flex gap-2">
            <Button
              onClick={handlePlay}
              variant={isPlaying ? "default" : "outline"}
              size="lg"
              className="gap-2"
            >
              <Volume2 className="w-5 h-5" />
              {isPlaying ? "Pausar" : "Ouvir"}
            </Button>

            <Button
              onClick={toggleMute}
              variant="outline"
              size="lg"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        )}

        {/* Áudio oculto */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            preload="auto"
          />
        )}
      </div>
    </Card>
  );
}
