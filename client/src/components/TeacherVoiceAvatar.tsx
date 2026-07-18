/**
 * ═══════════════════════════════════════════════════════════════════
 * client/src/components/TeacherVoiceAvatar.tsx
 * Avatar de Professor com Voz Natural e Lip-Sync
 * Coqui XTTS v2 + Claude Lip-Sync
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface TeacherVoiceAvatarProps {
  teacherName: string;
  teacherPhotoUrl: string;
  languageCode: string;
  text: string;
  gender?: "male" | "female";
  speed?: number;
  emotion?: "neutral" | "happy" | "sad" | "angry" | "surprised";
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  autoPlay?: boolean;
}

export const TeacherVoiceAvatar: React.FC<TeacherVoiceAvatarProps> = ({
  teacherName,
  teacherPhotoUrl,
  languageCode,
  text,
  gender = "female",
  speed = 1.0,
  emotion = "neutral",
  onSpeakingStart,
  onSpeakingEnd,
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthState, setMouthState] = useState(0); // 0-8 viseme

  // Queries tRPC
  const synthesizeMutation = trpc.voice.tts.synthesize.useMutation();
  const lipSyncMutation = trpc.voice.lipSync.generate.useMutation();

  // Gerar voz e lip-sync
  useEffect(() => {
    if (!text || !languageCode) return;

    const generateVoiceAndLipSync = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Gerar áudio com TTS
        const ttsResult = await synthesizeMutation.mutateAsync({
          text,
          languageCode,
          gender,
          speed,
          emotion,
        });

        if (!ttsResult.success || !ttsResult.data) {
          throw new Error(ttsResult.error || "Erro ao gerar áudio");
        }

        // Gerar lip-sync com Claude
        const lipSyncResult = await lipSyncMutation.mutateAsync({
          text,
          language: languageCode,
          fps: 30,
        });

        if (!lipSyncResult.success || !lipSyncResult.data) {
          throw new Error(lipSyncResult.error || "Erro ao gerar lip-sync");
        }

        // Carregar áudio
        if (audioRef.current && ttsResult.data) {
          audioRef.current.src = ttsResult.data.audioUrl;
          if (autoPlay) {
            audioRef.current.play();
            setIsSpeaking(true);
            onSpeakingStart?.();
          }
        }

        // Sincronizar lip-sync com áudio
        if (lipSyncResult.data) {
          syncLipSyncWithAudio(lipSyncResult.data.frames);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    generateVoiceAndLipSync();
  }, [text, languageCode, gender, speed, emotion]);

  // Sincronizar lip-sync com áudio
  const syncLipSyncWithAudio = (frames: any[]) => {
    if (!audioRef.current) return;

    const updateMouthState = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      const currentTimeMs = currentTime * 1000;

      // Encontrar frame correspondente ao tempo atual
      const currentFrame = frames.find(
        (f) => f.timestamp <= currentTimeMs && currentTimeMs < f.timestamp + 33 // ~30fps
      );

      if (currentFrame) {
        setMouthState(currentFrame.viseme);
        drawMouthAnimation(currentFrame);
      }
    };

    const animationId = setInterval(updateMouthState, 33); // ~30fps

    audioRef.current.addEventListener("ended", () => {
      clearInterval(animationId);
      setIsSpeaking(false);
      setMouthState(0);
      onSpeakingEnd?.();
    });

    return () => clearInterval(animationId);
  };

  // Desenhar animação de boca
  const drawMouthAnimation = (frame: any) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Desenhar boca baseada em viseme
    ctx.fillStyle = "#000";
    ctx.beginPath();

    const mouthOpen = frame.mouthOpen || 0;
    const mouthWidth = frame.mouthWidth || 0;
    const jawOpen = frame.jawOpen || 0;

    // Elipse da boca
    const radiusX = 30 * mouthWidth;
    const radiusY = 20 * mouthOpen;

    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar queixo
    if (jawOpen > 0) {
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 25, 15 * jawOpen, 0, Math.PI);
      ctx.stroke();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg shadow-lg">
      {/* Foto do Professor */}
      <div className="relative w-32 h-32">
        <img
          src={teacherPhotoUrl}
          alt={teacherName}
          className="w-full h-full rounded-full object-cover border-4 border-purple-500 shadow-md"
        />
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse" />
        )}
      </div>

      {/* Nome do Professor */}
      <h3 className="text-xl font-bold text-gray-800">{teacherName}</h3>

      {/* Canvas de Animação de Boca */}
      <canvas
        ref={canvasRef}
        width={120}
        height={60}
        className="border-2 border-gray-300 rounded bg-white"
      />

      {/* Status */}
      <div className="text-center">
        {isLoading && (
          <p className="text-sm text-blue-600 font-semibold">
            🎤 Gerando voz natural com lip-sync...
          </p>
        )}
        {error && <p className="text-sm text-red-600">❌ {error}</p>}
        {isSpeaking && (
          <p className="text-sm text-green-600 font-semibold">
            🔊 Falando ({languageCode})...
          </p>
        )}
        {!isLoading && !isSpeaking && !error && (
          <p className="text-sm text-gray-600">Pronto para falar</p>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (audioRef.current) {
              if (isSpeaking) {
                audioRef.current.pause();
              } else {
                audioRef.current.play();
              }
              setIsSpeaking(!isSpeaking);
            }
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isSpeaking ? "⏸ Pausar" : "▶ Reproduzir"}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setMouthState(0);
              setIsSpeaking(false);
            }
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          🔄 Reiniciar
        </button>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} />

      {/* Informações */}
      <div className="text-xs text-gray-600 text-center">
        <p>🎤 Voz: Coqui XTTS v2 (Natural)</p>
        <p>👄 Lip-Sync: Claude AI (Perfeito)</p>
        <p>🌍 Idioma: {languageCode}</p>
        <p>⚡ Qualidade: {lipSyncMutation.data?.quality || 0}/100</p>
      </div>
    </div>
  );
};

export default TeacherVoiceAvatar;
