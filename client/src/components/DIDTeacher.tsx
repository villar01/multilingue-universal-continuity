/**
 * DIDTeacher — Componente de Professor Animado com D-ID API
 * Foto real + texto → vídeo animado com lip-sync perfeito
 * Fallback: Web Speech API com animação CSS quando D-ID indisponível
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Volume2, Loader2, RefreshCw, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";

interface DIDTeacherProps {
  teacherId?: number;
  teacherName?: string;
  teacherPhotoUrl?: string;
  languageCode?: string;
  voiceId?: string;
  text?: string;
  autoPlay?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showControls?: boolean;
  onSpeakEnd?: () => void;
  className?: string;
}

const SIZES = {
  sm: { container: "w-32 h-40", video: "w-32 h-32", photo: "w-32 h-32" },
  md: { container: "w-48 h-60", video: "w-48 h-48", photo: "w-48 h-48" },
  lg: { container: "w-64 h-80", video: "w-64 h-64", photo: "w-64 h-64" },
  xl: { container: "w-80 h-96", video: "w-80 h-80", photo: "w-80 h-80" },
};

export function DIDTeacher({
  teacherId,
  teacherName = "Professor",
  teacherPhotoUrl,
  languageCode = "en-US",
  voiceId,
  text,
  autoPlay = false,
  size = "md",
  showControls = true,
  onSpeakEnd,
  className = "",
}: DIDTeacherProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [didAvailable, setDidAvailable] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const sizes = SIZES[size];

  // Verificar se D-ID está disponível
  const healthCheck = trpc.livePortrait.healthCheck.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (healthCheck.data !== undefined) {
      setDidAvailable(healthCheck.data.isHealthy);
      if (!healthCheck.data.isHealthy) setUseFallback(true);
    }
  }, [healthCheck.data]);

  // Mutation D-ID animateWithText (texto → vídeo animado diretamente)
  const animateMutation = trpc.livePortrait.animateWithText.useMutation({
    onSuccess: (data) => {
      setVideoUrl(data.videoUrl);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
      setUseFallback(true);
      if (text) speakFallback(text);
    },
  });

  // Animação CSS da boca (fallback)
  const animateMouth = useCallback(() => {
    let t = 0;
    const animate = () => {
      t += 0.18;
      const open = Math.abs(Math.sin(t)) * 0.85 + Math.random() * 0.15;
      setMouthOpen(open);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const stopMouthAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setMouthOpen(0);
  }, []);

  // Edge TTS Neural fallback — voz natural via servidor
  const speakFallback = useCallback(
    (textToSpeak: string) => {
      stopEdgeTTS();
      setIsSpeaking(true);
      animateMouth();
      speakNaturalVoice(textToSpeak, languageCode, {
        rate: 0.9,
        onEnd: () => {
          setIsSpeaking(false);
          stopMouthAnimation();
          onSpeakEnd?.();
        },
      });
    },
    [languageCode, animateMouth, stopMouthAnimation, onSpeakEnd]
  );

  // Legacy stub removido — Edge TTS substitui Web Speech API

  // Gerar vídeo D-ID
  const generateDIDVideo = useCallback(
    async (textToSpeak: string) => {
      if (!teacherPhotoUrl || !textToSpeak) {
        speakFallback(textToSpeak);
        return;
      }
      setIsLoading(true);
      setError(null);
      setVideoUrl(null);

      // Primeiro gerar áudio TTS para passar ao D-ID
      try {
        animateMutation.mutate({
          imageUrl: teacherPhotoUrl,
          text: textToSpeak,
          languageCode,
          voiceId,
        });
      } catch {
        setUseFallback(true);
        speakFallback(textToSpeak);
      }
    },
    [teacherPhotoUrl, animateMutation, speakFallback]
  );

  // Falar: decide entre D-ID e fallback
  const speak = useCallback(
    (textToSpeak: string) => {
      if (!textToSpeak) return;
      if (useFallback || !didAvailable) {
        speakFallback(textToSpeak);
      } else {
        generateDIDVideo(textToSpeak);
      }
    },
    [useFallback, didAvailable, speakFallback, generateDIDVideo]
  );

  // Auto-play quando texto muda
  useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay]);

  // Reproduzir vídeo D-ID quando pronto
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setUseFallback(true);
          if (text) speakFallback(text);
        });
    }
  }, [videoUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMouthAnimation();
      stopEdgeTTS();
    };
  }, []);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onSpeakEnd?.();
  };

  const isActive = isPlaying || isSpeaking;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Container do avatar */}
      <div className={`relative ${sizes.container} flex items-center justify-center`}>
        {/* Anel de atividade */}
        {isActive && (
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-pulse opacity-60 z-10" />
        )}
        {isLoading && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-spin opacity-40 z-10" />
        )}

        {/* Vídeo D-ID (quando disponível) */}
        {videoUrl && !useFallback ? (
          <video
            ref={videoRef}
            className={`${sizes.video} rounded-full object-cover shadow-2xl`}
            onEnded={handleVideoEnd}
            playsInline
            muted={false}
          />
        ) : (
          /* Foto estática com overlay de boca animada */
          <div className={`relative ${sizes.photo} rounded-full overflow-hidden shadow-2xl`}>
            {teacherPhotoUrl ? (
              <img
                src={teacherPhotoUrl}
                alt={teacherName}
                className="w-full h-full object-cover object-top"
                style={{
                  filter: isActive
                    ? "brightness(1.05) saturate(1.1)"
                    : "brightness(1)",
                  transition: "filter 0.3s ease",
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {teacherName.charAt(0)}
                </span>
              </div>
            )}

            {/* Overlay da boca animada (fallback) */}
            {isSpeaking && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "72%",
                  transform: "translate(-50%, -50%)",
                  width: `${Math.max(8, mouthOpen * 28)}px`,
                  height: `${Math.max(3, mouthOpen * 16)}px`,
                  background:
                    mouthOpen > 0.08
                      ? "rgba(10, 2, 2, 0.92)"
                      : "rgba(80, 30, 30, 0.5)",
                  borderRadius: "50%",
                  transition: "all 45ms ease-out",
                  zIndex: 5,
                  boxShadow: mouthOpen > 0.2 ? "inset 0 2px 4px rgba(0,0,0,0.8)" : "none",
                }}
              />
            )}

            {/* Overlay de loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Badge de status */}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 animate-pulse">
              {isPlaying ? "▶ D-ID" : "🎙 Falando"}
            </Badge>
          </div>
        )}
      </div>

      {/* Nome do professor */}
      <div className="text-center">
        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
          {teacherName}
        </p>
        {didAvailable && !useFallback && (
          <p className="text-xs text-purple-500">✨ D-ID Animado</p>
        )}
      </div>

      {/* Controles */}
      {showControls && text && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => speak(text)}
            disabled={isLoading || isActive}
            className="gap-1 text-xs"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isActive ? (
              <MicOff className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
            {isLoading ? "Gerando..." : isActive ? "Falando..." : "Ouvir"}
          </Button>
          {(isPlaying || isSpeaking) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                stopEdgeTTS();
                videoRef.current?.pause();
                setIsPlaying(false);
                setIsSpeaking(false);
                stopMouthAnimation();
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              ✕ Parar
            </Button>
          )}
          {error && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setError(null);
                setUseFallback(true);
                if (text) speakFallback(text);
              }}
              className="text-xs gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Tentar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
